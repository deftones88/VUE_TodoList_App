import { defineStore } from "pinia";

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
