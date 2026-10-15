<template>
  <v-dialog
    v-model="store.showFullscreenPlayer"
    fullscreen
    :scrim="false"
    transition="dialog-bottom-transition"
    z-index="9000"
    :retain-focus="false"
    persistent
    no-click-animation
  >
    <div
      ref="stageRef"
      class="am-fs"
      data-player-panel
      :data-layout="layout"
      :data-panel="panel"
    >
      <ArtworkBackdrop :palette="palette" />

      <PanelDragHandle
        v-if="layout === 'phone-portrait'"
        swipe-anywhere
        class="am-fs__grabber"
        @dismiss="close"
      />
      <GlassSurface
        v-else
        as="button"
        tone="backdrop"
        class="am-fs__close"
        :aria-label="$t('tooltip.close_fullscreen')"
        @click="close"
      >
        <ChevronDownIcon class="size-5" />
      </GlassSurface>

      <div class="am-fs__stage">
        <!-- ===== wide: artwork and controls left, lyrics or queue right ===== -->
        <template v-if="wide">
          <section class="am-fs__left">
            <AmusicCover
              class="am-fs__art"
              :image-url="media?.image_url"
              :seed="seed"
              :title="media?.title"
              :radius="16"
            />
            <FsTitleRow
              size="compact"
              :title="title"
              :subtitle="subtitleLong"
              @more="openMoreMenu"
            />
            <FsControls size="compact" :show-room="true" />
          </section>
          <section class="am-fs__right" data-no-panel-drag>
            <FsLyricsPanel
              v-if="panel === 'lyrics'"
              :lyrics="lyrics"
              :state="lyricsState"
              :elapsed-time="elapsedTime"
              :offset="offset"
            />
            <FsQueuePanel v-else />
          </section>
          <FsViewToggle
            class="am-fs__toggle"
            :panel="panel"
            :lyrics-available="lyricsAvailable"
            @select="setPanel"
          />
        </template>

        <!-- ===== phone landscape: artwork (or panel) left, controls right ===== -->
        <template v-else-if="layout === 'phone-landscape'">
          <section class="am-fs__left" data-no-panel-drag>
            <AmusicCover
              v-if="panel === 'none'"
              class="am-fs__art"
              :image-url="media?.image_url"
              :seed="seed"
              :title="media?.title"
            />
            <FsLyricsPanel
              v-else-if="panel === 'lyrics'"
              size="compact"
              :lyrics="lyrics"
              :state="lyricsState"
              :elapsed-time="elapsedTime"
              :offset="offset"
            />
            <FsQueuePanel v-else />
          </section>
          <section class="am-fs__right">
            <FsTitleRow
              size="compact"
              :title="title"
              :subtitle="subtitleShort"
              @more="openMoreMenu"
            />
            <FsControls size="compact" :show-shuffle-repeat="false" />
            <FsDock
              :panel="panel"
              :lyrics-available="lyricsAvailable"
              @toggle="togglePanel"
            />
          </section>
        </template>

        <!-- ===== stacked (phone / tablet portrait) ===== -->
        <template v-else>
          <template v-if="panel === 'none'">
            <AmusicCover
              class="am-fs__art"
              :image-url="media?.image_url"
              :seed="seed"
              :title="media?.title"
              :radius="14"
            />
            <FsTitleRow
              class="am-fs__title"
              :title="title"
              :subtitle="subtitleShort"
              @more="openMoreMenu"
            />
          </template>
          <template v-else>
            <!-- spec: the artwork collapses into a header when a panel opens -->
            <FsTitleRow
              class="am-fs__header"
              size="compact"
              :title="title"
              :subtitle="subtitleShort"
              @more="openMoreMenu"
            >
              <template #thumb>
                <AmusicCover
                  class="am-fs__thumb"
                  :image-url="media?.image_url"
                  :seed="seed"
                  :radius="8"
                  :show-title="false"
                />
              </template>
            </FsTitleRow>
            <section class="am-fs__panel" data-no-panel-drag>
              <FsLyricsPanel
                v-if="panel === 'lyrics'"
                size="compact"
                :lyrics="lyrics"
                :state="lyricsState"
                :elapsed-time="elapsedTime"
                :offset="offset"
              />
              <FsQueuePanel v-else />
            </section>
          </template>
          <FsControls class="am-fs__controls" />
          <FsDock
            class="am-fs__dock"
            :panel="panel"
            :lyrics-available="lyricsAvailable"
            @toggle="togglePanel"
          />
        </template>
      </div>
    </div>
  </v-dialog>
</template>

<script setup lang="ts">
import { ChevronDownIcon } from "@lucide/vue";
import { computed, markRaw, onBeforeUnmount, ref, watch } from "vue";
import { useEventListener } from "@vueuse/core";
import PanelDragHandle from "@/components/PanelDragHandle.vue";
import { setStatusBarColorOverride } from "@/composables/useStatusBarColor";
import { getPlayerMenuItems } from "@/helpers/player_menu_items";
import LyricsOffsetMenuControl from "@/layouts/default/PlayerOSD/LyricsOffsetMenuControl.vue";
import { eventbus } from "@/plugins/eventbus";
import { store } from "@/plugins/store";
import AmusicCover from "@/amusic/components/AmusicCover.vue";
import ArtworkBackdrop from "@/amusic/components/ArtworkBackdrop.vue";
import GlassSurface from "@/amusic/components/GlassSurface.vue";
import {
  isPhoneLayout,
  isStackedLayout,
  useAmusicLayout,
} from "@/amusic/composables/useAmusicLayout";
import { useNowPlayingLyrics } from "@/amusic/composables/useNowPlayingLyrics";
import {
  coverSeed,
  useNowPlayingPalette,
} from "@/amusic/composables/useNowPlayingPalette";
import { requestedFullscreenPanel } from "@/amusic/state";
import FsControls from "./FsControls.vue";
import FsDock, { type FsPanel } from "./FsDock.vue";
import FsLyricsPanel from "./FsLyricsPanel.vue";
import FsQueuePanel from "./FsQueuePanel.vue";
import FsTitleRow from "./FsTitleRow.vue";
import FsViewToggle from "./FsViewToggle.vue";

const stageRef = ref<HTMLElement>();
// the dialog fills the window, so its box is the window until it mounts
const layout = useAmusicLayout(stageRef);
const wide = computed(
  () => !isPhoneLayout(layout.value) && !isStackedLayout(layout.value),
);

const { media, palette } = useNowPlayingPalette();
const seed = computed(() => (media.value ? coverSeed(media.value) : ""));

const title = computed(
  () => media.value?.title ?? store.activePlayer?.name ?? "",
);
const subtitleShort = computed(() => media.value?.artist ?? "");
const subtitleLong = computed(() =>
  [media.value?.artist, media.value?.album].filter(Boolean).join(" — "),
);

// ---- panel state: lyrics are local, the queue is upstream's store flag so the
// bar's queue button and the queue composable keep working unchanged
const showLyrics = ref(false);
const isOpen = computed(() => store.showFullscreenPlayer);
const {
  lyrics,
  state: lyricsState,
  offset,
  elapsedTime,
  isEpisode,
} = useNowPlayingLyrics(isOpen, showLyrics);
const lyricsAvailable = computed(
  () => lyricsState.value === "available" || lyricsState.value === "loading",
);

const panel = computed<FsPanel>(() =>
  showLyrics.value ? "lyrics" : store.showQueueItems ? "queue" : "none",
);

function setPanel(next: FsPanel) {
  showLyrics.value = next === "lyrics";
  store.showQueueItems = next === "queue";
}

function togglePanel(next: Exclude<FsPanel, "none">) {
  setPanel(panel.value === next ? "none" : next);
}

// a panel asked for by whoever opened us (the bar's lyrics / queue actions)
watch(
  isOpen,
  (open) => {
    if (!open || requestedFullscreenPanel.value === null) return;
    setPanel(requestedFullscreenPanel.value);
    requestedFullscreenPanel.value = null;
  },
  { immediate: true },
);

// wide layouts always show a panel: lyrics when there are any, else the queue
watch(
  [wide, isOpen, panel],
  () => {
    if (wide.value && isOpen.value && panel.value === "none") {
      setPanel(lyricsState.value === "unavailable" ? "queue" : "lyrics");
    }
  },
  { immediate: true },
);

// lyrics opened optimistically turned out to be missing: fall back
watch(lyricsState, (state) => {
  if (showLyrics.value && (state === "unavailable" || state === "none")) {
    setPanel(wide.value ? "queue" : "none");
  }
});

function close() {
  store.showFullscreenPlayer = false;
}

// persistent dialog: Escape is ours to handle
useEventListener(window, "keydown", (e: KeyboardEvent) => {
  // an open popover or menu (quality details, more options) takes Escape first
  if (document.querySelector('[data-slot="popover-content"], [role="menu"]')) {
    return;
  }
  if (
    e.key === "Escape" &&
    store.showFullscreenPlayer &&
    !store.dialogActive &&
    !store.showPlayersMenu
  ) {
    close();
  }
});

function openMoreMenu(evt: Event) {
  if (!store.activePlayer) return;
  const items = getPlayerMenuItems(
    store.activePlayer,
    store.activePlayerQueue,
    {
      context: "queue",
    },
  );
  if (showLyrics.value) {
    items.unshift({
      label: isEpisode.value ? "transcript_offset" : "lyrics_offset",
      component: markRaw(LyricsOffsetMenuControl),
    });
  }
  eventbus.emit("contextmenu", {
    items,
    posX: (evt as PointerEvent).clientX,
    posY: (evt as PointerEvent).clientY,
  });
}

// the browser chrome on phones takes the backdrop's deep colour
watch(
  [isOpen, palette],
  ([open]) => setStatusBarColorOverride(open ? palette.value?.deep : undefined),
  { immediate: true },
);
onBeforeUnmount(() => setStatusBarColorOverride(undefined));
</script>

<style scoped>
.am-fs {
  --text-color: #fff;
  --text-color-inverse: #000;
  --overlay-bg: rgb(0 0 0 / 0.4);
  --overlay-border: rgb(255 255 255 / 0.25);
  --overlay-fg: #fff;
  --overlay-muted-bg: rgb(255 255 255 / 0.1);
  --overlay-muted-hover: rgb(255 255 255 / 0.16);
  --overlay-muted-border: rgb(255 255 255 / 0.2);
  position: relative;
  width: 100%;
  height: 100dvh;
  overflow: hidden;
  color: #fff;
  background: #121216;
  font-family: inherit;
}

.am-fs__close {
  position: absolute;
  top: calc(18px + var(--device-inset-top, 0px));
  left: calc(20px + var(--device-inset-left, 0px));
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: max(38px, var(--am-target));
  height: max(38px, var(--am-target));
  border-radius: 999px;
  color: #fff;
  cursor: pointer;
}

.am-fs__grabber {
  position: absolute;
  top: calc(6px + var(--device-inset-top, 0px));
  left: 0;
  right: 0;
  z-index: 2;
}

/* pinned rather than in flow: the drag handle's own styles keep it in flow */
.am-fs__stage {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  margin: 0 auto;
  padding: calc(var(--device-inset-top, 0px) + 28px)
    calc(var(--device-inset-right, 0px) + 28px)
    calc(var(--device-inset-bottom, 0px) + 24px)
    calc(var(--device-inset-left, 0px) + 28px);
}

/* ---------- stacked: phone portrait / tablet portrait ---------- */
.am-fs[data-layout="phone-portrait"] .am-fs__stage,
.am-fs[data-layout="tablet-portrait"] .am-fs__stage {
  flex-direction: column;
  align-items: center;
  gap: 0;
}

.am-fs[data-layout="phone-portrait"] .am-fs__stage {
  padding-top: calc(var(--device-inset-top, 0px) + 40px);
}

.am-fs[data-layout="phone-portrait"] .am-fs__stage > *,
.am-fs[data-layout="tablet-portrait"] .am-fs__stage > * {
  width: 100%;
}

.am-fs[data-layout="tablet-portrait"] .am-fs__stage > * {
  /* spec: controls capped and centred on tall tablets */
  max-width: 520px;
}

.am-fs[data-layout="tablet-portrait"] .am-fs__stage {
  padding-top: calc(var(--device-inset-top, 0px) + 72px);
}

.am-fs[data-layout="phone-portrait"] .am-fs__art,
.am-fs[data-layout="tablet-portrait"] .am-fs__art {
  /* as big as fits beside the controls, never taller than wide */
  width: min(100%, 52dvh) !important;
  /* centred in whatever height the controls leave, so tall screens share the
     slack above and below the artwork instead of piling it under it */
  margin-block: auto;
  box-shadow: 0 30px 60px rgb(0 0 0 / 0.45);
}

.am-fs[data-layout="phone-portrait"] .am-fs__title,
.am-fs[data-layout="tablet-portrait"] .am-fs__title {
  padding-top: 8px;
}

.am-fs__header {
  padding-bottom: 8px;
}

.am-fs__thumb {
  width: 64px;
  flex-shrink: 0;
  box-shadow: 0 10px 24px rgb(0 0 0 / 0.3);
}

.am-fs[data-layout="tablet-portrait"] .am-fs__thumb {
  width: 84px;
}

.am-fs__panel {
  flex: 1;
  min-height: 0;
}

.am-fs[data-layout="tablet-portrait"] .am-fs__panel {
  max-width: none;
}

.am-fs__controls {
  padding-top: 22px;
}

.am-fs__dock {
  margin-top: 22px;
  align-self: center;
}

/* ---------- phone landscape ---------- */
.am-fs[data-layout="phone-landscape"] .am-fs__stage {
  align-items: center;
  gap: 28px;
  padding-top: calc(var(--device-inset-top, 0px) + 16px);
  padding-bottom: calc(var(--device-inset-bottom, 0px) + 12px);
  padding-left: calc(var(--device-inset-left, 0px) + 72px);
}

.am-fs[data-layout="phone-landscape"] .am-fs__left {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  aspect-ratio: 1;
  flex-shrink: 0;
}

.am-fs[data-layout="phone-landscape"] .am-fs__left .am-fs__art {
  height: 100%;
  width: auto !important;
}

.am-fs[data-layout="phone-landscape"] .am-fs__right {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  min-width: 0;
}

.am-fs[data-layout="phone-landscape"] .am-fs__right :deep(.fs-dock) {
  align-self: center;
}

/* ---------- wide: tablet landscape / desktop ---------- */
.am-fs[data-layout="tablet-landscape"] .am-fs__stage,
.am-fs[data-layout="desktop"] .am-fs__stage {
  align-items: center;
  gap: clamp(48px, 6vw, 110px);
  max-width: 1500px;
  padding-left: clamp(64px, 8vw, 150px);
  padding-right: clamp(40px, 6vw, 110px);
}

.am-fs[data-layout="tablet-landscape"] .am-fs__left,
.am-fs[data-layout="desktop"] .am-fs__left {
  display: flex;
  flex-direction: column;
  gap: 22px;
  /* the column follows the height, so the transport always fits on screen */
  width: min(440px, calc(100dvh - 330px), 40%);
  flex-shrink: 0;
}

.am-fs[data-layout="tablet-landscape"] .am-fs__left {
  gap: 16px;
}

.am-fs[data-layout="tablet-landscape"] .am-fs__art,
.am-fs[data-layout="desktop"] .am-fs__art {
  box-shadow: 0 40px 80px rgb(0 0 0 / 0.5);
}

.am-fs[data-layout="tablet-landscape"] .am-fs__right,
.am-fs[data-layout="desktop"] .am-fs__right {
  flex: 1;
  align-self: stretch;
  min-width: 0;
  padding: 12vh 0 10vh;
}

.am-fs__toggle {
  position: absolute;
  right: calc(28px + var(--device-inset-right, 0px));
  bottom: calc(24px + var(--device-inset-bottom, 0px));
}
</style>
