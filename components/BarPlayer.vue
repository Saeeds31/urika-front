<!-- components/BarPlayer.vue -->
<template>
  <div class="bar-player-wrapper">
    <div class="progress-bars-container" v-if="isReady">
      <div 
        v-for="(segment, index) in segments" 
        :key="index"
        class="progress-bar-segment"
        :class="{
          'played': segment.played,
          'playing': segment.playing,
          'buffered': segment.buffered
        }"
        :style="{ 
          height: `${segment.height}%`,
          backgroundColor: getSegmentColor(segment)
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
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  audioUrl: String,
  audioData: Object,
  initialTime: Number,
});

const emit = defineEmits([
  'play', 'pause', 'timeupdate', 'ended', 
  'next', 'previous', 'loaded'
]);

// ============== STATE ==============
const audio = ref(null);
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const playbackRate = ref(1);
const showSpeedMenu = ref(false);
const segments = ref([]);
const bufferedEnd = ref(0);
const isReady = ref(false);
const isLoading = ref(false);
const animationFrameId = ref(null);
const manualSeekTime = ref(null);
const isInitialized = ref(false);

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
      height: 30 + Math.random() * 50
    });
  }
};

const updateSegments = (time) => {
  if (!audio.value || duration.value === 0 || !segments.value.length) return;
  
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

// ============== UPDATE LOOP ==============
const updateLoop = () => {
  if (!audio.value || !isInitialized.value) {
    animationFrameId.value = requestAnimationFrame(updateLoop);
    return;
  }
  
  // اگر زمان دستی برای seek داریم، از اون استفاده کن
  if (manualSeekTime.value !== null) {
    const seekTime = manualSeekTime.value;
    currentTime.value = seekTime;
    updateSegments(seekTime);
    emit('timeupdate', seekTime);
    // بعد از 300ms، manualSeekTime رو null کن
    setTimeout(() => {
      manualSeekTime.value = null;
    }, 300);
  } else {
    // از audio.value.currentTime استفاده کن
    const time = audio.value.currentTime;
    if (!isNaN(time) && time >= 0 && time <= duration.value) {
      currentTime.value = time;
      updateSegments(time);
      emit('timeupdate', time);
    }
  }
  
  animationFrameId.value = requestAnimationFrame(updateLoop);
};

// ============== EVENT HANDLERS ==============
const onLoadedMetadata = () => {
  if (audio.value && !isNaN(audio.value.duration) && audio.value.duration > 0) {
    duration.value = audio.value.duration;
    isReady.value = true;
    isLoading.value = false;
    isInitialized.value = true;
    initSegments();
    
    if (props.initialTime > 0 && props.initialTime < duration.value) {
      console.log('Initial time from props:', props.initialTime);
      audio.value.currentTime = props.initialTime;
      manualSeekTime.value = props.initialTime;
      currentTime.value = props.initialTime;
      updateSegments(props.initialTime);
    }
    
    emit('loaded', { duration: duration.value });
    
    // شروع حلقه آپدیت
    if (animationFrameId.value) {
      cancelAnimationFrame(animationFrameId.value);
    }
    updateLoop();
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
  console.error('Audio error:', e);
  isLoading.value = false;
};

// ============== AUDIO INIT ==============
const initAudio = () => {
  if (!props.audioUrl) return;

  if (audio.value) {
    audio.value.pause();
    audio.value.src = '';
    audio.value = null;
  }

  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value);
    animationFrameId.value = null;
  }

  isLoading.value = true;
  isReady.value = false;
  isInitialized.value = false;
  currentTime.value = 0;
  manualSeekTime.value = null;

  audio.value = new Audio();
  audio.value.src = props.audioUrl;
  audio.value.preload = 'metadata';
  audio.value.playbackRate = playbackRate.value;

  audio.value.addEventListener('loadedmetadata', onLoadedMetadata);
  audio.value.addEventListener('play', onPlay);
  audio.value.addEventListener('pause', onPause);
  audio.value.addEventListener('ended', onEnded);
  audio.value.addEventListener('progress', onProgress);
  audio.value.addEventListener('error', onError);
};

// ============== CONTROLS ==============
const togglePlay = () => {
  if (!audio.value) return;
  if (isPlaying.value) {
    audio.value.pause();
  } else {
    audio.value.play().catch(err => console.error('Play error:', err));
  }
};

const handleSegmentClick = (index) => {
  if (!audio.value || duration.value === 0 || !isReady.value) return;
  
  const time = (index / SEGMENTS_COUNT) * duration.value;
  const safeTime = Math.max(0, Math.min(time, duration.value - 0.1));
  
  console.log('=== SEEK CLICK ===');
  console.log('Index:', index);
  console.log('Target time:', safeTime);
  console.log('Duration:', duration.value);
  console.log('Current audio.currentTime BEFORE:', audio.value.currentTime);
  
  // ست کردن زمان دستی
  manualSeekTime.value = safeTime;
  
  try {
    audio.value.currentTime = safeTime;
    console.log('After setting currentTime:', audio.value.currentTime);
  } catch (e) {
    console.warn('Seek error:', e);
  }
  
  // به‌روزرسانی فوری
  currentTime.value = safeTime;
  updateSegments(safeTime);
  emit('timeupdate', safeTime);
  
  // بعد از 300ms، manualSeekTime رو null کن
  setTimeout(() => {
    manualSeekTime.value = null;
    console.log('manualSeekTime cleared');
  }, 300);
  
  // اگر در حال پخش بود، ادامه بده
  if (isPlaying.value) {
    audio.value.play().catch(() => {});
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
  if (!seconds || isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

// ============== EXPOSE ==============
defineExpose({
  play: () => audio.value?.play(),
  pause: () => audio.value?.pause(),
  setPlaybackRate: changePlaybackRate,
  getCurrentTime: () => currentTime.value,
  seekTo: (time) => {
    if (audio.value && isReady.value) {
      const safeTime = Math.max(0, Math.min(time, duration.value - 0.1));
      manualSeekTime.value = safeTime;
      
      try {
        audio.value.currentTime = safeTime;
      } catch (e) {
        console.warn('Seek error:', e);
      }
      
      currentTime.value = safeTime;
      updateSegments(safeTime);
      
      setTimeout(() => {
        manualSeekTime.value = null;
      }, 300);
    }
  },
  isPlaying: () => isPlaying.value,
});

// ============== CLEANUP ==============
const cleanup = () => {
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value);
    animationFrameId.value = null;
  }
  
  if (audio.value) {
    audio.value.pause();
    audio.value.src = '';
    audio.value.removeEventListener('loadedmetadata', onLoadedMetadata);
    audio.value.removeEventListener('play', onPlay);
    audio.value.removeEventListener('pause', onPause);
    audio.value.removeEventListener('ended', onEnded);
    audio.value.removeEventListener('progress', onProgress);
    audio.value.removeEventListener('error', onError);
    audio.value = null;
  }
  
  isInitialized.value = false;
};

// ============== WATCHERS ==============
watch(() => props.audioUrl, (newUrl) => {
  if (newUrl) {
    cleanup();
    setTimeout(initAudio, 50);
  }
});

// ============== LIFECYCLE ==============
onMounted(() => {
  if (props.audioUrl) {
    setTimeout(initAudio, 50);
  }
});

onBeforeUnmount(() => {
  cleanup();
});
</script>

<style scoped>
/* استایل‌ها مثل قبل */
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