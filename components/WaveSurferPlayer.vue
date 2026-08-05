<!-- components/WaveSurferPlayer.vue -->
<template>
  <div class="waveform-wrapper">
    <div v-if="!isReady" class="loading-state">
      <v-progress-linear indeterminate color="primary" class="mt-2" />
      <span>در حال آماده‌سازی...</span>
    </div>

    <div v-show="isReady" ref="waveformContainer" class="waveform-container">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from "vue";
import WaveSurfer from "wavesurfer.js";

const props = defineProps({
  file: String,
  options: Object,
});

const emit = defineEmits([
  "play", "pause", "timeupdate", "ready", "waveSurfer", "progress",
]);

const isReady = ref(false);
const waveformContainer = ref(null);
let wavesurfer = null;
let progressInterval = null;

const loadSound = async () => {
  if (wavesurfer) {
    wavesurfer.destroy();
    clearInterval(progressInterval);
  }
  isReady.value = false;

  if (!props.file) return;

  await nextTick();

  wavesurfer = WaveSurfer.create({
    container: waveformContainer.value,
    waveColor: "#ddd",
    progressColor: "#4a9eff",
    cursorColor: "#4a9eff",
    barWidth: 2,
    barRadius: 3,
    cursorWidth: 1,
    height: 60,
    responsive: true,
    normalize: true,
    ...props.options,
  });

  // پشتیبانی از سرعت
  wavesurfer.setPlaybackRate = (rate) => {
    if (wavesurfer.mediaElement) {
      wavesurfer.mediaElement.playbackRate = rate;
    }
  };

  wavesurfer.on("loading", (percent) => {
    emit("progress", percent);
  });

  wavesurfer.on("ready", () => {
    isReady.value = true;
    emit("ready", wavesurfer.getDuration());
    
    // API یکسان با قبل
    emit("waveSurfer", {
      play: () => wavesurfer.play(),
      pause: () => wavesurfer.pause(),
      getCurrentTime: () => wavesurfer.getCurrentTime(),
      getDuration: () => wavesurfer.getDuration(),
      isPlaying: () => wavesurfer.isPlaying(),
      seekTo: (progress) => wavesurfer.seekTo(progress),
      stop: () => wavesurfer.stop(),
      setPlaybackRate: (rate) => {
        if (wavesurfer.mediaElement) {
          wavesurfer.mediaElement.playbackRate = rate;
        }
      },
    });
  });

  wavesurfer.on("play", () => {
    emit("play");
    progressInterval = setInterval(() => {
      emit("timeupdate", wavesurfer.getCurrentTime());
    }, 1000);
  });

  wavesurfer.on("pause", () => {
    emit("pause");
    clearInterval(progressInterval);
  });

  wavesurfer.on("finish", () => {
    clearInterval(progressInterval);
  });

  wavesurfer.on("seek", () => {
    emit("timeupdate", wavesurfer.getCurrentTime());
  });

  try {
    await wavesurfer.load(props.file);
  } catch (error) {
    console.error("WaveSurfer load error:", error);
  }
};

// متد عمومی برای تغییر سرعت
const setPlaybackRate = (rate) => {
  if (wavesurfer && wavesurfer.mediaElement) {
    wavesurfer.mediaElement.playbackRate = rate;
  }
};

// اکسپوز کردن متد به والد
defineExpose({
  setPlaybackRate,
});

onMounted(() => loadSound());
onBeforeUnmount(() => {
  if (wavesurfer) {
    wavesurfer.destroy();
  }
  clearInterval(progressInterval);
});

watch(() => props.file, (newFile) => {
  if (newFile) loadSound();
});
</script>

<style scoped>
.waveform-wrapper {
  width: 100%;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60px;
  gap: 8px;
}

.waveform-container {
  width: 100%;
  cursor: pointer;
}

.waveform-container :deep(.wavesurfer-handle) {
  display: none;
}

.waveform-container :deep(wave) {
  cursor: pointer;
}
</style>