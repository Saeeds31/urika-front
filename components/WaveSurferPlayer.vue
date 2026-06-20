<template>
  <div class="waveform">
    <div v-if="!isReady" class="loading-state">
      <v-progress-linear indeterminate color="primary" class="mt-2" />
      <span>در حال آماده‌سازی...</span>
    </div>

    <div v-show="isReady" class="simple-controls">
      <!-- اینجا هر UI که داری رو بذار -->
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import { Howl } from "howler";

const props = defineProps({
  file: String,
  options: Object,
});

const emit = defineEmits([
  "play", "pause", "timeupdate", "ready", "waveSurfer", "progress",
]);

const isReady = ref(false);
let sound = null;
let progressInterval = null;

const loadSound = () => {
  if (sound) {
    sound.unload();
    clearInterval(progressInterval);
  }
  isReady.value = false;

  if (!props.file) return;

  sound = new Howl({
    src: [props.file],
    html5: true,
    preload: true,
    format: ['mp3'],
    onload: () => {
      isReady.value = true;
      emit("ready", sound.duration());
      // یه object با همون API که قبلاً داشتی بفرست
      emit("waveSurfer", {
        play: () => sound.play(),
        pause: () => sound.pause(),
        getCurrentTime: () => sound.seek(),
        getDuration: () => sound.duration(),
        isPlaying: () => sound.playing(),
        seekTo: (progress) => sound.seek(progress * sound.duration()),
        stop: () => sound.stop(),
      });
    },
    onplay: () => {
      emit("play");
      // هر ثانیه timeupdate بزن
      progressInterval = setInterval(() => {
        emit("timeupdate", sound.seek());
      }, 1000);
    },
    onpause: () => {
      emit("pause");
      clearInterval(progressInterval);
    },
    onstop: () => {
      clearInterval(progressInterval);
    },
    onend: () => {
      clearInterval(progressInterval);
    },
    onloaderror: (id, err) => {
      console.error("Howler load error:", err);
    },
  });
};

onMounted(() => loadSound());
onBeforeUnmount(() => {
  if (sound) sound.unload();
  clearInterval(progressInterval);
});
watch(() => props.file, (newFile) => {
  if (newFile) loadSound();
});
</script>