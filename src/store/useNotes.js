import { defineStore } from "pinia";

export const useStore = defineStore("savedNotes", {
  state: () => ({
    allNotes: [],
    filteredNotes: [],
    categories: [],
    local: "notes_app",
    filter: "",
    filteredLength: 0,
    tabs: [],
    selectedTab: "All",
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
    filterNotes(value, option = 0) {
      if (!option) {
        if (this.filter) {
          this.filteredNotes = this.allNotes.filter(
            (el) => el.category == this.filter
          );
          if (this.filteredNotes.length === 1)
            this.filteredLength = this.filteredNotes[0].objList.length;
        } else {
          this.filteredNotes = this.allNotes;
        }
        console.log(this.filteredNotes);
      } else if (option === 1) {
        const ret = [];
        this.allNotes.filter((el) => {
          if (this.selectedTab === "All" || el.category === this.selectedTab) {
            el.objList.filter((e) => {
              console.log(e.note.text);
              if (e.note.text.toLowerCase().includes(value)) {
                const objList = [];
                objList.push(e);
                ret.push({ objList: objList });
              }
            });
          }
        });
        this.filteredNotes = ret;
        console.log(this.filteredNotes);
      }
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
    selectTab(value) {
      this.tabs.forEach((tab) => {
        if (tab.name === value.name) this.selectedTab = value.name;
      });
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
