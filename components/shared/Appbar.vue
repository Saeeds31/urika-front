<script lang="ts">
import { ROUTES } from "~/utilities/routes";
import { useRoute } from "vue-router";
export default {
  setup() {
    const route = useRoute();

    const activeClass = "v-btn--selected v-btn--active";
    const activeBottomNavItem = computed(() => {
      if (route.path.startsWith("/products")) return "home";
      else if (route.path.startsWith("/member")) return "member";
      else if (route.path.startsWith("/categories")) return "category";
      else return "";
    });
    return { ROUTES, activeBottomNavItem, activeClass };
  },
};
</script>

<template>
  <v-bottom-navigation
    :elevation="4"
    grow
    color="primary"
    style="z-index: 8"
    class="appbar"
  >
    <NuxtLink
      v-ripple
      :class="
        'v-btn v-btn--stacked v-theme--light v-btn--density-default v-btn--size-default v-btn--variant-text ' +
        (activeBottomNavItem == 'home' ? activeClass : '')
      "
      :to="ROUTES.HOME"
    >
      <v-icon>mdi-home</v-icon>
      <span>خانه</span>
    </NuxtLink>
    <NuxtLink
      v-ripple
      :class="
        'v-btn v-btn--stacked v-theme--light v-btn--density-default v-btn--size-default v-btn--variant-text ' +
        (activeBottomNavItem == 'category' ? activeClass : '')
      "
      :to="ROUTES.CATEGORIES.INDEX"
    >
      <v-icon>mdi-shape-outline</v-icon>
      <span>دسته بندی</span>
    </NuxtLink>
    <NuxtLink
      v-ripple
      :class="'v-btn v-btn--stacked v-theme--light v-btn--density-default v-btn--size-default v-btn--variant-text'"
      :to="ROUTES.MY_LIBRARY"
    >
      <v-icon>mdi-library</v-icon>
      <span>کتابخانه من</span>
    </NuxtLink>
    <NuxtLink
      v-ripple
      :class="
        'v-btn v-btn--stacked v-theme--light v-btn--density-default v-btn--size-default v-btn--variant-text ' +
        (activeBottomNavItem == 'member' ? activeClass : '')
      "
      :to="ROUTES.MEMBER.PROFILE"
    >
      <v-icon>mdi-account</v-icon>
      <span>پروفایل</span>
    </NuxtLink>
  </v-bottom-navigation>
</template>
<style scoped>
.v-bottom-navigation__content button a {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  transition: 0.35s;
  color: black;
  line-height: 25px;
}

.v-bottom-navigation__content a {
  opacity: 0.55;
  transition: 0.2s;
}

.v-bottom-navigation__content a span {
  font-weight: 900;
  letter-spacing: normal;
  font-size: 14px;
}

.v-bottom-navigation__content .v-btn--active a {
  color: rgb(var(--v-theme-primary));
}

.v-bottom-navigation__content .v-btn--active {
  opacity: 1;
  color: rgb(var(--v-theme-primary));
  background: #3498451a;
}
</style>
