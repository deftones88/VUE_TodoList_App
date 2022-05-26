import { defineStore } from "pinia";

export const useStore = defineStore("savedNotes", {
  state: () => ({
    index: 0,
    allNotes: [],
    filteredNotes: [],
    categories: [],
    local: "notes_app",
    filter: "",
    filteredLength: 0,
    tabs: [],
    selectedTab: "All",
    selectedCat: null,
  }),
  getters: {
    categoriesCount(state) {
      return state.categories.length;
    },
  },
  actions: {
    incrementIndex() {
      return this.index++;
    },
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
    updateSelectedCat(value) {
      this.selectedCat = value;
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
      } else if (option === 1) {
        const objList = [];
        this.allNotes.filter((el) => {
          if (this.selectedTab === "All" || el.category === this.selectedTab) {
            el.objList.filter((e) => {
              if (e.note.text.toLowerCase().includes(value)) {
                objList.push(e);
              }
            });
          }
        });
        const ret = [];
        ret.push({ objList: objList });
        this.filteredNotes = ret;
      }
    },
    saveAllNotes(value = this.allNotes) {
      localStorage.setItem(
        this.local,
        JSON.stringify(value, this.getCircularReplacer())
      );
    },
    saveNewNote(note) {
      const found = this.allNotes.find((el) => el.category == this.selectedCat);
      if (!found.objList) found.objList = [];
      found.objList.push({ note: note, id: note.index });
      this.saveAllNotes();
      if (this.selectedTab === this.selectedCat) {
        this.selectTab({ name: this.selectedCat });
      } else {
        this.selectTab({ name: "All" });
        this.updateFilter(0);
      }
      this.updateAllNotes();
      this.filterNotes();
    },
    updateTabs(value) {
      this.tabs = value;
    },
    selectTab(value) {
      this.tabs.forEach((tab) => {
        if (tab.name === value.name) {
          this.selectedTab = value.name;
          this.selectedCat = value.name;
        }
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
    changeDate(date) {
      const ret = new Date(date).toLocaleString("ko-KR", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      return ret;
    },
  },
});
