import { useState, ref, watch, onMounted, nextTick } from "#imports";
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

let studyTimer: ReturnType<typeof setInterval> | null = null;
let hasLoadedFromStorage = false;

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
  const lastSavedSecond = ref(0);
  const isRefreshingUrl = ref(false);

  onMounted(async () => {
    if (!import.meta.client) return;
    if (hasLoadedFromStorage) return;
    if (bottomAudioComponentModel.value?.contentId > 0) {
      hasLoadedFromStorage = true;
      return;
    }

    try {
      const raw = window.localStorage.getItem("bottomAudioData");
      if (!raw) {
        hasLoadedFromStorage = true;
        return;
      }

      const parsed = JSON.parse(raw) as BottomAudioModel;
      if (!parsed?.contentId || !parsed?.episodeId) {
        hasLoadedFromStorage = true;
        return;
      }

      console.log("📦 localStorage data found:", parsed);

      const contentType = parsed.contentType; // "audiobooks" | "podcasts"
      const productType =
        PRODUCT_TYPES[contentType]?.id || parsed.contentType == "audiobooks"
          ? 3
          : 1;

      console.log("🔄 Refreshing audio URL from server...");
      console.log("   productId:", parsed.contentId);
      console.log("   episodeId:", parsed.episodeId);
      console.log("   productType:", productType);

      isRefreshingUrl.value = true;
      bottomAudioComponentModel.value = {
        ...parsed,
      };

      try {
        const response = await post(API_ENDPOINTS.getFileToPlayData, {
          id: parsed.contentId,
          type: productType,
          episodeId: parsed.episodeId,
        });

        const data = response?.data;
        if (!data) {
          console.warn(
            "⚠️ No data from server, using localStorage as fallback",
          );
          isRefreshingUrl.value = false;
          hasLoadedFromStorage = true;
          return;
        }

        const serverContentType =
          data.contentType == 3 ? "audiobooks" : "podcasts";
        data.contentType = serverContentType;

        data.latestPlayedSoccond = parsed.latestPlayedSoccond || 0;

        console.log("✅ Fresh URL received:", data.url);
        console.log("✅ latestPlayedSoccond:", data.latestPlayedSoccond);
        bottomAudioComponentModel.value = data;
        saveInLocalStorage(data);
      } catch (err) {
        console.error("❌ Failed to refresh URL:", err);
        // در صورت خطا، از URL قدیمی استفاده کن
      } finally {
        isRefreshingUrl.value = false;
        hasLoadedFromStorage = true;
      }
    } catch (e) {
      console.error("Failed to load bottomAudioData:", e);
      hasLoadedFromStorage = true;
    }
  });

  async function sendStudyTime() {
    const model = bottomAudioComponentModel.value;

    if (!model?.contentId) return;
    if (model.episodeId === 0) return;
    if (!isPlaying.value) return;

    let endpoint: string | null = null;
    if (model.contentType === PRODUCT_TYPES.podcasts.typeName) {
      endpoint = API_ENDPOINTS.podcasts.studyTime;
    } else if (model.contentType === PRODUCT_TYPES.audiobooks.typeName) {
      endpoint = API_ENDPOINTS.audiobooks.studyTime;
    }
    if (!endpoint) return;

    try {
      await post(endpoint, { id: model.contentId });
    } catch (error) {
      console.error("sendStudyTime error:", error);
    }
  }

  function startStudyTimer() {
    stopStudyTimer();
    studyTimer = setInterval(sendStudyTime, 60_000);
  }

  function stopStudyTimer() {
    if (studyTimer) {
      clearInterval(studyTimer);
      studyTimer = null;
    }
  }

  watch(
    () => [
      bottomAudioComponentModel.value?.contentId,
      bottomAudioComponentModel.value?.episodeId,
      bottomAudioComponentModel.value?.contentType,
    ],
    ([contentId, episodeId]) => {
      if (contentId && episodeId && episodeId !== 0) {
        startStudyTimer();
      } else {
        stopStudyTimer();
      }
    },
  );

  function getSavedSecondFromLocalStorage(
    contentId: number,
    contentType: string,
    episodeId: number,
  ): number {
    try {
      const raw = window.localStorage.getItem("bottomAudioData");
      if (!raw) return 0;
      const parsed = JSON.parse(raw) as BottomAudioModel;

      if (
        parsed.contentId === contentId &&
        parsed.contentType === contentType &&
        parsed.episodeId === episodeId
      ) {
        return parsed.latestPlayedSoccond || 0;
      }
    } catch (e) {
      console.error("getSavedSecond error:", e);
    }
    return 0;
  }

  function play() {
    if (playerRef.value) playerRef.value.play();
  }

  function pause() {
    if (playerRef.value) playerRef.value.pause();
  }

  function togglePlay() {
    if (isPlaying.value) pause();
    else play();
  }

  function changePlaybackRate(rate: number) {
    if (playerRef.value) playerRef.value.setPlaybackRate(rate);
  }

  function seekTo(time: number) {
    if (playerRef.value) playerRef.value.seekTo(time);
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

        let seekSecond = latestPlayedSoccond;
        if (seekSecond === 0) {
          seekSecond = getSavedSecondFromLocalStorage(
            productId,
            contentType,
            episodeId,
          );
        }

        if (seekSecond > 0) {
          data.latestPlayedSoccond = seekSecond;
        }

        setCurrentAudio(data);
        isLoading.value = false;
      })
      .catch(() => {
        isLoading.value = false;
      });
  }

  function setCurrentAudio(model: BottomAudioModel) {
    const seekSecond = model.latestPlayedSoccond || 0;

    bottomAudioComponentModel.value = model;
    saveInLocalStorage(model);

    currentTime.value = 0;
    playedDuration.value = "00:00";
    lastSavedSecond.value = 0;

    if (seekSecond > 2) {
      nextTick(() => {
        setTimeout(() => {
          if (playerRef.value && playerRef.value.seekTo) {
            playerRef.value.seekTo(seekSecond);
            currentTime.value = seekSecond;
            playedDuration.value = formatTime(seekSecond);
            lastSavedSecond.value = Math.floor(seekSecond);
          }
        }, 500);
      });
    }
  }

  function closeAudioPlayer() {
    pause();
    bottomAudioComponentModel.value = { ...emptyBottomAudioModel };
    saveInLocalStorage(emptyBottomAudioModel);
    clearInterval(timerVal.value);
    lastProductPlayed.value = null;
    stopStudyTimer();
    hasLoadedFromStorage = false;
  }

  function handlePlayerReady(data: { duration: number }) {
    duration.value = formatTime(data.duration);

    const model = bottomAudioComponentModel.value;
    if (model?.latestPlayedSoccond > 2 && playerRef.value) {
      setTimeout(() => {
        if (playerRef.value?.seekTo) {
          playerRef.value.seekTo(model.latestPlayedSoccond);
          currentTime.value = model.latestPlayedSoccond;
          playedDuration.value = formatTime(model.latestPlayedSoccond);
          lastSavedSecond.value = Math.floor(model.latestPlayedSoccond);
        }
      }, 200);
    }
  }

  function handleTimeUpdate(time: number) {
    const model = bottomAudioComponentModel.value;

    if (
      time === 0 &&
      model?.latestPlayedSoccond > 2 &&
      lastSavedSecond.value === 0
    ) {
      return;
    }

    currentTime.value = time;
    playedDuration.value = formatTime(time);

    if (Math.floor(time) - lastSavedSecond.value >= 5 && time > 0) {
      lastSavedSecond.value = Math.floor(time);
      updateLastPlayedSeccond(Math.floor(time));
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
      if (typeof window === "undefined") return;
      window.localStorage.setItem("bottomAudioData", JSON.stringify(model));
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  }

  function handlePlay() {
    isPaused.value = false;
    isPlaying.value = true;

    const model = bottomAudioComponentModel.value;
    if (
      !studyTimer &&
      model?.contentId &&
      model.episodeId !== 0 &&
      (model.contentType === PRODUCT_TYPES.podcasts.typeName ||
        model.contentType === PRODUCT_TYPES.audiobooks.typeName)
    ) {
      startStudyTimer();
    }
  }

  function handlePause() {
    isPaused.value = true;
    isPlaying.value = false;
    stopStudyTimer();

    if (currentTime.value > 0) {
      updateLastPlayedSeccond(Math.floor(currentTime.value));
    }
  }

  function handleEnded() {
    isPlaying.value = false;
    stopStudyTimer();

    updateLastPlayedSeccond(0);

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
    bottomAudioComponentModel,
    isPaused,
    isPlaying,
    playedDuration,
    duration,
    currentTime,
    isLoading,
    downloadProgress,
    playerRef,
    isRefreshingUrl,
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
