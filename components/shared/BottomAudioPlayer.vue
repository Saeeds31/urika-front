<template>
  <div
    v-motion-fade
    :duration="700"
    class="bottom-audio elevation-5"
    v-if="bottomAudioComponentModel?.contentId > 0"
  >
    <v-container>
      <BarPlayer
        ref="playerRef"
        :audio-url="bottomAudioComponentModel.url"
        :audio-data="bottomAudioComponentModel"
        :initial-time="bottomAudioComponentModel.latestPlayedSoccond || 0"
        @play="handlePlay"
        @pause="handlePause"
        @timeupdate="handleTimeUpdate"
        @ended="handleEnded"
        @next="goToNextEpisode"
        @previous="goToPreviousEpisode"
        @loaded="handlePlayerReady"
        :key="`${bottomAudioComponentModel.contentId}-${bottomAudioComponentModel.episodeId}`"
      />

      <div class="close-btn" @click="closeAudioPlayer">
        <v-icon size="18" color="#999">mdi-close</v-icon>
      </div>
    </v-container>
  </div>
</template>

<style scoped lang="scss">
.bottom-audio {
  position: fixed;
  bottom: 56px;
  width: 100%;
  background: white;
  padding: 8px 12px 10px 20px;
  border-radius: 20px 20px 0 0;
  z-index: 7;
  box-shadow: 0 -2px 20px rgba(0, 0, 0, 0.08);

  .v-container {
    padding: 0 !important;
    position: relative;
  }

  .close-btn {
    position: absolute;
    top: 6px;
    left: 12px;
    cursor: pointer;
    opacity: 0.4;
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.8;
    }
  }
}

@media (max-width: 600px) {
  .bottom-audio {
    padding: 6px 10px 8px 16px;
    bottom: 50px;
  }
}
</style>

<script lang="ts">
import { defineComponent } from "vue";
import useBottomAudioPlayer from "~/composables/useBottomAudioPlayer";

export default defineComponent({
  name: "BottomAudio",

  setup() {
    // نکته: useBottomAudioPlayer خودش در onMounted از localStorage می‌خواند.
    // اینجا فقط مقادیر را از composable می‌گیریم.
    const {
      playerRef,
      bottomAudioComponentModel,
      closeAudioPlayer,
      handlePlay,
      handlePause,
      handleTimeUpdate,
      handleEnded,
      handlePlayerReady,
      goToNextEpisode,
      goToPreviousEpisode,
    } = useBottomAudioPlayer();

    return {
      playerRef,
      bottomAudioComponentModel,
      closeAudioPlayer,
      handlePlay,
      handlePause,
      handleTimeUpdate,
      handleEnded,
      handlePlayerReady,
      goToNextEpisode,
      goToPreviousEpisode,
    };
  },
});
</script>