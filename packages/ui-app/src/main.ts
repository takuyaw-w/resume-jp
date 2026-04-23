import { createApp } from "vue";
import App from "./App.vue";
import { router } from "./router.ts";
import { vuetify } from "./plugins/vuetify.ts";

createApp(App)
  .use(router)
  .use(vuetify)
  .mount("#app");
