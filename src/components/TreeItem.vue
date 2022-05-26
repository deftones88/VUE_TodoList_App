<template>
  <div class="todo__list-wrapper">
    <table class="todo__list-item" v-if="notes">
      <!-- <tr
        class="todo__list-item-tr"
        @mouseenter="active = true"
        @mouseleave="active = false"
        :class="{ activeColor: active }"
      > -->
      <tr class="todo__list-item-tr">
        <!-- <td class="todo__list-item__category" v-if="front">
          <div>
            <span v-if="!depth"> {{ notes.category }}</span>
          </div>
        </td> -->
        <td class="todo__list-item__item" :style="indent">
          <span :style="{ marginRight: '1em' }"></span>
          <span v-if="depth" :style="{ marginRight: '.5em' }">
            <img src="@/assets/arrow-return-right.svg" />
          </span>
          <span class="todo__list-item__checker">
            <input
              type="checkbox"
              ref="checkbox"
              @click="onClickCheckbox(notes, $event)"
              :checked="notes.status"
            />
          </span>
          <span
            class="todo__list-item__text"
            :class="{ 'todo__list-item__text-done': checked || notes.status }"
            >{{ notes.text }}</span
          >
          <input
            class="todo__list-item__text-input"
            :id="`editInput-${notes ? notes.id : 0}`"
            v-show="isEdit"
            v-model="notes.text"
            @keyup.enter="editItem"
          />
        </td>
        <td
          class="todo__list-item__date"
          :class="{ 'todo__list-item__text-done': checked || notes.status }"
        >
          {{ changeDate(notes.updated) }}
        </td>
        <td class="todo__list-item__edit">
          <span @click="editItem" v-show="active">
            <img src="@/assets/pencil.svg" />
          </span>
        </td>
        <td class="todo__list-item__folder">
          <span v-if="depth < 3">
            <span
              @click="makeFolder(notes)"
              v-show="notes && selected !== notes.id && !checked"
            >
              <img src="@/assets/plus-circle.svg" />
            </span>
            <span @click="makeFolder(notes, 1)" v-show="showMatch && !checked">
              <img src="@/assets/plus-circle-dotted.svg" />
            </span>
          </span>
        </td>
        <td class="todo__list-item__delete" @click="deleteNote(notes)">
          <img src="@/assets/x-circle.svg" />
        </td>
        <td class="todo__list-item__fold">
          <span v-if="subs" @click="isOpen = !isOpen">
            <img
              src="@/assets/caret-down-fill.svg"
              :class="{
                'todo__list-item__open': isOpen,
                closed: !isOpen,
              }"
            />
          </span>
        </td>
      </tr>
    </table>
    <InputItem v-show="showMatch" :note="upper"></InputItem>
    <TreeItem
      v-for="sub in subs"
      :key="notes.id + sub.note.id"
      :front="front"
      :subs="sub.children"
      :notes="sub.note"
      :depth="depth + 1"
      :upper="sub"
      :selected="selected"
      v-show="isOpen"
    >
    </TreeItem>
  </div>
</template>

<script>
import InputItem from "./InputItem.vue";
import { mapActions, mapState } from "pinia";
import { useStore } from "@/store/useNotes";

export default {
  components: { InputItem },
  name: "TreeItem",
  props: ["front", "subs", "notes", "upper", "depth", "selected"],
  data() {
    return {
      notesStore: useStore(),
      isOpen: true,
      checked: false,
      isEdit: false,
      preText: "",
      active: false,
      cat: null,
      main: this.$root.$refs.main,
      input: this.$root.$refs.input,
      tabs: this.$root.$refs.tabs,
    };
  },
  methods: {
    ...mapActions(useStore, [
      "updateSelectedCat",
      "saveAllNotes",
      "changeDate",
    ]),
    // 수정용 제귀함수
    recurEdit(allItems, item) {
      // for (let items of allItems) {
      //   if (items.note.id === item.id) {
      //     const newNode = {};
      //     if (items.children) {
      //       newNode["children"] = items.children;
      //     }
      //     newNode["note"] = item;
      //     allItems.splice(allItems.indexOf(items), 1, newNode);
      //     break;
      //   }
      //   if (items.children) this.updateChecked(items.children, item);
      // }
    },
    // todo 수정용 함수
    editItem() {
      // 수정하는 곳 focus
      if (this.active) this.editFocus(this.notes.id);
      // 수정 전에 원래 값 preText에 저장
      if (!this.isEdit) this.preText = this.notes.text;
      // 수정용 토글
      this.isEdit = !this.isEdit;
      // 앞뒤 공백 지우기
      this.notes.text = this.notes.text.trim();
      // 수정 끝났고 텍스트 바뀌었다면 함수 실행
      if (!this.isEdit && this.notes.text !== this.preText) {
        const allNotes = this.main.getAllNotes();
        this.notes.updated = new Date().toISOString();
        this.recurEdit(allNotes, this.notes);
        localStorage.setItem(
          "notesapp-notes",
          JSON.stringify(allNotes, this.input.getCircularReplacer())
        );
        this.tabs.selectTabWName(this.tabs.selected);
        // this.tabs.updateCatFilter(this.tabs.selected);
      }
    },
    // 차일드로 투두 만드는 함수
    makeFolder(notes, val = 0) {
      if (!val) {
        this.main.setSelected(this.notes.id);
        this.input.inputFocus(this.notes.id);
      } else {
        this.main.setSelected(null);
      }
      console.log(notes);
      // this.updateSelectedCat(notes.category);
    },
    // 투두 지울 때용 제귀
    recurDelFunc(items, id, upper) {
      // for (let item of items) {
      //   if (item.note.id === id) {
      //     items.splice(items.indexOf(item), 1);
      //     // 칠드런 배열까지 지워줘야 폴더 접고 닫기 버튼이 안 뜬다
      //     if (upper.children && upper.children.length === 0)
      //       delete upper["children"];
      //     break;
      //   }
      //   if (item.children) this.recurDelFunc(item.children, id, item);
      // }
    },
    // 투두 지우는 함수
    async deleteNote(notes) {
      const ret = await confirm("are you sure?");
      if (ret) {
        const allNotes = this.notesStore.allNotes;
        allNotes.find((el) => {
          for (const object of el.objList) {
            if (object.note === notes) {
              el.objList.splice(el.objList.indexOf(object), 1);
            }
          }
        });
        this.saveAllNotes();
        // this.recurDelFunc(allNotes, id, allNotes);
        // localStorage.setItem(
        //   "notesapp-notes",
        //   JSON.stringify(allNotes, this.input.getCircularReplacer())
        // );
        // this.tabs.selectTabWName(this.tabs.selected);
        // this.tabs.updateCatFilter(this.tabs.selected);
      }
    },
    // 완료된 항목 자식 부모도 상태 확인하는 함수 (work in progress)
    // checkAll(allItems, status) {
    //   if (allItems === undefined || allItems === null) return;
    //   let allDone = true;
    //   for (let items of allItems) {
    //     if (items === null) return;
    //     if (items.note && items.note.status === false) {
    //       allDone = false;
    //       break;
    //     }
    //   }

    //   const parent = allItems[0].parents[0] ? allItems[0].parents[0] : null;
    //   const gParent = parent ? parent.parents : null;
    //   if (allDone && status) {
    //     if (parent) parent.note.status = allDone;
    //     this.checkAll(gParent, status);
    //     // } else if (allDone && !status) {
    //     //   this.checkAll(gParent, status);
    //   } else {
    //     if (parent) parent.note.status = allDone;
    //   }
    //   this.checkAll(allItems[0].parents, status);
    // },
    checkChild(items) {
      // const baby = items.children;
      // for (let child of baby) {
      //   child.note.status = true;
      //   if (child.children) this.checkChild(child);
      // }
    },
    // 체크 상태 업뎃하는 함수
    updateChecked(allItems, item, status) {
      // for (let items of allItems) {
      //   if (items.note.id === item.id) {
      //     const newNode = {};
      //     if (items.children) {
      //       newNode["children"] = items.children;
      //     }
      //     if (items.parents) newNode["parents"] = items.parents;
      //     newNode["note"] = item;
      //     allItems.splice(allItems.indexOf(items), 1, newNode);
      //     this.checkAll(allItems, status);
      //     if (status && items.children) this.checkChild(items);
      //     break;
      //   }
      //   if (items.children) this.updateChecked(items.children, item, status);
      // }
    },
    // 체크하면 호출되는 함수
    onClickCheckbox(notes, e) {
      console.log("notes", notes, e.target);
      let ret;
      this.allNotes.filter((el) => {
        if (el.category === notes.category) {
          ret = el.objList.find((e) => {
            console.log(e.note, e.note === notes);
            return e.note === notes;
          });
        }
      });
      console.log("ret", ret);
      // const allNotes = this.main.getAllNotes();
      // this.checked = e.target.checked;
      // this.notes.status = this.checked;
      // this.notes.updated = new Date().toISOString();
      // this.updateChecked(allNotes, this.notes, this.checked);
      // localStorage.setItem(
      //   "notesapp-notes",
      //   JSON.stringify(allNotes, this.input.getCircularReplacer())
      // );
      // this.tabs.selectTabWName(this.tabs.selected);
      // this.tabs.updateCatFilter(this.tabs.selected);
    },
    // 수정할 때 포커스 해주는 함수
    editFocus(id) {
      // this.$nextTick(() => {
      //   setTimeout(() => {
      //     document.getElementById(`editInput-${id}`).focus();
      //   }, 200);
      // });
    },
  },
  computed: {
    ...mapState(useStore, ["allNotes"]),
    isFolder() {
      return this.subs && this.subs.length;
    },
    indent() {
      return {
        transform: `translate(${this.depth * 20}px)`,
      };
    },
    showMatch() {
      return this.notes && this.selected === this.notes.id;
    },
  },
};
</script>

<style scoped>
.todo__list-wrapper {
  padding: 0.5em 0;
}
.todo__list {
  margin: 20px 0;
}
.todo__list-item {
  width: 100%;
}
.todo__list-item-tr {
  position: relative;
}
.todo__list-item__category {
  width: 20%;
}
.todo__list-item__item {
  text-align: left;
  position: relative;
}
.todo__list-item__text {
  text-align: left;
  padding-left: 0.5em;
}
.todo__list-item__text-input {
  position: absolute;
  left: 20px;
  top: 0;
  bottom: 0;
}
.todo__list-item__text-done {
  color: rgb(173, 173, 173);
  font-style: italic;
}
.todo__list-item__date {
  width: 20%;
}
/* .todo__list-item__fold , */
.todo__list-item__edit,
.todo__list-item__folder,
.todo__list-item__delete {
  width: 5%;
  padding: 0;
}
.activeColor {
  background-color: lightgray;
}
.todo__list-item__fold {
  position: absolute;
  right: -1.5em;
}
.todo__list-item__open {
  transform: rotate(0deg);
  transition: transform 0.2s ease-out;
}
.closed {
  transform: rotate(90deg);
  transition: transform 0.2s ease-out;
}
</style>
