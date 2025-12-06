<template>
  <div
    v-motion-fade
    :duration="700"
    class="bottom-audio elevation-5"
    v-if="bottomAudioComponentModel?.contentId > 0"
  >
    <v-container>
      <client-only>
        <div class="bottom-audio-inner">
          <div class="top-part">
            <div class="audio-info">
              <div class="audio-info-inner">
                <div class="close-btn-holder">
                  <v-icon
                    color="black"
                    icon="mdi-close"
                    size="15"
                    @click="close"
                  ></v-icon>
                </div>
                <div class="audio-info-text-holder">
                  <p>
                    <nuxt-link
                      :to="`/products/${bottomAudioComponentModel.contentType}/${bottomAudioComponentModel.contentId}`"
                      >{{ bottomAudioComponentModel.contentTitle }}</nuxt-link
                    >
                  </p>
                  <span>{{ bottomAudioComponentModel.episodeTitle }}</span>
                </div>
              </div>
            </div>
            <div v-if="!isVisible" class="text-center">در حال دانلود ...</div>

            <div v-if="isVisible">
              <span style="font-size: 13px"
                >{{ currentTime }} / {{ totalDuration }}</span
              >
            </div>
            <div v-if="isVisible" class="audio-left-part">
              <div class="audio-actions">
                <v-icon
                  v-if="bottomAudioComponentModel?.previousEpisodeId > 0"
                  class="opacity-50"
                  color="black"
                  icon="mdi-skip-next-circle"
                  size="27.5"
                ></v-icon>
                <v-icon
                  class="opacity-50 mx-1"
                  color="black"
                  :icon="isPaused ? 'mdi-play-circle' : 'mdi-pause-circle'"
                  size="30"
                  @click="waveSurfer?.playPause()"
                ></v-icon>
                <v-icon
                  v-if="bottomAudioComponentModel?.nextEpisodeId > 0"
                  class="opacity-50"
                  color="black"
                  icon="mdi-skip-previous-circle"
                  size="27.5"
                ></v-icon>
              </div>
              <div class="audio-image">
                <div class="audio-image-inner">
                  <img
                    class="elevation-3"
                    width="75"
                    height="85"
                    :src="bottomAudioComponentModel.imageUrl"
                  />
                </div>
              </div>
            </div>
          </div>
          <div v-show="isVisible" class="text-center mt-2">
            <WaveSurferPlayer
              v-if="options"
              :options="options"
              @play="isPaused = false"
              @pause="isPaused = true"
              @timeupdate="(time: number) => timeUpdateHandler(time)"
              @ready="(duration: number) => readyHandler(duration)"
              @waveSurfer="(ws: WaveSurfer) => readyWaveSurferHandler(ws)"
            />
          </div>
        </div>
      </client-only>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import type { BottomAudioModel } from "~/types/bottomAudioModel";
import useBottomAudioPlayer from "../../composables/useBottomAudioPlayer";
import { ROUTES } from "~/utilities/routes";
import { ref } from "vue";
import type WaveSurfer from "wavesurfer.js";
import { WaveSurferPlayer } from "@meersagor/wavesurfer-vue";

const {
  isPaused,
  waveSurfer,
  isVisible,
  currentTime,
  totalDuration,
  bottomAudioComponentModel,
  setCurrentAudio,
  timeUpdateHandler,
  readyHandler,
  readyWaveSurferHandler,
  close,
  formatTime,
  options,
} = useBottomAudioPlayer();

onMounted(() => {
  const bottomAudioDataJson = window.localStorage.getItem("bottomAudioData");
  if (bottomAudioDataJson) {
    try {
      const bottomAudioComponentModel = useState<BottomAudioModel>(
        "bottomAudioComponentModel"
      );
      bottomAudioComponentModel.value = JSON.parse(
        bottomAudioDataJson
      ) as BottomAudioModel;
    } catch (error) {
      console.error("Failed to parse stored data:", error);
    }
  } else setCurrentAudio();
});
</script>

<style scoped lang="scss">
.bottom-audio {
  position: fixed;
  bottom: 56px;
  width: 100%;
  background: #f5f5f5;
  color: black;
  padding: 12.5px 12.5px 10px 20px;
  border-radius: 20px 20px 0 0;
  z-index: 7;
  a {
    all: unset;
  }
  .v-container {
    padding: 0 !important;
  }
  .bottom-audio-inner .top-part {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .audio-info {
      .audio-info-inner {
        display: flex;
        align-items: center;
        .close-btn-holder {
          margin-left: 10px;
          opacity: 0.3;
        }
        p {
          font-weight: 900;
          font-size: 15px;
          line-height: 14px;
        }
        span {
          font-size: 13px;
        }
      }
    }
    .audio-left-part {
      display: flex;
      .audio-actions {
        margin-left: 12px;
      }
      .audio-image {
        position: relative;
        width: 65px;
        .audio-image-inner {
          img {
            z-index: 6;
            position: absolute;
            left: 0;
            bottom: -5px;
            border-radius: 10px;
          }
        }
      }
    }
  }
}
</style>
