<template>
  <div class="wrapper">
    <div class="todo_wrapper">
      <InputBar :note="null"></InputBar>
      <div class="filtered" @click="updateVisibleCat(false)">
        <div class="searchInput">
          <input
            v-model="searchKey"
            placeholder="Search..."
            @keyup.enter="searchList"
          />
          <span class="searchInput__delete" @click="searchInputDel">
            <img src="@/assets/x.svg" />
          </span>
        </div>
      </div>
      <div
        class="tabs-wrapper"
        v-show="categories.length"
        @click="updateVisibleCat(false)"
      >
        <div>
          <TabsWrapper>
            <Tab name="All" selected="true">
              <div
                class="tree_wrapper"
                v-for="notes in filteredNotes"
                :key="notes.id"
                v-show="notes.objList.length"
              >
                <h1 class="category_title" v-if="selectedTab === 'All'">
                  {{ notes.category }}
                </h1>
                <TreeItem
                  v-for="(obj, index) in notes.objList"
                  :key="index"
                  :front="true"
                  :notes="obj.note"
                  :subs="obj.children"
                  :upper="obj"
                  :depth="0"
                  :selected="selected"
                />
              </div>
            </Tab>
            <Tab
              v-for="(cat, index) in categories"
              :key="index + categories.length"
              :name="cat"
            >
              <div
                class="tree_wrapper"
                v-for="notes in filteredNotes"
                :key="notes.id"
              >
                <TreeItem
                  v-for="(obj, index) in notes.objList"
                  :key="index"
                  :front="false"
                  :notes="obj.note"
                  :subs="obj.children"
                  :upper="obj"
                  :depth="0"
                  :selected="selected"
                />
              </div>
            </Tab>
          </TabsWrapper>
        </div>
      </div>
      <div
        class="empty"
        v-if="!filteredLength"
        @click="updateVisibleCat(false)"
      >
        Add New Tasks
      </div>
    </div>
  </div>
</template>

<script>
import TreeItem from "@/components/TreeItem.vue";
import InputBar from "@/components/InputBar.vue";
import Tab from "@/components/Tab.vue";
import TabsWrapper from "@/components/TabsWrapper.vue";

import { mapActions, mapState } from "pinia";
import { useStore } from "@/store/useNotes";

export default {
  components: { TreeItem, InputBar, Tab, TabsWrapper },
  name: "Jhk",
  data() {
    return {
      notesStore: useStore(),
      selected: null,
      searchKey: "",

      testing: "",
      save: {
        updated: null,
        text: "",
      },
      allTests: [],
      index: 0,
      input: this.$root.$refs.input,
    };
  },
  methods: {
    ...mapActions(useStore, [
      "updateAllNotes",
      "updateCategories",
      "updateVisibleCat",
      "filterNotes",
    ]),
    byteSize(val) {
      const len = new Blob([val]).size;
      return len;
    },
    // localStorage에서 불러올 때 circular reference 때문에 지웠던 parents를 다시 더하는 함수
    setParents(object, parents) {
      for (var key in object) {
        object[key].parents = [];
        object[key].parents.push(parents);
        if (object[key].children) {
          this.setParents(object[key].children, object[key]);
        }
      }
    },
    // localStorage에 저장된 data 가져오는 함수
    // getAllNotes() {
    //   let notes = JSON.parse(localStorage.getItem("notesapp-notes") || "[]");
    //   this.setParents(notes, null);
    //   return notes.sort((a, b) => {
    //     if (a.note.category > b.note.category) return 1;

    //     if (a.note.category < b.note.category) return -1;

    //     if (new Date(a.note.updated) > new Date(b.note.updated)) return 1;
    //     if (new Date(a.note.updated) < new Date(b.note.updated)) return -1;
    //   });
    // },
    // input 창 한 번에 하나만 뜨도록 selected 변수 정해주는 함수
    // InputItem에서 호출함
    setSelected(num) {
      this.selected = num;
    },
    // 단어 검색 필터용 제귀함수
    recursText(item, text) {
      let total = [];
      if (item.note && item.note.text) {
        if (item.note.text.toLowerCase().includes(text))
          total.push({ note: item.note });
      }
      if (item.children) {
        for (let child of item.children)
          total.push(...this.recursText(child, text));
      }
      return total;
    },
    // 단어로 필터해서 리스트 뿌리는 함수
    searchList() {
      const text = this.searchKey.toLowerCase();

      this.filterNotes(text, 1);
    },
    // 단어 검색창의 X 누르면 초기화하는 함수
    searchInputDel() {
      this.searchKey = "";
      this.filterNotes();
    },
  },
  mounted() {
    this.updateAllNotes();
    this.filterNotes();
    this.updateCategories();
  },
  created() {
    this.$root.$refs.main = this;
  },
  computed: {
    ...mapState(useStore, [
      "allNotes",
      "filter",
      "filteredNotes",
      "filteredLength",
      "selectedTab",
      "categories",
    ]),
  },
  watch: {
    filter() {
      this.filterNotes();
    },
  },
};
</script>

<style scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.todo_wrapper {
  /* border: 1px black solid; */
  width: 800px;
  min-height: 250px;
}
.filtered {
  display: flex;
  /* justify-content: space-between; */
  justify-content: flex-end;
  margin: 0 12px;
  background-color: aliceblue;
  padding: 5px;
}
.filtered > select {
  padding: 0.5em;
}
.tabs-wrapper {
  margin-top: 1em;
}
.tree_wrapper {
  margin-bottom: 2em;
}
.category_title {
  margin: 1em 1em 0.5em;
  text-align: left;
}
.searchInput {
  position: relative;
}
.searchInput > input {
  padding: 0.2em 0.5em;
}
.searchInput__delete {
  position: absolute;
  right: 2px;
  padding: 0.2em 0.5em;
  cursor: pointer;
}
.empty {
  padding: 1em;
  margin-top: 3em;
  font-size: 1.5em;
  color: rgb(145, 144, 144);
}
</style>
