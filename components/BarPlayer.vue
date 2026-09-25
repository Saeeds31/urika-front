<template>
  <div class="bar-player-wrapper">
    <div class="progress-bars-container" v-if="isReady">
      <div
        v-for="(segment, index) in segments"
        :key="index"
        class="progress-bar-segment"
        :class="{
          played: segment.played,
          playing: segment.playing,
          buffered: segment.buffered,
        }"
        :style="{
          height: `${segment.height}%`,
          backgroundColor: getSegmentColor(segment),
        }"
        @click="handleSegmentClick(index)"
      ></div>
    </div>
    <div v-else class="loading-placeholder">
      <v-progress-linear indeterminate color="primary" height="4" />
    </div>

    <div class="player-controls">
      <div class="controls-left">
        <div class="speed-dropdown">
          <button class="speed-btn" @click.stop="toggleSpeedMenu">
            {{ playbackRate }}x
          </button>
          <div v-show="showSpeedMenu" class="speed-menu" @click.stop>
            <div
              v-for="rate in [0.5, 0.75, 1, 1.2, 1.5, 2]"
              :key="rate"
              :class="{ active: playbackRate === rate }"
              @click="changePlaybackRate(rate)"
            >
              {{ rate }}x
            </div>
          </div>
        </div>

        <div class="control-buttons">
          <v-icon
            class="control-btn"
            :class="{ disabled: !hasPrevious }"
            icon="mdi-skip-previous"
            size="22"
            @click="playPrevious"
          />

          <v-icon
            class="control-btn play-btn"
            :icon="isPlaying ? 'mdi-pause' : 'mdi-play'"
            size="30"
            @click="togglePlay"
          />

          <v-icon
            class="control-btn"
            :class="{ disabled: !hasNext }"
            icon="mdi-skip-next"
            size="22"
            @click="playNext"
          />
        </div>

        <div class="time-display">
          <span>{{ formatTime(currentTime) }}</span>
          <span class="separator">/</span>
          <span>{{ formatTime(duration) }}</span>
        </div>
      </div>

      <div class="controls-right">
        <div class="audio-info" v-if="audioData">
          <div class="info-text">
            <p class="title">{{ audioData.contentTitle }}</p>
            <span class="episode">{{ audioData.episodeTitle }}</span>
          </div>
          <img
            v-if="audioData.imageUrl"
            :src="audioData.imageUrl"
            class="audio-image"
            width="45"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';

const props = defineProps({
  audioUrl: String,
  audioData: Object,
  initialTime: { type: Number, default: 0 },
});

const emit = defineEmits([
  'play', 'pause', 'timeupdate', 'ended',
  'next', 'previous', 'loaded'
]);

// ============== STATE ==============
const audioEl = ref(null); // DOM element reference (اختیاری)
const audio = ref(null);   // آبجکت Audio
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const playbackRate = ref(1);
const showSpeedMenu = ref(false);
const segments = ref([]);
const bufferedEnd = ref(0);
const isReady = ref(false);
const isLoading = ref(false);
const hasAppliedInitialSeek = ref(false);

const SEGMENTS_COUNT = 50;

// ============== COMPUTED ==============
const hasNext = computed(() => props.audioData?.nextEpisodeId > 0);
const hasPrevious = computed(() => props.audioData?.previousEpisodeId > 0);

// ============== SEGMENT FUNCTIONS ==============
const initSegments = () => {
  segments.value = [];
  for (let i = 0; i < SEGMENTS_COUNT; i++) {
    segments.value.push({
      played: false,
      playing: false,
      buffered: false,
      height: 30 + Math.random() * 50,
    });
  }
};

const updateSegments = (time) => {
  if (duration.value === 0 || !segments.value.length) return;

  const progress = Math.min(time / duration.value, 1);
  const bufferedProgress = Math.min(bufferedEnd.value / duration.value, 1);
  const segmentIndex = Math.min(
    Math.floor(progress * SEGMENTS_COUNT),
    SEGMENTS_COUNT - 1
  );
  const bufferedIndex = Math.min(
    Math.floor(bufferedProgress * SEGMENTS_COUNT),
    SEGMENTS_COUNT - 1
  );

  segments.value.forEach((segment, index) => {
    segment.played = index < segmentIndex;
    segment.playing = index === segmentIndex;
    segment.buffered = index <= bufferedIndex;
  });
};

const getSegmentColor = (segment) => {
  if (segment.playing) return '#4a9eff';
  if (segment.played) return '#427912';
  if (segment.buffered) return '#b3d4fc';
  return '#e8e8e8';
};

// ============== AUDIO EVENT HANDLERS ==============
const onLoadedMetadata = () => {
  if (!audio.value) return;
  const dur = audio.value.duration;

  if (!isNaN(dur) && dur > 0 && isFinite(dur)) {
    duration.value = dur;
    isReady.value = true;
    isLoading.value = false;
    initSegments();

    // اعمال seek اولیه
    if (props.initialTime > 0 && props.initialTime < dur - 1) {
      console.log('🎯 BarPlayer setting initialTime:', props.initialTime);
      try {
        audio.value.currentTime = props.initialTime;
        currentTime.value = props.initialTime;
        updateSegments(props.initialTime);
        hasAppliedInitialSeek.value = true;
      } catch (e) {
        console.error('❌ Initial seek error:', e);
      }
    } else {
      hasAppliedInitialSeek.value = true;
    }

    emit('loaded', { duration: dur });

    // بعد از ۱ ثانیه چک کن آیا currentTime درست ست شده
    setTimeout(() => {
      if (!audio.value || !hasAppliedInitialSeek.value) return;
      if (props.initialTime > 0) {
        const diff = Math.abs(audio.value.currentTime - props.initialTime);
        if (diff > 2) {
          console.log('🔄 BarPlayer re-applying initialTime, diff:', diff);
          try {
            audio.value.currentTime = props.initialTime;
            currentTime.value = props.initialTime;
            updateSegments(props.initialTime);
          } catch (e) {}
        }
      }
    }, 1000);
  }
};

const onTimeUpdate = () => {
  if (!audio.value) return;

  const time = audio.value.currentTime;

  // اگر seek اولیه اعمال شده و currentTime هنوز 0 است، رد کن
  if (
    hasAppliedInitialSeek.value &&
    time === 0 &&
    props.initialTime > 2
  ) {
    return;
  }

  if (!isNaN(time) && isFinite(time)) {
    currentTime.value = time;
    updateSegments(time);
    emit('timeupdate', time);
  }
};

const onPlay = () => {
  isPlaying.value = true;
  emit('play');
};

const onPause = () => {
  isPlaying.value = false;
  emit('pause');
};

const onEnded = () => {
  isPlaying.value = false;
  emit('ended');
  if (hasNext.value) {
    setTimeout(() => emit('next'), 500);
  }
};

const onProgress = () => {
  if (audio.value && audio.value.buffered.length > 0) {
    const buffered = audio.value.buffered;
    bufferedEnd.value = buffered.end(buffered.length - 1);
  }
};

const onError = (e) => {
  console.error('❌ Audio error:', e, audio.value?.error);
  isLoading.value = false;
};

const onCanPlay = () => {
  console.log('✅ Audio can play, duration:', audio.value?.duration);
  isLoading.value = false;
};

// ============== AUDIO INIT ==============
const initAudio = () => {
  if (!props.audioUrl) {
    console.warn('⚠️ No audioUrl provided');
    return;
  }

  console.log('🎵 initAudio called with URL:', props.audioUrl);
  console.log('🎵 initialTime:', props.initialTime);

  // پاکسازی قبلی
  cleanup();

  isLoading.value = true;
  isReady.value = false;
  currentTime.value = 0;
  duration.value = 0;
  hasAppliedInitialSeek.value = false;

  // ساخت آبجکت Audio
  const a = new Audio();
  a.src = props.audioUrl;
  a.preload = 'auto'; // مهم: auto به جای metadata برای بارگذاری کامل
  a.playbackRate = playbackRate.value;
  a.crossOrigin = 'anonymous'; // برای CORS

  // اتصال event listenerها
  a.addEventListener('loadedmetadata', onLoadedMetadata);
  a.addEventListener('timeupdate', onTimeUpdate);
  a.addEventListener('play', onPlay);
  a.addEventListener('pause', onPause);
  a.addEventListener('ended', onEnded);
  a.addEventListener('progress', onProgress);
  a.addEventListener('error', onError);
  a.addEventListener('canplay', onCanPlay);

  audio.value = a;

  // بارگذاری
  a.load();
};

// ============== CONTROLS ==============
const togglePlay = async () => {
  console.log('▶️ togglePlay clicked, isPlaying:', isPlaying.value);

  if (!audio.value) {
    console.warn('⚠️ audio.value is null');
    // اگر audio null است، دوباره init کن
    initAudio();
    return;
  }

  console.log('▶️ audio.readyState:', audio.value.readyState);
  console.log('▶️ audio.currentTime:', audio.value.currentTime);
  console.log('▶️ audio.duration:', audio.value.duration);
  console.log('▶️ audio.src:', audio.value.src);
  console.log('▶️ audio.paused:', audio.value.paused);

  if (isPlaying.value) {
    audio.value.pause();
  } else {
    try {
      // اگر duration مشخص است و currentTime خارج از محدوده است، اصلاح کن
      if (
        isFinite(audio.value.duration) &&
        audio.value.currentTime >= audio.value.duration
      ) {
        audio.value.currentTime = 0;
      }

      await audio.value.play();
      console.log('✅ Play successful');
    } catch (err) {
      console.error('❌ Play error:', err);
      console.error('❌ Error name:', err.name);
      console.error('❌ Error message:', err.message);

      // اگر خطا NotAllowedError بود (autoplay policy)
      if (err.name === 'NotAllowedError') {
        console.warn('⚠️ Autoplay blocked by browser. User needs to interact.');
      }
    }
  }
};

const handleSegmentClick = (index) => {
  if (!audio.value || duration.value === 0 || !isReady.value) return;

  const time = (index / SEGMENTS_COUNT) * duration.value;
  const safeTime = Math.max(0, Math.min(time, duration.value - 0.5));

  console.log('🎯 Segment click, target time:', safeTime);

  try {
    audio.value.currentTime = safeTime;
    currentTime.value = safeTime;
    updateSegments(safeTime);
    emit('timeupdate', safeTime);
  } catch (e) {
    console.warn('❌ Seek error:', e);
  }
};

const changePlaybackRate = (rate) => {
  playbackRate.value = rate;
  if (audio.value) {
    audio.value.playbackRate = rate;
  }
  showSpeedMenu.value = false;
};

const toggleSpeedMenu = () => {
  showSpeedMenu.value = !showSpeedMenu.value;
};

const playNext = () => {
  if (hasNext.value) emit('next');
};

const playPrevious = () => {
  if (hasPrevious.value) emit('previous');
};

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds) || seconds < 0 || !isFinite(seconds)) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

// ============== EXPOSE ==============
defineExpose({
  play: () => {
    if (audio.value) {
      audio.value.play().catch((err) => console.error('Play error:', err));
    }
  },
  pause: () => {
    if (audio.value) audio.value.pause();
  },
  setPlaybackRate: changePlaybackRate,
  getCurrentTime: () => currentTime.value,
  seekTo: (time) => {
    if (!audio.value || !isReady.value) {
      console.warn('⚠️ seekTo called but not ready');
      return;
    }
    const safeTime = Math.max(0, Math.min(time, duration.value - 0.5));
    console.log('🎯 seekTo called:', safeTime);
    try {
      audio.value.currentTime = safeTime;
      currentTime.value = safeTime;
      updateSegments(safeTime);
    } catch (e) {
      console.warn('❌ seekTo error:', e);
    }
  },
  isPlaying: () => isPlaying.value,
  getAudioElement: () => audio.value,
});

// ============== CLEANUP ==============
const cleanup = () => {
  if (audio.value) {
    console.log('🧹 cleanup audio');
    try {
      audio.value.pause();
      audio.value.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.value.removeEventListener('timeupdate', onTimeUpdate);
      audio.value.removeEventListener('play', onPlay);
      audio.value.removeEventListener('pause', onPause);
      audio.value.removeEventListener('ended', onEnded);
      audio.value.removeEventListener('progress', onProgress);
      audio.value.removeEventListener('error', onError);
      audio.value.removeEventListener('canplay', onCanPlay);
      audio.value.src = '';
      audio.value.load();
    } catch (e) {
      console.warn('Cleanup error:', e);
    }
    audio.value = null;
  }
};

// ============== WATCHERS ==============
watch(
  () => props.audioUrl,
  (newUrl, oldUrl) => {
    console.log('🔄 audioUrl changed:', oldUrl, '→', newUrl);
    if (newUrl && newUrl !== oldUrl) {
      nextTick(() => {
        setTimeout(initAudio, 50);
      });
    }
  }
);

// ============== LIFECYCLE ==============
onMounted(() => {
  console.log('🚀 BarPlayer mounted, audioUrl:', props.audioUrl);
  if (props.audioUrl) {
    setTimeout(initAudio, 50);
  }
});

onBeforeUnmount(() => {
  console.log('💀 BarPlayer unmounting');
  cleanup();
});
</script>

<style scoped>
/* استایل‌ها بدون تغییر */
.bar-player-wrapper {
  width: 100%;
  background: white;
  border-radius: 12px;
  padding: 8px 0 4px;
}

.progress-bars-container {
  display: flex;
  gap: 3px;
  height: 45px;
  align-items: flex-end;
  margin-bottom: 10px;
  cursor: pointer;
  direction: ltr;
  min-height: 45px;
}

.progress-bar-segment {
  flex: 1;
  min-width: 4px;
  border-radius: 2px 2px 0 0;
  transition: all 0.15s ease;
  cursor: pointer;
}

.progress-bar-segment:hover {
  opacity: 0.8;
  transform: scaleY(1.15);
}

.progress-bar-segment.playing {
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.loading-placeholder {
  height: 45px;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.player-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.controls-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  flex-wrap: wrap;
}

.controls-right {
  display: flex;
  align-items: center;
}

.speed-dropdown {
  position: relative;
}

.speed-btn {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 6px;
  background: #f3f3f3;
  border: none;
  cursor: pointer;
  font-weight: 600;
  color: #333;
}

.speed-btn:hover {
  background: #e8e8e8;
}

.speed-menu {
  position: absolute;
  bottom: 100%;
  left: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  padding: 4px 0;
  min-width: 60px;
  z-index: 10;
}

.speed-menu div {
  padding: 6px 14px;
  font-size: 13px;
  cursor: pointer;
  text-align: center;
}

.speed-menu div:hover {
  background: #f5f5f5;
}

.speed-menu div.active {
  background: #e3f2fd;
  color: #1976d2;
}

.control-buttons {
  display: flex;
  align-items: center;
  gap: 4px;
  direction: ltr;
}

.control-btn {
  cursor: pointer;
  color: #333;
  transition: all 0.2s;
}

.control-btn:hover {
  color: #000;
  transform: scale(1.05);
}

.control-btn.disabled {
  opacity: 0.3;
  cursor: not-allowed;
  pointer-events: none;
}

.play-btn {
  color: #1976d2;
}

.play-btn:hover {
  color: #1565c0;
}

.time-display {
  font-size: 13px;
  color: #666;
  font-variant-numeric: tabular-nums;
  min-width: 90px;
  direction: ltr;
}

.time-display .separator {
  margin: 0 4px;
  opacity: 0.5;
}

.audio-info {
  display: flex;
  align-items: center;
  gap: 8px;
  text-align: right;
}

.info-text {
  text-align: right;
  max-width: 150px;
  overflow: hidden;
}

.info-text .title {
  font-weight: 700;
  font-size: 14px;
  margin: 0;
  line-height: 1.2;
  color: #1a1a1a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.info-text .episode {
  font-size: 12px;
  color: #777;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.audio-image {
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

@media (max-width: 600px) {
  .bar-player-wrapper {
    padding: 6px 0 2px;
  }

  .controls-left {
    gap: 6px;
  }

  .time-display {
    font-size: 11px;
    min-width: 70px;
  }

  .info-text .title {
    font-size: 12px;
    max-width: 100px;
  }

  .info-text .episode {
    font-size: 10px;
    max-width: 100px;
  }

  .audio-image {
    width: 35px;
  }

  .progress-bars-container {
    height: 35px;
    gap: 2px;
  }

  .progress-bar-segment {
    min-width: 2px;
  }
}
</style>