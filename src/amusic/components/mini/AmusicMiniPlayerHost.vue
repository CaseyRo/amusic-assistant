<template>
  <!-- document picture-in-picture shares this JS realm, so the mini player is
       rendered here and teleported into the other window's body -->
  <Teleport v-if="pipBody" :to="pipBody">
    <AmusicMiniPlayer />
  </Teleport>
</template>

<script setup lang="ts">
import AmusicMiniPlayer from "@/amusic/components/mini/AmusicMiniPlayer.vue";
import { useMiniPlayerWindow } from "@/amusic/composables/useMiniPlayerWindow";

const { pipBody } = useMiniPlayerWindow();
</script>
