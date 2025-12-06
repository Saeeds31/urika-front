// File: composables/useItemList.ts

import { useState } from "#imports"; // Use Nuxt 3's composables
export default function useLoading() {
  function startLoading() {
    const loadingState = useState<boolean>("loadingState");
    loadingState.value = true;
    document.body.classList.add("in-loading");
  }
  function stopLoading() {
    const loadingState = useState<boolean>("loadingState");
    loadingState.value = false;
    document.body.classList.remove("in-loading");
  }
  return { startLoading, stopLoading };
}
