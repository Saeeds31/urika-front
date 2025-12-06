// File: composables/useItemList.ts

import { useState } from "#imports"; // Use Nuxt 3's composables
export default function useUser() {
  function isLogedIn(): boolean {
    const authToken = useCookie("authToken").value;
    if (authToken && authToken.length) return true;
    else return false;
  }
  return { isLogedIn };
}
