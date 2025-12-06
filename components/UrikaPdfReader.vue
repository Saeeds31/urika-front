<template>
  <div>
    <div v-show="loading">
      <div
        class="d-flex align-center justify-center"
        style="height: calc(100vh - 125px); width: 100%"
      >
        <div class="">
          <div class="">
            <v-progress-circular
              color="primary"
              indeterminate
            ></v-progress-circular>
          </div>
        </div>
      </div>
    </div>
    <div class="position-relative">
      <button
        v-show="!loading"
        @click="closeBook"
        style="left: 50px; top: 4.5px; z-index: 999; position: absolute"
        :style="{ color: isDarkMode ? 'white' : 'black' }"
      >
        <v-icon size="17" style="vertical-align: -4px">mdi-close-thick</v-icon>
        بستن
      </button>
      <iframe
        v-show="!loading"
        :src="viewerUrl"
        width="100%"
        height="600px"
        @load="onLoad"
        ref="pdfViewer"
      ></iframe>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch, defineEmits } from "vue";

export default {
  props: {
    src: {
      type: String,
      required: true,
    },
  },
  setup(props, { emit }) {
    const viewerUrl = ref("");
    const loading = ref(true);
    const isDarkMode = ref(false);

    const loadPdf = () => {
      viewerUrl.value = `/pdfviewer/web/viewer.html?file=${props.src}`;
    };
    const checkDarkMode = () => {
      isDarkMode.value = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
    };

    function closeBook() {
      emit("close");
    }
    const onLoad = () => {
      setTimeout(() => {
        loading.value = false;
      }, 1750);
    };

    onMounted(() => {
      loadPdf();
      checkDarkMode();
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", checkDarkMode);
    });

    return {
      viewerUrl,
      loading,
      loadPdf,
      onLoad,
      closeBook,
      isDarkMode,
    };
  },
};
</script>

<style>
iframe {
  height: calc(100vh - 115px) !important;
}
</style>
