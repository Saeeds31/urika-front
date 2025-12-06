<template>
  <NuxtLoadingIndicator color="#FFF" />
  <SharedAppLoading :isLoading="loadingState" />
  <div :class="'app-outer ' + (loadingState ? 'app-is-loading' : '')">
    <SharedHeader />
    <div
      :class="
        'content-wrapper ' +
        (bottomAudioComponentModel?.contentId > 0 ? 'has-bottom-audio' : '')
      "
    >
      <slot />
    </div>
  </div>
  <SharedBottomAudioPlayer />
  <SharedAppbar />
  <v-snackbar
    v-model="snackbar.isVisible"
    :timeout="2000"
    :color="snackbar.messageColor"
  >
    {{ snackbar.message }}
    <template v-slot:actions> </template>
  </v-snackbar>
</template>
<script lang="ts">
import type { BottomAudioModel } from "~/types/bottomAudioModel";
import type { CommonNotificationModel } from "~/types/commonNotificationModel";
import { useLoading } from "#imports";
const { startLoading, stopLoading } = useLoading();
export default {
  setup() {
    const bottomAudioComponentModel = useState<BottomAudioModel>(
      "bottomAudioComponentModel"
    );
    const snackbar = useState<CommonNotificationModel>("commonNotification");
    snackbar.value = {
      message: "",
      isVisible: false,
      messageColor: "error",
    };

    const loadingState = useState<boolean>("loadingState");
    loadingState.value = true;
    const nuxtApp = useNuxtApp();
    nuxtApp.hook("page:start", () => {
      startLoading();
    });
    nuxtApp.hook("page:finish", () => {
      stopLoading();
    });
    return { bottomAudioComponentModel, loadingState, snackbar };
  },
};
</script>
