<template>
  <div class="todo__list-wrapper">
    <table class="todo__list-item" v-if="notes">
      <tr
        class="todo__list-item-tr"
        @mouseenter="active = true"
        @mouseleave="active = false"
        :class="{ activeColor: active }"
      >
        <!-- <tr class="todo__list-item-tr"> -->
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
              @click="onClickCheckbox($event)"
              :checked="notes.status"
            />
          </span>
          <span
            class="todo__list-item__text"
            :class="{ 'todo__list-item__text-done': checked || notes.status }"
            >{{ notes.text }}</span
          >
          <input
            type="text"
            class="todo__list-item__text-input"
            :style="indent"
            :id="`editInput-${notes ? notes.id : 0}`"
            v-show="isEdit"
            v-model="notes.text"
            @keyup.enter="editItem"
            @blur="isEdit = false"
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
            <!-- <span @click="editItem"> -->
            <img src="@/assets/pencil.svg" />
          </span>
        </td>
        <td class="todo__list-item__folder">
          <span v-if="depth < 1">
            <span
              @click="makeFolder()"
              v-show="notes && selected !== notes.id && !notes.status"
            >
              <img src="@/assets/plus-circle.svg" />
            </span>
            <span @click="makeFolder(1)" v-show="showMatch && !notes.status">
              <img src="@/assets/plus-circle-dotted.svg" />
            </span>
          </span>
        </td>
        <td class="todo__list-item__delete" @click="deleteNote()">
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
    <InputBar v-show="showMatch" :note="upper"></InputBar>
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
import InputBar from "./InputBar.vue";
import { mapActions, mapState } from "pinia";
import { useStore } from "@/store/useNotes";

export default {
  components: { InputBar },
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
    };
  },
  methods: {
    ...mapActions(useStore, [
      "updateAllNotes",
      "updateSelectedCat",
      "updateSelectedTask",
      "updateChild",
      "saveAllNotes",
      "filterNotes",
      "changeDate",
    ]),
    // 수정 시 자식 도는 함수
    checkChildForEdit(items) {
      const editable = items.find((item) => item.index === this.notes.id);
      if (editable) {
        editable.note.text = this.notes.text;
        editable.note.updated = new Date().toISOString();
      } else {
        for (let item of items) {
          if (item.index === this.notes.id.substring(0, item.index.length)) {
            for (let child of item.children) {
              if (child.index === this.notes.id) {
                child.note.text = this.notes.text;
                child.note.updated = new Date().toISOString();
              }
            }
          }
        }
      }
      return items;
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
        this.allNotes.every((el) => {
          if (el.category === this.notes.category) {
            const filtered = this.checkChildForEdit(el.objList);
            el.objList = filtered;
            return false;
          }
          return true;
        });
        this.saveAllNotes();
        this.updateAllNotes();
        this.filterNotes();
      }
    },
    inputFocus(id) {
      this.$nextTick(() => {
        document.getElementById(`textArea-${id}`).focus();
      });
    },
    // 차일드로 투두 만드는 함수
    makeFolder(val = 0) {
      if (!val) {
        this.updateSelectedTask(this.notes.id);
        this.inputFocus(this.notes.id);
        this.updateChild(true);
      } else {
        this.updateSelectedTask(null);
        this.updateChild(false);
      }
      // this.updateSelectedCat(notes.category);
    },
    // 투두 지울 때용 제귀
    checkChildForDel(items) {
      if (items.filter((item) => item.index === this.notes.id).length) {
        const ret = items.filter((item) => item.index !== this.notes.id);
        items = ret;
        return items;
      } else {
        for (let item of items) {
          if (item.index === this.notes.id.substring(0, item.index.length)) {
            const found = this.checkChildForDel(item.children);
            if (!found.length) delete item["children"];
            else item.children = found;
            return items;
          }
        }
      }
    },
    // 투두 지우는 함수
    async deleteNote(e) {
      const ret = await confirm("are you sure?");
      if (ret) {
        this.allNotes.every((el) => {
          if (el.category === this.notes.category) {
            const filtered = this.checkChildForDel(el.objList);
            el.objList = filtered;
            return false;
          }
          return true;
        });
        this.saveAllNotes();
        this.updateAllNotes();
        this.filterNotes();
      }
    },
    // 체크 상태 업뎃하는 함수
    checkChildForStatus(items) {
      const editable = items.find((item) => item.index === this.notes.id);
      if (editable) {
        editable.note.status = this.checked;
        editable.note.updated = new Date().toISOString();
        if (this.checked === true) {
          if (editable.children) {
            for (let child of editable.children) {
              child.note.status = true;
              child.note.updated = new Date().toISOString();
            }
          }
        }
      } else {
        for (let item of items) {
          if (item.index === this.notes.id.substring(0, item.index.length)) {
            let count = 0;
            for (let child of item.children) {
              if (child.index === this.notes.id) {
                child.note.status = this.checked;
                child.note.updated = new Date().toISOString();
              }
              if (child.note.status === true) ++count;
            }
            if (count === item.children.length) {
              item.note.status = true;
              item.note.updated = new Date().toISOString();
            } else {
              item.note.status = false;
            }
          }
        }
      }
      return items;
    },
    // 체크하면 호출되는 함수
    onClickCheckbox(e) {
      this.allNotes.every((el) => {
        if (el.category === this.notes.category) {
          this.checked = e.target.checked;
          const filtered = this.checkChildForStatus(el.objList);
          el.objList = filtered;
          return false;
        }
        return true;
      });
      this.saveAllNotes();
      this.updateAllNotes();
      this.filterNotes();
    },
    // 수정할 때 포커스 해주는 함수
    editFocus(id) {
      this.$nextTick(() => {
        setTimeout(() => {
          document.getElementById(`editInput-${id}`).focus();
        }, 100);
      });
    },
  },
  computed: {
    ...mapState(useStore, ["allNotes"]),
    isFolder() {
      return this.subs && this.subs.length;
    },
    indent() {
      return {
        transform: `translate(${this.depth * 28}px)`,
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
  border-spacing: 0;
}
.todo__list-item-tr {
  position: relative;
}
td {
  padding: 0.1em 0;
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
  left: 45px;
  top: -2px;
  bottom: 0;
  height: 100%;
  font-size: 1em;
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
  background-color: rgb(235, 235, 235);
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
