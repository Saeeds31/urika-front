<template>
  <NuxtPwaManifest />
  <v-app>
    <NuxtLayout>
      <NuxtPage />
      <client-only>
        <SharedPwaGuideModal />
      </client-only>
    </NuxtLayout>
  </v-app>
</template>
