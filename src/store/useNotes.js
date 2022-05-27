import { defineStore } from "pinia";

export const useStore = defineStore("savedNotes", {
  state: () => ({
    allNotes: [],
    filteredNotes: [],
    categories: [],
    local: "notes_app",
    filter: "", // filter for allNotes
    filteredLength: 0,
    tabs: [],
    selectedTask: null,
    selectedTab: "All",
    selectedCat: null,
    visibleCat: false, // category dropdown toggle
    child: false,
  }),
  getters: {
    categoriesCount(state) {
      return state.categories.length;
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
    updateSelectedTask(value) {
      this.selectedTask = value;
    },
    updateSelectedCat(value) {
      this.selectedCat = value;
    },
    updateVisibleCat(value) {
      this.visibleCat = value;
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
          this.filteredLength = this.allNotes.length;
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
      const status = {
        true: 1,
        false: 2,
      };
      for (let notes of this.filteredNotes) {
        notes.objList.sort((a, b) => {
          if (status[a.note.status] > status[b.note.status]) return -1;
          if (status[a.note.status] < status[b.note.status]) return 1;
          if (a.note.updated > b.note.updated) return 1;
          if (a.note.updated < b.note.updated) return -1;
        });
      }
    },
    saveAllNotes(value = this.allNotes) {
      localStorage.setItem(
        this.local,
        JSON.stringify(value, this.getCircularReplacer())
      );
    },
    saveNewNote(note) {
      if (note) {
        const found = this.allNotes.find(
          (el) => el.category == this.selectedCat
        );
        if (!found.objList) found.objList = [];
        found.objList.push({ note: note, index: note.id });
      }
      this.saveAllNotes();
      if (this.selectedTab === this.selectedCat) {
        this.selectTab({ name: this.selectedCat });
      } else {
        this.selectTab({ name: "All" });
        this.selectedCat = null;
        this.updateFilter(0);
      }
      this.updateAllNotes();
      this.filterNotes();
    },
    updateTabs(value) {
      this.tabs = value;
    },
    updateChild(value) {
      this.child = value;
    },
    selectTab(value) {
      this.tabs.forEach((tab) => {
        if (tab.name === value.name) {
          this.selectedTab = value.name;
          if (value.name === "All") this.selectedCat = "Category";
          else this.selectedCat = value.name;
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
