<!-- components/BottomAudio.vue -->
<template>
  <div v-motion-fade :duration="700" class="bottom-audio elevation-5" v-if="bottomAudioComponentModel?.contentId > 0">
    <v-container>
      <!-- پلیر جدید با نمایش مستطیلی -->
      <BarPlayer ref="playerRef" :audio-url="bottomAudioComponentModel.url" :audio-data="bottomAudioComponentModel"
        :initial-time="bottomAudioComponentModel.latestPlayedSoccond || 0" @play="handlePlay" @pause="handlePause"
        @timeupdate="handleTimeUpdate" @ended="handleEnded" @next="goToNextEpisode" @previous="goToPreviousEpisode"
        @loaded="handlePlayerReady" :key="bottomAudioComponentModel.episodeId" />

      <!-- دکمه بستن -->
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
import { defineComponent, ref } from 'vue';
import useBottomAudioPlayer from '~/composables/useBottomAudioPlayer';
import { PRODUCT_TYPES } from '~/utilities/constants';
import type { BottomAudioModel } from '~/types/bottomAudioModel';

export default defineComponent({
  name: 'BottomAudio',

  setup() {
    const {
      playerRef,
      bottomAudioComponentModel,
      closeAudioPlayer,
      playEpisode,
      handlePlay,
      handlePause,
      handleTimeUpdate,
      handleEnded,
      handlePlayerReady,
      goToNextEpisode,
      goToPreviousEpisode,
    } = useBottomAudioPlayer();

    // بارگذاری از localStorage
    const loadFromStorage = () => {
      try {
        const stored = window.localStorage.getItem('bottomAudioData');
        if (stored) {
          const data = JSON.parse(stored) as BottomAudioModel;
          if (data?.contentId > 0) {
            bottomAudioComponentModel.value = data;

            // اگر اپیزود قبلی یا بعدی داشت و url خالی بود، دوباره دریافت کن
            if (!data.url && data.episodeId > 0) {
              playEpisode(
                data.contentId,
                PRODUCT_TYPES[data.contentType]?.id || 0,
                data.episodeId,
                data.latestPlayedSoccond || 0
              );
            }
          }
        }
      } catch (error) {
        console.error('Failed to load from localStorage:', error);
      }
    };

    // Lifecycle
    onMounted(() => {
      loadFromStorage();
    });

    return {
      playerRef,
      bottomAudioComponentModel,
      closeAudioPlayer,
      playEpisode,
      handlePlay,
      handlePause,
      handleTimeUpdate,
      handleEnded,
      handlePlayerReady,
      goToNextEpisode,
      goToPreviousEpisode,
    };
  }
});
</script>