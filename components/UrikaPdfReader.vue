<template>
  <div v-show="true" class="pdf-wrapper">
    <div v-show="loading" class="loading-wrapper">
      <v-progress-circular color="primary" indeterminate />
    </div>

    <button v-show="!loading" class="close-btn" @click="closeBook">
      <v-icon size="18">mdi-close-thick</v-icon>
      بستن
    </button>

    <iframe v-show="!loading" :src="viewerUrl" @load="onLoad"></iframe>
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
      viewerUrl.value = `/pdfviewer/web/viewer.html?file=${props.src}&v=v1`;
      setTimeout(() => {
        document.getElementById('pdfReaderSection').scrollIntoView({ behavior: 'smooth' })
      }, 2000);
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

.pdf-wrapper {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  background: #fff;
  z-index: 9999;
  overflow: hidden;
}

iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.loading-wrapper {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  z-index: 2;
}

.close-btn {
  position: absolute;
  top: 10px;
  left: 15px;
  z-index: 10;
  background: transparent;
  border: none;
  cursor: pointer;
}
</style>
