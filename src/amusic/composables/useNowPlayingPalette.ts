import { computed } from "vue";
import { store } from "@/plugins/store";
import {
  type AmPalette,
  fromServerPalette,
  generatedPalette,
} from "@/amusic/palette";

/**
 * Seed for a generated cover: the album when we know it, so every track of an
 * album shares one cover, else the media itself.
 */
export function coverSeed(media: {
  uri: string;
  artist?: string | null;
  album?: string | null;
}): string {
  return media.album ? `${media.artist ?? ""}|${media.album}` : media.uri;
}

/**
 * The palette of what the active player is playing: the server's artwork
 * palette, else the generated cover's. Null when nothing is loaded.
 */
export function useNowPlayingPalette() {
  const media = computed(() => store.activePlayer?.current_media ?? null);

  const hasArtwork = computed(() => !!media.value?.image_url);

  const palette = computed<AmPalette | null>(() => {
    if (!media.value) return null;
    return (
      (hasArtwork.value ? fromServerPalette(media.value.palette) : null) ??
      generatedPalette(coverSeed(media.value))
    );
  });

  return { media, hasArtwork, palette };
}
