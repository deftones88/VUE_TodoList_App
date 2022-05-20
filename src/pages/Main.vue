<template>
  <div class="wrapper">
    <div class="todo_wrapper">
      <InputItem :note="null"></InputItem>
      <div class="filtered">
        <!-- <select
          v-model="selectedCat"
          @click="updateCat"
          @change="updateCatFilter(0)"
        >
          <option value="default">Sort</option>
          <option v-for="cat in categories" :key="cat" :value="cat">
            {{ cat.length > 20 ? cat.substring(0, 20) + "..." : cat }}
          </option>
        </select> -->
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
      <div class="tabs-wrapper" v-show="categories.length">
        <TabsWrapper>
          <Tab name="All" selected="true">
            <div class="tree_wrapper">
              <TreeItem
                v-for="notes in allNotes"
                :key="notes.note.id + 'outer'"
                :front="true"
                :notes="notes.note"
                :subs="notes.children"
                :upper="notes"
                :depth="0"
                :selected="selected"
              />
            </div>
          </Tab>
          <Tab v-for="(cat, index) in categories" :key="index" :name="cat">
            <div class="tree_wrapper">
              <TreeItem
                v-for="notes in allNotes"
                :key="notes.note.id + 'outer'"
                :front="false"
                :notes="notes.note"
                :subs="notes.children"
                :upper="notes"
                :depth="0"
                :selected="selected"
              />
            </div>
          </Tab>
        </TabsWrapper>
      </div>
      <div class="empty" v-if="!allNotes.length">Add New Tasks</div>
    </div>
  </div>
</template>

<script>
import TreeItem from "@/components/TreeItem.vue";
import InputItem from "@/components/InputItem.vue";
import Tab from "@/components/Tab.vue";
import TabsWrapper from "../components/TabsWrapper.vue";

export default {
  components: { TreeItem, InputItem, Tab, TabsWrapper },
  name: "Jhk",
  data() {
    return {
      allNotes: {},
      selected: null,
      // selectedCat: "default",
      categories: [],
      searchKey: "",
    };
  },
  methods: {
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
    getAllNotes() {
      let notes = JSON.parse(localStorage.getItem("notesapp-notes") || "[]");
      this.setParents(notes, null);
      return notes.sort((a, b) => {
        if (a.note.category > b.note.category) return 1;

        if (a.note.category < b.note.category) return -1;

        if (new Date(a.note.updated) > new Date(b.note.updated)) return 1;
        if (new Date(a.note.updated) < new Date(b.note.updated)) return -1;
      });
    },
    // getAllNotes에서 리턴한 데이터 저장시키는 함수
    updateList() {
      this.allNotes = this.getAllNotes();
    },
    // input 창 한 번에 하나만 뜨도록 selected 변수 정해주는 함수
    // InputItem에서 호출함
    setSelected(num) {
      this.selected = num;
    },
    // 카테고리 별 분류할 때 쓰려고 카테고리를 InputItem에서 불러와 업뎃하는 함수
    updateCat() {
      this.categories = this.$root.$refs.input.getAllCat();
    },
    // 선택된 카테고리로 분류하는 함수
    updateCatFilter(input) {
      this.updateList();
      let cat;
      if (!input) cat = "default";
      else cat = input;
      if (cat !== "default") {
        this.allNotes = this.allNotes.filter(
          (notes) => notes.note.category == cat
        );
      }
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
      let ret = [];
      const text = this.searchKey.toLowerCase();
      const getNote = this.getAllNotes();
      for (let notes of getNote) ret.push(...this.recursText(notes, text));
      this.allNotes = ret;
      this.selectedCat = "default";
    },
    // 단어 검색창의 X 누르면 초기화하는 함수
    searchInputDel() {
      this.searchKey = "";
      this.updateList();
    },
  },
  mounted() {
    this.updateList();
    this.updateCat();
  },
  created() {
    this.$root.$refs.main = this;
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
.tree_wrapper {
  padding-top: 1em;
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
.tabs-wrapper {
  margin-top: 1em;
}
</style>
