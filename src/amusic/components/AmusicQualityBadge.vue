<template>
  <!-- spec: stream-quality-indicator. Hidden, with no space reserved, when the
       tier is unknown; opens MA's own signal-path details. -->
  <Popover
    v-if="chain && label"
    :open="open"
    @update:open="(value) => (open = !isReadonly && value)"
  >
    <PopoverTrigger as-child>
      <button
        type="button"
        class="am-quality"
        :data-tone="tone"
        :data-readonly="isReadonly || undefined"
        :style="{ '--tier': tierColor }"
        :aria-label="
          $t('show_audio_chain_details_for_quality', { quality: label })
        "
        @click.stop
      >
        <span class="am-quality__dot"></span>
        <span class="am-quality__tier">{{ label }}</span>
        <span v-if="showFormat && summary" class="am-quality__format">{{
          summary
        }}</span>
      </button>
    </PopoverTrigger>
    <PopoverContent
      v-if="activeAudioPath && !player"
      side="top"
      align="center"
      :collision-padding="8"
      class="audio-processing-popover overflow-y-auto"
    >
      <AudioProcessingDetails
        :chain="activeAudioPath.audioProcessing"
        :stream-details="activeAudioPath.streamDetails"
        :crossfade-intent="activeAudioPath.crossfadeIntent"
        :queue-id="activeAudioPath.queueId"
        :container="activeAudioPath.container"
        @navigate="open = false"
      />
    </PopoverContent>
  </Popover>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import AudioProcessingDetails from "@/components/AudioProcessingDetails.vue";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useActiveAudioPath } from "@/composables/useActiveAudioPath";
import {
  QualityTier,
  qualityTierRangeLabel,
  useStreamQuality,
} from "@/composables/useStreamQuality";
import { resolvePlayerQueue } from "@/plugins/api/helpers";
import type { Player } from "@/plugins/api/interfaces";
import { $t } from "@/plugins/i18n";
import { formatSummary } from "@/amusic/quality";

interface Props {
  /** "backdrop" for light-on-artwork surfaces, "app" for themed surfaces */
  tone?: "app" | "backdrop";
  showFormat?: boolean;
  /** shows the tier only; for windows the details popover cannot reach */
  readonly?: boolean;
  /** another room than the active one; always read-only */
  player?: Player;
}
const props = withDefaults(defineProps<Props>(), {
  tone: "app",
  showFormat: true,
  readonly: false,
  player: undefined,
});
const isReadonly = computed(() => props.readonly || !!props.player);

const open = ref(false);
const { activeAudioPath } = useActiveAudioPath();
// the details popover knows only the active room, so other rooms get the tier alone
const roomStreamDetails = computed(() => {
  if (!props.player) return undefined;
  const queue = resolvePlayerQueue(props.player);
  return queue?.active ? queue.current_item?.streamdetails : undefined;
});
const chain = computed(() =>
  props.player
    ? roomStreamDetails.value?.audio_processing
    : activeAudioPath.value?.audioProcessing,
);
const { minOutputQualityTier, maxOutputQualityTier } = useStreamQuality(chain);

const label = computed(() =>
  qualityTierRangeLabel(minOutputQualityTier.value, maxOutputQualityTier.value),
);

// MA's tier hues, tuned to read as badges on glass rather than flat chips
const TIER_COLORS: Record<number, string> = {
  [QualityTier.UNKNOWN]: "#8A8A90",
  [QualityTier.LOW]: "#F08C1E",
  [QualityTier.GOOD]: "#7ED957",
  [QualityTier.LOSSLESS]: "#2EB866",
  [QualityTier.HIRES]: "#22C3E6",
};
const tierColor = computed(() => TIER_COLORS[maxOutputQualityTier.value]);

const summary = computed(() =>
  formatSummary(
    (props.player
      ? roomStreamDetails.value
      : activeAudioPath.value?.streamDetails
    )?.audio_format,
  ),
);
</script>

<style scoped>
.am-quality {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 22px;
  padding: 0 8px;
  border-radius: 11px;
  border: 1px solid color-mix(in srgb, var(--tier) 50%, transparent);
  background: color-mix(in srgb, var(--tier) 14%, transparent);
  font-size: 11px;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
}

.am-quality[data-readonly] {
  cursor: default;
}

/* the pill stays small; the hit area grows to the touch target */
.am-quality::before {
  content: "";
  position: absolute;
  inset: calc((22px - var(--am-target)) / 2) 0;
}

.am-quality__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--tier);
}

.am-quality__tier {
  font-weight: 800;
  letter-spacing: 0.06em;
  color: color-mix(in srgb, var(--tier) 65%, black);
}

.am-quality__format {
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.7);
}

:root.dark .am-quality__tier,
.am-quality[data-tone="backdrop"] .am-quality__tier {
  color: color-mix(in srgb, var(--tier) 45%, white);
}

.am-quality[data-tone="backdrop"] .am-quality__format {
  color: rgb(255 255 255 / 0.72);
}
</style>
