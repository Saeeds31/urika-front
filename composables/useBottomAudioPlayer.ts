// File: composables/useItemList.ts

import { useState } from "#imports"; // Use Nuxt 3's composables
import type { BottomAudioModel } from "~/types/bottomAudioModel";
import { API_ENDPOINTS } from "~/utilities/apiEndpoints";
const emptyBottomAudioModel: BottomAudioModel = {
  contentId: 0,
  episodeId: 0,
  nextEpisodeId: 0,
  previousEpisodeId: 0,
  contentType: "",
  contentTitle: "",
  episodeTitle: "",
  imageUrl: "",
};
const isInDownloading = ref(false);
const downloadedPrecent = ref(0);
export default function useBottomAudioPlayer() {
  const bottomAudioComponentModel = useState<BottomAudioModel>(
    "bottomAudioComponentModel"
  );
  const { post } = useCustomFetch();
  const isPaused = ref(true);
  const audioUrl = ref(bottomAudioComponentModel?.value?.url);
  const playedDuration = ref("00:00");
  const duration = ref("00:00");
  const waveSurferInstance = ref({});
  function play() {
    try {
      waveSurferInstance.value.play();
    } catch {}
  }
  function pause() {
    try {
      waveSurferInstance.value.pause();
    } catch {}
  }
  const options = {
    waveColor: "#bbbbbb",
    progressColor: "#42791282",
    cursorColor: "#7f7f7fbd",
    cursorWidth: 2,
    barWidth: 2,
    barHeight: 1,
    responsive: true,
    height: 40,
  };
  const handleProgress = (x) => {
    isInDownloading.value = true;

    downloadedPrecent.value = x;
    if (x == 100 || x > 100) {
      setTimeout(() => {
        isInDownloading.value = false;
      }, 500);
    }
  };
  const handlePlay = () => {
    isPaused.value = false;
  };
  function updateLastPlayedSeccond(seccond: number) {
    bottomAudioComponentModel.value.latestPlayedSoccond = seccond;
    saveInLocalStorage(bottomAudioComponentModel.value);
  }
  const handlePause = () => {
    isPaused.value = true;
  };
  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes < 10 ? "0" : ""}${minutes}:${
      secs < 10 ? "0" : ""
    }${secs}`;
  }
  const handleTimeUpdate = (time) => {
    if (Math.floor(time) % 2 == 0) {
      updateLastPlayedSeccond(time);
    }
    playedDuration.value = formatTime(time);
  };
  function playEpisode(
    productId: number,
    productType: number,
    episodeId: number,
    latestPlayedSoccond: number = 0
  ) {
    downloadedPrecent.value = 0;
    isInDownloading.value = true;
    let payload = { id: productId, type: productType, episodeId: episodeId };
    post(API_ENDPOINTS.getFileToPlayData, payload).then((x) => {
      x?.data?.contentType == 3
        ? (x.data.contentType = "audiobooks")
        : (x.data.contentType = "podcasts");
      if (latestPlayedSoccond > 0)
        x.data.latestPlayedSoccond = latestPlayedSoccond;
      setCurrentAudio(x?.data);
    });
  }
  const handleReady = (fileDurationAsSecond) => {
    duration.value = formatTime(fileDurationAsSecond);
    if (bottomAudioComponentModel.value.latestPlayedSoccond > 2) {
      setTimeout(() => {
        waveSurferInstance?.value?.seekTo(
          bottomAudioComponentModel.value.latestPlayedSoccond /
            fileDurationAsSecond
        );
        playedDuration.value = formatTime(
          bottomAudioComponentModel.value.latestPlayedSoccond
        );
        isInDownloading.value = false;
      }, 500);
    } else {
      setTimeout(() => {
        play();
        isInDownloading.value = false;
      }, 500);
    }
  };

  const handleWaveSurfer = (ws) => {
    waveSurferInstance.value = ws;
  };
  function setCurrentAudio(model: BottomAudioModel = emptyBottomAudioModel) {
    isInDownloading.value = true;
    downloadedPrecent.value = 0;
    const bottomAudioComponentModel = useState<BottomAudioModel>(
      "bottomAudioComponentModel"
    );
    bottomAudioComponentModel.value = model;
    saveInLocalStorage(model);
    audioUrl.value = model.url;
  }

  function closeAudioPlayer() {
    pause();
    downloadedPrecent.value = 0;
    const bottomAudioComponentModel = useState<BottomAudioModel>(
      "bottomAudioComponentModel"
    );
    bottomAudioComponentModel.value = emptyBottomAudioModel;
    saveInLocalStorage(emptyBottomAudioModel);
    audioUrl.value = "";
  }
  function saveInLocalStorage(model: BottomAudioModel) {
    window.localStorage.setItem("bottomAudioData", JSON.stringify(model));
  }

  return {
    setCurrentAudio,
    closeAudioPlayer,
    bottomAudioComponentModel,
    isPaused,
    handleWaveSurfer,
    handleReady,
    handleTimeUpdate,
    handlePause,
    handlePlay,
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
  };
}
