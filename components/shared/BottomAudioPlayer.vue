<template>
  <div v-motion-fade :duration="700" class="bottom-audio elevation-5" v-if="bottomAudioComponentModel?.contentId > 0">
    <v-container>
      <div class="bottom-audio-inner">
        <div class="audio-info">
          <div class="audio-info-inner">
            <div class="close-btn-holder">
              <v-icon color="black" icon="mdi-close" size="15" @click="closeAudioPlayer"></v-icon>
            </div>
            <div class="audio-info-text-holder">
              <p>
                <nuxt-link
                  :to="`/products/${bottomAudioComponentModel.contentType}/${bottomAudioComponentModel.contentId}`">{{
                    bottomAudioComponentModel.contentTitle }}
                  <v-icon class="opacity-50" size="17">mdi-arrow-top-left-thick</v-icon>
                </nuxt-link>
              </p>
              <span>{{ bottomAudioComponentModel.episodeTitle }}</span>
            </div>
          </div>
        </div>
        <div class="downloading-progress-text" v-if="isInDownloading">
          <p>
            <strong>{{ convertToPersianDigits(downloadedPrecent.toString()) + "%" }}
            </strong>
            در حال دانلود ...
          </p>
        </div>
        <div v-show="!isInDownloading" class="audio-left-part">
          <div class="speed-dropdown">
            <button class="speed-btn">
              {{ playbackRate }}x
            </button>

            <div class="speed-menu">
              <div @click="changePlaybackRate(1)">1x</div>
              <div @click="changePlaybackRate(1.2)">1.2x</div>
              <div @click="changePlaybackRate(1.5)">1.5x</div>
            </div>
          </div>

          <div class="audio-actions text-center">
            <div>
              <v-icon :class="{
                disabled: bottomAudioComponentModel?.nextEpisodeId == 0,
              }" class="opacity-50" :color="bottomAudioComponentModel?.nextEpisodeId > 0
                ? 'black'
                : '#7b7b7b'
                " icon="mdi-skip-next" size="22.5" @click="
                  playEpisode(
                    bottomAudioComponentModel.contentId,
                    PRODUCT_TYPES[bottomAudioComponentModel.contentType].id,
                    bottomAudioComponentModel.nextEpisodeId
                  )
                  "></v-icon>
              <v-icon class="opacity-50 mx-1" color="black" icon="mdi-play-box" size="25" v-if="isPaused"
                @click="play"></v-icon>
              <v-icon class="opacity-50 mx-1" color="black" icon="mdi-pause-box" size="25" v-if="!isPaused"
                @click="pause"></v-icon>
              <v-icon class="opacity-50" :class="{
                disabled: bottomAudioComponentModel?.previousEpisodeId == 0,
              }" :color="bottomAudioComponentModel?.previousEpisodeId > 0
                ? 'black'
                : '#7b7b7b'
                " icon="mdi-skip-previous" size="22.5" @click="
                  playEpisode(
                    bottomAudioComponentModel.contentId,
                    PRODUCT_TYPES[bottomAudioComponentModel.contentType].id,
                    bottomAudioComponentModel.previousEpisodeId
                  )
                  "></v-icon>
            </div>
            <p class="audio-duration">{{ playedDuration }} / {{ duration }}</p>
          </div>
          <div class="audio-image">
            <div class="audio-image-inner">
              <img class="elevation-3" width="90" :src="bottomAudioComponentModel.imageUrl" />
            </div>
          </div>
        </div>
      </div>
      <div :style="{ opacity: isInDownloading ? 0.4 : 1, pointerEvents: isInDownloading ? 'none' : 'auto' }">
        <WaveSurferPlayer :options="options" :file="bottomAudioComponentModel.url" @play="handlePlay"
          @pause="handlePause" @ready="handleReady" @waveSurfer="handleWaveSurfer" @progress="handleProgress"
          @timeupdate="handleTimeUpdate" />
      </div>
      <div v-if="isInDownloading" class="downloading-progress">
        <v-progress-linear color="primary" class="rounded mt-2 mb-1" :model-value="downloadedPrecent"
          :height="9"></v-progress-linear>
      </div>
    </v-container>
  </div>
</template>
<style scoped lang="scss">
.disabled {
  pointer-events: none;
}

.downloading-progress-text {
  font-size: 14px;
  opacity: 0.6;

  strong {
    font-weight: 900;
  }
}

.audio-duration {
  font-size: 12px;
  margin-top: 5px;
  color: #bbbbbb;
}

.bottom-audio {
  position: fixed;
  bottom: 56px;
  width: 100%;
  background: white;
  padding: 12.5px 12.5px 10px 20px;
  border-radius: 20px 20px 0 0;
  z-index: 7;

  a {
    all: unset;
  }

  .v-container {
    padding: 0 !important;
  }

  .bottom-audio-inner {
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
        margin-left: 5px;
      }

      .audio-image {
        position: relative;
        width: 90px;

        .audio-image-inner {
          img {
            z-index: 6;
            position: absolute;
            left: -5px;
            bottom: 7.5px;
            border-radius: 10px;
          }
        }
      }
    }
  }
}

.speed-dropdown {
  position: relative;
  display: inline-block;

  .speed-btn {
    font-size: 12px;
    padding: 4px 8px;
    border-radius: 6px;
    background: #f3f3f3;
    cursor: pointer;
    border: none;
  }

  .speed-menu {
    position: absolute;
    bottom: 98%;
    right: 0;
    background: white;
    border-radius: 8px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    display: none;

    div {
      padding: 6px 12px;
      font-size: 12px;
      cursor: pointer;

      &:hover {
        background: #f5f5f5;
      }
    }
  }

  &:hover .speed-menu {
    display: block;
  }
}
</style>
<script lang="ts">
import type { BottomAudioModel } from "~/types/bottomAudioModel";
import useBottomAudioPlayer from "../../composables/useBottomAudioPlayer";
import { ROUTES } from "~/utilities/routes";
import { PRODUCT_TYPES } from "~/utilities/constants";

export default {
  setup() {
    const {
      setCurrentAudio,
      closeAudioPlayer,
      bottomAudioComponentModel,
      isPaused,
      handleWaveSurfer,
      handleReady,
      handleTimeUpdate,
      handlePause,
      handlePlay,
      playbackRate,
      changePlaybackRate,
      options,
      audioUrl,
      play,
      pause,
      handleProgress,
      isInDownloading,
      downloadedPrecent,
      playedDuration,
      duration,
      playEpisode,
    } = useBottomAudioPlayer();
    const productUrl = computed(() => {
      ROUTES.PRODUCTS.ITEM(
        bottomAudioComponentModel.value.contentType,
        bottomAudioComponentModel.value.contentId
      );
    });
    function convertToPersianDigits(input) {
      const englishDigits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
      const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

      return input.replace(
        /\d/g,
        (digit) => persianDigits[englishDigits.indexOf(digit)]
      );
    }
    return {
      bottomAudioComponentModel,
      closeAudioPlayer,
      setCurrentAudio,
      handleWaveSurfer,
      handleReady,
      handleTimeUpdate,
      handlePause,
      handlePlay,
      options,
      playbackRate,
      changePlaybackRate,
      audioUrl,
      play,
      playEpisode,
      isPaused,
      productUrl,
      pause,
      handleProgress,
      isInDownloading,
      downloadedPrecent,
      convertToPersianDigits,
      playedDuration,
      duration,
      PRODUCT_TYPES,
    };
  },
  mounted() {
    this.downloadedPrecent = 0;
    this.isInDownloading = true;
    const bottomAudioDataJson = window.localStorage.getItem("bottomAudioData");
    if (bottomAudioDataJson) {
      try {
        const bottomAudioComponentModel = useState<BottomAudioModel>(
          "bottomAudioComponentModel"
        );
        bottomAudioComponentModel.value = JSON.parse(
          bottomAudioDataJson
        ) as BottomAudioModel;
        if (
          bottomAudioComponentModel.value.nextEpisodeId != 0 ||
          bottomAudioComponentModel.value.previousEpisodeId != 0
        ) {
          bottomAudioComponentModel.value.url = "";
          this.playEpisode(
            bottomAudioComponentModel.value.contentId,
            PRODUCT_TYPES[bottomAudioComponentModel.value.contentType].id,
            bottomAudioComponentModel.value.episodeId,
            bottomAudioComponentModel.value.latestPlayedSoccond
          );
        }
      } catch (error) {
        console.error("Failed to parse stored data:", error);
      }
    } else this.setCurrentAudio();
  },
};
</script>
