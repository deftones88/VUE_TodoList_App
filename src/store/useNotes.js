import { defineStore } from "pinia";

export const useStore = defineStore("savedNotes", {
  state: () => ({
    allNotes: [],
    categories: [],
    local: "notes_app",
    filter: "",
    tabs: [],
  }),
  getters: {
    categoriesCount() {
      return this.categories.length;
    },
  },
  actions: {
    updateAllNotes() {
      const notes = JSON.parse(localStorage.getItem(this.local) || "[]");
      this.allNotes = notes.sort((a, b) => {
        if (a.category > b.category) return 1;
        else return -1;
      });
    },
    updateCategories() {
      const ret = [];
      for (const obj of this.allNotes) {
        ret.push(obj.category);
      }
      this.categories = ret;
    },
    saveAllNotes() {
      localStorage.setItem(
        this.local,
        JSON.stringify(this.allNotes, this.getCircularReplacer())
      );
    },
    updateTabs(value) {
      this.tabs = value;
    },
    updateFilter(input) {
      this.filter = input;
    },
    getCircularReplacer() {
      const seen = new WeakSet();
      return (key, value) => {
        if (typeof value === "object" && value !== null) {
          if (seen.has(value)) return;
          seen.add(value);
        }
        return value;
      };
    },
  },
});
