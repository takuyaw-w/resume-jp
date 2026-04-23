import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";

import { createVuetify } from "vuetify";

export const vuetify = createVuetify({
  defaults: {
    VCard: {
      rounded: "xl",
      elevation: 0,
    },
    VBtn: {
      rounded: "lg",
    },
    VTextField: {
      variant: "outlined",
      density: "comfortable",
      color: "primary",
      hideDetails: "auto",
    },
    VTextarea: {
      variant: "outlined",
      density: "comfortable",
      color: "primary",
      hideDetails: "auto",
    },
    VSelect: {
      variant: "outlined",
      density: "comfortable",
      color: "primary",
      hideDetails: "auto",
    },
  },

  theme: {
    defaultTheme: "resumeStudioLight",
    themes: {
      resumeStudioLight: {
        dark: false,
        colors: {
          background: "#f6f7ff",
          surface: "#ffffff",
          "surface-bright": "#ffffff",
          "surface-light": "#f4f6ff",
          "surface-variant": "#f1eeff",

          primary: "#8b5cf6",
          secondary: "#06b6d4",
          accent: "#ec4899",

          success: "#22c55e",
          info: "#38bdf8",
          warning: "#f59e0b",
          error: "#ef476f",

          "on-background": "#1e1b3a",
          "on-surface": "#1e1b3a",
          "on-primary": "#ffffff",
          "on-secondary": "#ffffff",
          "on-error": "#ffffff",
        },
      },
    },
  },
});
