import Vue from "vue";
import App from "./App.vue";
import { createPinia, PiniaVuePlugin } from "pinia";
import { defineStore } from "pinia";

Vue.config.productionTip = false;

Vue.use(PiniaVuePlugin);
const pinia = createPinia();

export const useStore = defineStore("savedNotes", {});

new Vue({
  render: (h) => h(App),
  pinia,
}).$mount("#app");
