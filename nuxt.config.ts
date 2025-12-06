import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";
import process from "node:process";
import { VitePWA } from "vite-plugin-pwa";

const sw = process.env.SW === "true";
export default defineNuxtConfig({
  devServer: {
    host: "0.0.0.0", // این تنظیم باعث می‌شود تا سرور Nuxt بر روی همه‌ی IP ها گوش دهد
    port: 3003, // پورت مورد نظر شما
  },
  app: {
    head: {
      titleTemplate: "یوریکا %s",
      meta: [
        {
          name: "description",
          content: "سایت تخصصی کتاب‌های صوتی و پادکست‌های مرتبط با دندانپزشکی",
        },
        {
          name: "keywords",
          content:
            "کتاب صوتی دندانپزشکی, پادکست دندانپزشکی, مطالب آموزشی دندانپزشکی",
        },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
    },
  },
  router: {
    options: {
      linkActiveClass: "v-btn--selected v-btn--active",
    },
  },
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.API_BASE_URL as string,
    },
  },
  css: [
    "@/public/assets/scss/common/main.css", // Path to your main.css file in the assets directory
  ],
  build: {
    transpile: ["vuetify"],
  },
  modules: [
    ["@vite-pwa/nuxt"],
    (_options, nuxt) => {
      nuxt.hooks.hook("vite:extendConfig", (config) => {
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }));
      });
    },
    "@vueuse/motion/nuxt",
  ],
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },
  pwa: {
    strategies: "generateSW",
    registerType: "autoUpdate",
    manifest: {
      name: "Urika",
      short_name: "Urika",
      theme_color: "#ffffff",
      icons: [
        {
          src: "/assets/images/pwa-48x48.png",
          sizes: "48x48",
          type: "image/png",
        },
        {
          src: "/assets/images/pwa-72x72.png",
          sizes: "72x72",
          type: "image/png",
        },
        {
          src: "/assets/images/pwa-96x96.png",
          sizes: "96x96",
          type: "image/png",
        },
        {
          src: "/assets/images/pwa-128x128.png",
          sizes: "128x128",
          type: "image/png",
        },
        {
          src: "/assets/images/pwa-144x144.png",
          sizes: "144x144",
          type: "image/png",
        },
        {
          src: "/assets/images/pwa-152x152.png",
          sizes: "152x152",
          type: "image/png",
        },
        {
          src: "/assets/images/pwa-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "/assets/images/pwa-384x384.png",
          sizes: "384x384",
          type: "image/png",
        },
        {
          src: "/assets/images/pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
        {
          src: "/assets/images/pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable",
        },
      ],
    },
    workbox: {
      runtimeCaching: [
        {
          urlPattern: ({ request }) => true, // Matches all requests
          handler: "NetworkOnly", // Always fetch from network
        },
      ],
      skipWaiting: true,
      clientsClaim: true,
    },
    injectManifest: {
      globPatterns: [], // Ensure no files are pre-cached
    },
    devOptions: {
      enabled: true,
      suppressWarnings: true,
    },
  },
});
