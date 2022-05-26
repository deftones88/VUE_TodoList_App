<template>
  <div>
    <div class="pop-up" v-show="popup">
      <span>Category deleted...</span>
    </div>
    <div class="todo__wrapper">
      <div class="todo__create">
        <div class="todo__category" v-if="!note">
          <div class="selected-item" @click="onClickSelectedItem">
            <span v-if="selectedCat">
              {{
                selectedCat.length > 15
                  ? selectedCat.substring(0, 15) + "..."
                  : selectedCat
              }}
            </span>
            <span v-else>Category</span>
          </div>
          <div class="dropdown" v-show="visibleCat">
            <input
              id="input"
              v-model="searchCat"
              type="text"
              placeholder="Add new..."
              @keyup.enter="addNewCat"
            />
            <div class="options">
              <ul v-show="notesStore.categoriesCount">
                <li v-for="(name, index) of filteredCat" :key="`name-${index}`">
                  <span class="options_name" @click="selectCat(name)">{{
                    name
                  }}</span>
                  <span class="options_delete" @click="deleteCat(name)">
                    <img src="@/assets/x.svg"
                  /></span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="todo__input-wrapper">
          <textarea
            v-model="noteToSave.text"
            class="todo__input"
            :id="`textArea-${note ? note.id : 0}`"
            rows="1.5"
            @keyup.enter="saveNote"
            @keydown.enter.prevent
            placeholder="Press Enter to submit"
          ></textarea>
          <button class="todo__input_button" @click="saveNote">등록</button>
        </div>
      </div>
      <div class="text_filter-wrapper">
        <ul
          v-show="noteToSave.text.length > 0 && filteredText.length"
          class="text_filter"
        >
          <li v-for="(text, index) of filteredText" :key="`text-${index}`">
            <span class="text_filter-text">{{ text.note.text }}</span>
            <span class="text_filter-updated">
              {{ changeDate(text.note.updated) }}
            </span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from "pinia";
import { useStore } from "@/store/useNotes";

export default {
  name: "InputItem",
  props: ["note"],
  data() {
    return {
      notesStore: useStore(),
      searchCat: "", // 카테고리에 입력한 값
      visibleCat: false, // 카테고리 목록 창 toggle
      noteToSave: {
        category: null,
        id: null,
        text: "",
        updated: "",
        status: false,
      },
      popup: false, // 카테고리 삭제시 나오는 팝업
      main: this.$root.$refs.main,
      tabs: this.$root.$refs.tabs,
    };
  },
  methods: {
    ...mapActions(useStore, [
      "updateAllNotes",
      "updateCategories",
      "updateFilter",
      "updateSelectedCat",
      "saveAllNotes",
      "saveNewNote",
      "selectTab",
      "filterNotes",
      "changeDate",
      "incrementIndex",
    ]),
    // pop up
    showPopup() {
      this.popup = true;
      setTimeout(() => {
        this.popup = false;
      }, 1500);
    },
    // 투두 아이템 초기화 함수
    resetNoteToSave() {
      this.noteToSave.category = this.selectCategory;
      this.noteToSave.text = "";
      this.noteToSave.updated = "";
    },
    // 인풋 포커스 해주는 함수
    onClickSelectedItem() {
      this.visibleCat = !this.visibleCat;
      window.setTimeout(() => document.getElementById("input").focus(), 0);
    },
    // 차일드 만들어주는 재귀 함수
    // recurFunc(items) {
    //   for (let item of items) {
    //     if (item.id === this.note.id) {
    //       if (!item.children) item.children = [];
    //       item.children.push({ note: this.noteToSave, parents: item });
    //       break;
    //     }
    //     if (item.children) this.recurFunc(item.children);
    //   }
    // },
    // 카테고리 선택 함수
    selectCat(cat) {
      this.updateSelectedCat(cat);
      this.visibleCat = false;
      document.getElementsByClassName("todo__input")[0].focus();
    },
    // 카테고리 삭제 함수
    async deleteCat(category) {
      const answer = confirm(
        "this will erase all tasks included in this category"
      );
      if (answer) {
        const newNotes = this.allNotes.filter((el) => el.category !== category);
        this.saveAllNotes(newNotes);
        this.updateAllNotes();
        this.updateCategories();
        this.filterNotes();
      }
    },
    // 카테고리 추가 함수
    addNewCat() {
      // 입력한 새 category가 공백인지 체크
      this.searchCat = this.searchCat.trim();
      if (this.searchCat.length < 1) return;
      // 입력한 새 category가 이미 존재하는지 체크
      const check = this.notesStore.categories;
      const exists = check.filter((item) => item === this.searchCat);
      if (exists.length) return;
      // 저장
      this.allNotes.push({ category: this.searchCat, objList: [] });
      this.saveAllNotes();

      this.visibleCat = false; // 카테고리 목록 창 닫기
      this.updateSelectedCat(this.searchCat); // 선택된 카테고리 표시
      this.searchCat = ""; // 카테고리 검색어 초기화
      this.updateCategories();
    },
    // 투두 저장
    saveNote() {
      // 카테고리 지정 안 할 시 경고
      if (!(this.selectedCat || this.note)) {
        alert("Choose a category");
        return;
      }
      // if (!this.selectedCat) this.updateSelectedCat(this.note.note.category);

      // 텍스트 공백 확인
      this.noteToSave.text = this.noteToSave.text.trim();
      if (this.noteToSave.text.length < 1) return;
      // 투두 값 대입
      this.noteToSave.category = this.selectedCat;
      console.log("cat", this.noteToSave.category);
      this.noteToSave.id = this.incrementIndex();
      console.log("id", this.noteToSave.id);
      this.noteToSave.updated = new Date().toISOString();
      // 투두 저장
      this.saveNewNote(this.noteToSave);
      this.resetNoteToSave();
    },
    // 새로운 투두 입력할 때 사용하는 제귀함수
    // recursText(item, text) {
    //   let total = [];
    //   if (item.objList.length) {
    //     console.log(item.objList);
    //   }
    // for (let notes of item) {
    //   if (notes.note && notes.note.text) {
    //     if (notes.note.text.toLowerCase().includes(text))
    //       total.push(notes.note);
    //   }
    //   if (notes.children) {
    //     for (let child of notes.children)
    //       total.push(...this.recursText(child, text));
    //   }
    // }

    // return total;
    // },
    // 인풋창 포커스
    inputFocus(id) {
      // this.$nextTick(() => {
      //   document.getElementById(`textArea-${id}`).focus();
      // });
    },
  },
  computed: {
    ...mapState(useStore, ["selectedCat", "selectedTab", "local", "allNotes"]),
    // 새 카테고리 쓸 때 밑에 비슷한 거 보여주는 함수
    filteredCat() {
      const category = this.searchCat.toLowerCase();
      if (this.searchCat.length < 1) return this.notesStore.categories;
      return this.notesStore.categories.filter((cat) =>
        String(cat).toLowerCase().includes(category)
      );
    },
    // 새로운 투두 텍스트 입력할 때 밑에 비슷한 이전 입력 값들 보여주는 함수
    filteredText() {
      const ret = [];
      const text = this.noteToSave.text.toLowerCase();
      for (let notes of this.notesStore.allNotes) {
        ret.push(
          ...notes.objList.filter((obj) =>
            obj.note.text.toLowerCase().includes(text)
          )
        );
      }
      return ret.sort((a, b) => {
        new Date(a.note.updated) > new Date(b.note.updated) ? 1 : -1;
      });
    },
  },
  created() {
    this.updateAllNotes();
    this.updateCategories();

    this.$root.$refs.input = this;
  },
};
</script>

<style scoped>
.todo__wrapper {
  position: relative;
}
.todo__create {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  padding: 1em;
}
.todo__category {
  width: 160px;
  position: relative;
  margin-right: 15px;
}
.selected-item {
  border: 1px solid black;
  padding: 4px 1px;
  cursor: pointer;
}
.dropdown {
  position: absolute;
  border: 2px solid lightgray;
  top: 34px;
  left: 0;
  right: 0;
  background-color: #fff;
  max-width: 100%;
  z-index: 99;
}
.dropdown > input {
  width: 100%;
  height: 30px;
  border: 2px solid lightgray;
  font-size: 1em;
  padding-left: 5px;
}
.options > ul {
  list-style: none;
  text-align: left;
  max-height: 200px;
  padding: 0;
  overflow-y: scroll;
  overflow-x: scroll;
  margin-bottom: 1px;
}
.options > ul > li {
  /* width: 100%; */
  border-bottom: 1px solid lightgray;
  padding: 10px;
  background-color: #f1f1f1;
  cursor: pointer;
  position: relative;
}
.options_name {
  width: 100%;
}
.options_delete {
  position: absolute;
  right: 0;
  padding: 0 0.2em;
}
.options > ul > li:hover {
  background: #78878a;
  color: #fff;
}

.pop-up {
  position: absolute;
  right: 1em;
  top: 10em;
  z-index: 99;
  padding: 0.5em 1em;
  background-color: rgb(167, 218, 165);
  border-radius: 0.2em;
  font-weight: 600;
  animation: fadeout 3;
  -moz-animation: fadeout 3s; /* Firefox */
  -webkit-animation: fadeout 3s; /* Safari and Chrome */
  -o-animation: fadeout 3s; /* Opera */
  animation-fill-mode: forwards;
}
@keyframes fadeout {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
@-moz-keyframes fadeout {
  /* Firefox */
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
@-webkit-keyframes fadeout {
  /* Safari and Chrome */
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
@-o-keyframes fadeout {
  /* Opera */
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
.todo__input-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  width: 80%;
  position: relative;
  z-index: 90;
}
.todo__input {
  flex-grow: 1;
  font-size: 1.2em;
  line-height: 1.5;
  border: 2px solid lightgray;
  border-radius: 3px;
  min-width: 50%;
  max-width: 90%;
  resize: none;
  /* overflow-y: scroll; */
  overflow: auto;
}
.todo__input_button {
  padding: 0.45em 0.8em;
  margin-left: 0.5em;
  border: none;
  background-color: rgb(155, 154, 154);
  color: white;
  border-radius: 0.2em;
}
.todo__input_button:hover {
  background-color: gray;
  color: white;
}

.text_filter {
  position: absolute;
  border: 1px solid black;
  background: #fff;
  z-index: 99;
  width: 66.5%;
  right: 81px;
  top: 50px;
  padding: 0.5em;
  list-style: none;
  max-height: 300px;
  overflow-y: scroll;
}
.text_filter > li {
  display: flex;
  justify-content: space-between;
  height: 2em;
  align-items: center;
}
.text_filter-text,
.text_filter-updated {
  padding: 0.2em;
}
.searchOptions {
  display: flex;
  justify-content: space-between;
  margin: 0 15px;
}
</style>
