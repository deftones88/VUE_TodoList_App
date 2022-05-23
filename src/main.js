import Vue from "vue";
import App from "./App.vue";
import { createPinia, PiniaVuePlugin } from "pinia";
import { defineStore } from "pinia";

Vue.config.productionTip = false;

Vue.use(PiniaVuePlugin);
const pinia = createPinia();

export const useStore = defineStore("savedNotes", {
  state: () => ({
    allNotes: [],
    categories: [],
    local: "notes_app",
  }),
  getters: {},
  actions: {
    updateAllNotes() {
      this.allNotes = JSON.parse(localStorage.getItem(this.local) || "[]");
    },
    updateCategories() {
      const ret = [];
      for (const obj of this.allNotes) {
        ret.push(obj.category);
      }
      this.categories = ret;
    },
  },
});

new Vue({
  render: (h) => h(App),
  pinia,
}).$mount("#app");
