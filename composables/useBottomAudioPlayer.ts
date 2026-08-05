// composables/useBottomAudioPlayer.ts
import { useState, ref, computed } from "#imports";
import type { BottomAudioModel } from "~/types/bottomAudioModel";
import { API_ENDPOINTS } from "~/utilities/apiEndpoints";
import { PRODUCT_TYPES } from "~/utilities/constants";

const emptyBottomAudioModel: BottomAudioModel = {
  contentId: 0,
  episodeId: 0,
  nextEpisodeId: 0,
  previousEpisodeId: 0,
  contentType: "",
  contentTitle: "",
  episodeTitle: "",
  imageUrl: "",
  latestPlayedSoccond: 0,
};

export default function useBottomAudioPlayer() {
  const bottomAudioComponentModel = useState<BottomAudioModel>(
    "bottomAudioComponentModel",
    () => ({ ...emptyBottomAudioModel }),
  );

  const { post } = useCustomFetch();
  const isPaused = ref(true);
  const isPlaying = ref(false);
  const timerVal = ref(null);
  const lastProductPlayed = ref(null);
  const playerRef = ref(null);
  const playedDuration = ref("00:00");
  const duration = ref("00:00");
  const currentTime = ref(0);
  const downloadProgress = ref(0);
  const isLoading = ref(false);

  // تابع play رو اصلاح کن
  function play() {
    if (playerRef.value) {
      playerRef.value.play();
    }
  }

  // تابع pause رو اصلاح کن
  function pause() {
    if (playerRef.value) {
      playerRef.value.pause();
    }
  }

  function togglePlay() {
    if (isPlaying.value) {
      pause();
    } else {
      play();
    }
  }

  function changePlaybackRate(rate: number) {
    if (playerRef.value) {
      playerRef.value.setPlaybackRate(rate);
    }
  }

  function seekTo(time: number) {
    if (playerRef.value) {
      playerRef.value.seekTo(time);
    }
  }

  function playEpisode(
    productId: number,
    productType: number,
    episodeId: number,
    latestPlayedSoccond: number = 0,
  ) {
    isLoading.value = true;

    const payload = {
      id: productId,
      type: productType,
      episodeId: episodeId,
    };

    post(API_ENDPOINTS.getFileToPlayData, payload)
      .then((response) => {
        const data = response?.data;
        if (!data) return;

        const contentType = data.contentType == 3 ? "audiobooks" : "podcasts";
        data.contentType = contentType;

        if (latestPlayedSoccond > 0) {
          data.latestPlayedSoccond = latestPlayedSoccond;
        }

        setCurrentAudio(data);
        isLoading.value = false;
      })
      .catch(() => {
        isLoading.value = false;
      });
  }

  function setCurrentAudio(model: BottomAudioModel) {
    bottomAudioComponentModel.value = model;
    saveInLocalStorage(model);

    // Reset states
    currentTime.value = 0;
    playedDuration.value = "00:00";

    // زمان رو ست کن ولی پخش نکن خودکار
    if (model.latestPlayedSoccond > 2 && playerRef.value) {
      // صبر کن تا audio لود بشه بعد seek کن
      setTimeout(() => {
        if (playerRef.value) {
          playerRef.value.seekTo(model.latestPlayedSoccond);
        }
      }, 500);
    }
  }

  function closeAudioPlayer() {
    pause();
    bottomAudioComponentModel.value = { ...emptyBottomAudioModel };
    saveInLocalStorage(emptyBottomAudioModel);
    clearInterval(timerVal.value);
    lastProductPlayed.value = null;
  }

  function handlePlayerReady(data: { duration: number }) {
    duration.value = formatTime(data.duration);
  }

  function handleTimeUpdate(time: number) {
    currentTime.value = time;
    playedDuration.value = formatTime(time);

    // Update study time every 60 seconds
    if (Math.floor(time) % 60 === 0 && time > 0) {
      updateLastPlayedSeccond(time);
    }
  }

  function updateLastPlayedSeccond(second: number) {
    bottomAudioComponentModel.value.latestPlayedSoccond = second;
    saveInLocalStorage(bottomAudioComponentModel.value);
  }

  function formatTime(seconds: number): string {
    if (!seconds || isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  function saveInLocalStorage(model: BottomAudioModel) {
    try {
      window.localStorage.setItem("bottomAudioData", JSON.stringify(model));
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  }

  function handlePlay() {
    isPaused.value = false;
    isPlaying.value = true;
  }

  function handlePause() {
    isPaused.value = true;
    isPlaying.value = false;
  }

  function handleEnded() {
    isPlaying.value = false;
    // Auto-play next episode if available
    if (bottomAudioComponentModel.value?.nextEpisodeId > 0) {
      setTimeout(() => {
        playEpisode(
          bottomAudioComponentModel.value.contentId,
          PRODUCT_TYPES[bottomAudioComponentModel.value.contentType]?.id || 0,
          bottomAudioComponentModel.value.nextEpisodeId,
        );
      }, 1000);
    }
  }

  function goToNextEpisode() {
    if (bottomAudioComponentModel.value?.nextEpisodeId > 0) {
      playEpisode(
        bottomAudioComponentModel.value.contentId,
        PRODUCT_TYPES[bottomAudioComponentModel.value.contentType]?.id || 0,
        bottomAudioComponentModel.value.nextEpisodeId,
      );
    }
  }

  function goToPreviousEpisode() {
    if (bottomAudioComponentModel.value?.previousEpisodeId > 0) {
      playEpisode(
        bottomAudioComponentModel.value.contentId,
        PRODUCT_TYPES[bottomAudioComponentModel.value.contentType]?.id || 0,
        bottomAudioComponentModel.value.previousEpisodeId,
      );
    }
  }

  return {
    // State
    bottomAudioComponentModel,
    isPaused,
    isPlaying,
    playedDuration,
    duration,
    currentTime,
    isLoading,
    downloadProgress,
    playerRef,

    // Methods
    play,
    pause,
    togglePlay,
    changePlaybackRate,
    seekTo,
    playEpisode,
    setCurrentAudio,
    closeAudioPlayer,
    handlePlayerReady,
    handleTimeUpdate,
    handlePlay,
    handlePause,
    handleEnded,
    goToNextEpisode,
    goToPreviousEpisode,
  };
}
