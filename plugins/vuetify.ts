// import this after install `@mdi/font` package
import "@mdi/font/css/materialdesignicons.css";
import colors from "vuetify/util/colors";

import "vuetify/styles";
import { createVuetify } from "vuetify";

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    theme: {
      themes: {
        light: {
          dark: false,
          colors: {
            background: "#f5f5f5",
            primary: "#427901", // #E53935
            secondary: colors.red.lighten4, // #FFCDD2
          },
        },
      },
    },
    locale: {
      locale: "fa",
    },
  });
  app.vueApp.use(vuetify);
});
