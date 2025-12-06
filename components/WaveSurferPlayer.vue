<template>
  <div ref="waveform" class="waveform"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import WaveSurfer from "wavesurfer.js";

const props = defineProps({
  options: Object,
  file: String,
});

const emit = defineEmits([
  "play",
  "pause",
  "timeupdate",
  "ready",
  "waveSurfer",
  "progress",
]);

const waveform = ref(null); // Reference to the waveform element
const waveSurfer = ref(null);
var latestDownloadedPercentage = -1;
var lastTime = -1;
let xhrRequest = null;

const loadWaveSurfer = () => {
  if (waveSurfer.value) {
    waveSurfer.value.destroy();
  }

  waveSurfer.value = WaveSurfer.create({
    container: waveform.value, // Correctly assign the waveform reference
    ...props.options,
  });

  waveSurfer.value.on("ready", () => {
    emit("ready", waveSurfer.value.getDuration());
    emit("waveSurfer", waveSurfer.value);
  });

  waveSurfer.value.on("play", () => emit("play"));
  waveSurfer.value.on("pause", () => emit("pause"));
  waveSurfer.value.on("audioprocess", () => {
    if (Math.floor(waveSurfer.value.getCurrentTime()) != lastTime) {
      emit("timeupdate", waveSurfer.value.getCurrentTime());
      lastTime = Math.floor(waveSurfer.value.getCurrentTime());
    }
  });
  waveSurfer.value.on("interaction", (progress) => {
    emit("timeupdate", waveSurfer.value.getCurrentTime());
  });

  waveSurfer.value.on("loading", (progress) => {
    if (progress != latestDownloadedPercentage) {
      emit("progress", progress);
      latestDownloadedPercentage = progress;
    }
  });
  if (props.file != null && props.file.length > 5)
    waveSurfer.value.load(props.file);
};

onMounted(() => {
  loadWaveSurfer();
});

onBeforeUnmount(() => {
  if (waveSurfer.value) {
    waveSurfer.value.destroy();
  }
});

watch(
  () => props.file,
  (newFile) => {
    if (newFile && waveSurfer.value) {
      loadWaveSurfer();
    }
  }
);
</script>

<style>
.waveform {
  width: 100%;
}
</style>
