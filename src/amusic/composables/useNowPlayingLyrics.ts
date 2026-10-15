import { computed, type Ref, ref, watch } from "vue";
import { useLyricsElapsedTime } from "@/composables/lyrics/useLyricsElapsedTime";
import { useLyricsOffset } from "@/composables/lyrics/useLyricsOffset";
import api from "@/plugins/api";
import {
  MediaType,
  type TranscriptCue,
  type Track,
} from "@/plugins/api/interfaces";
import { store } from "@/plugins/store";

/** Past this, a silent server counts as "no lyrics" instead of a spinner forever. */
export const LYRICS_TIMEOUT_MS = 12_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("lyrics lookup timed out")), ms),
    ),
  ]);
}

export type LyricsState = "available" | "loading" | "unavailable" | "none";

/** Timed transcript cues in the LRC form the lyrics viewer reads. */
const cuesToLrc = (cues: TranscriptCue[]) =>
  cues
    .map((cue) => {
      const mm = String(Math.floor(cue.start / 60)).padStart(2, "0");
      const ss = String(Math.floor(cue.start % 60)).padStart(2, "0");
      const hh = String(Math.floor((cue.start % 1) * 100)).padStart(2, "0");
      return `[${mm}:${ss}.${hh}]${cue.text}`;
    })
    .join("\n");

/**
 * Lyrics (or a podcast transcript) for what is playing, fetched while the
 * fullscreen player is open. Ported from upstream PlayerFullscreen.vue, which
 * keeps this inline; behaviour is kept identical apart from the manual
 * transcript-sync toggle, which amusic does not surface.
 */
export function useNowPlayingLyrics(
  isOpen: Ref<boolean>,
  lyricsShown: Ref<boolean>,
) {
  const item = computed(() => store.curQueueItem?.media_item);
  const isEpisode = computed(
    () => item.value?.media_type === MediaType.PODCAST_EPISODE,
  );
  const isTrack = computed(() => item.value?.media_type === MediaType.TRACK);
  // an episode its provider marked as having no transcript is not asked for
  const hasReadableText = computed(
    () =>
      isTrack.value ||
      (isEpisode.value && item.value?.metadata?.has_transcript !== false),
  );

  const lyrics = ref<{ plain: string | null; synced: string | null }>({
    plain: null,
    synced: null,
  });
  const loading = ref(false);

  const state = computed<LyricsState>(() => {
    if (!store.curQueueItem || !hasReadableText.value) return "none";
    if (loading.value) return "loading";
    const { plain, synced } = lyrics.value;
    return plain?.trim() || synced?.trim() ? "available" : "unavailable";
  });

  let generation = 0;
  async function fetchLyrics() {
    const current = ++generation;
    lyrics.value = { plain: null, synced: null };
    const media = item.value;
    loading.value = hasReadableText.value && isOpen.value;
    if (!isOpen.value || !media || !hasReadableText.value) {
      loading.value = false;
      return;
    }
    try {
      if (isEpisode.value) {
        const [text, cues] = await withTimeout(
          api.getPodcastEpisodeTranscript(media.item_id, media.provider),
          LYRICS_TIMEOUT_MS,
        );
        if (current !== generation) return;
        lyrics.value = {
          plain: text,
          synced: cues?.length ? cuesToLrc(cues) : null,
        };
        return;
      }
      const track = media as Track;
      const plain = track.metadata.lyrics?.trim() || null;
      const synced = track.metadata.lrc_lyrics?.trim() || null;
      if (plain || synced) {
        lyrics.value = { plain, synced };
        return;
      }
      const [fetchedPlain, fetchedSynced] = await withTimeout(
        api.getTrackLyrics(track),
        LYRICS_TIMEOUT_MS,
      );
      if (current !== generation) return;
      lyrics.value = { plain: fetchedPlain, synced: fetchedSynced };
      if (fetchedPlain || fetchedSynced) {
        track.metadata = {
          ...track.metadata,
          ...(fetchedPlain && { lyrics: fetchedPlain }),
          ...(fetchedSynced && { lrc_lyrics: fetchedSynced }),
        };
      }
    } catch (error) {
      if (current === generation) console.error("amusic: lyrics fetch", error);
    } finally {
      if (current === generation) loading.value = false;
    }
  }

  const { offset, reset: resetOffset } = useLyricsOffset();
  // a track's offset covers speaker latency and carries over; an episode's
  // corrects that episode's drift, so it resets when an episode starts or ends
  let offsetForEpisode = false;
  watch(
    () => store.curQueueItem?.queue_item_id,
    () => {
      if (isEpisode.value || offsetForEpisode) resetOffset();
      offsetForEpisode = isEpisode.value;
      fetchLyrics();
    },
    { immediate: true },
  );
  watch(isOpen, (open) => open && fetchLyrics());

  // the ~60fps clock only runs while the lyrics are actually on screen
  const { elapsedTime } = useLyricsElapsedTime(
    computed(() => isOpen.value && lyricsShown.value),
  );

  return { lyrics, state, isEpisode, offset, elapsedTime };
}
