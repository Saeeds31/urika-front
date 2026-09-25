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

<script setup>
useHead({
  script: [
    {
      src: "https://www.googletagmanager.com/gtag/js?id=G-8PWGMN3NTD",
      async: true,
    },
    {
      children: `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-8PWGMN3NTD');
      `,
    },
  ],
});
</script>