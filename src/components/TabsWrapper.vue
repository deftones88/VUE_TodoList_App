<template>
  <div>
    <header class="tabs">
      <ul @click="updateVisibleCat(false)">
        <li
          v-for="(tab, index) in tabs"
          :key="index"
          :class="{ 'is-active': tab.name == selectedTab }"
        >
          <div
            class="nav-item"
            @click="
              selectTab(tab);
              updateCatFilter(tab.name);
            "
          >
            {{ tab.name }}
          </div>
        </li>
      </ul>
    </header>
    <section class="tab">
      <slot></slot>
    </section>
  </div>
</template>

<script>
import { mapActions, mapState } from "pinia";
import { useStore } from "@/store/useNotes";

export default {
  name: "TabsWrapper",
  data() {
    return {
      notesStore: useStore(),
    };
  },
  methods: {
    ...mapActions(useStore, [
      "updateAllNotes",
      "updateFilter",
      "updateTabs",
      "updateVisibleCat",
      "selectTab",
    ]),
    selectTabWName(name) {
      this.tabs.forEach((tab) => {
        if (tab.name === name) this.selected = name;
      });
    },
    updateCatFilter(input) {
      if (input === "All") {
        this.updateFilter(0);
        return;
      }
      this.updateFilter(input);
    },
    renderTabs() {
      const tabbers = [];
      setTimeout(() => {
        for (const tab of this.$children) {
          tabbers.push({ name: tab.name, selected: tab.selected });
        }
        this.updateTabs(tabbers);
      }, 100);
    },
  },
  mounted() {
    this.renderTabs();
    this.$root.$refs.tabs = this;
  },
  computed: {
    ...mapState(useStore, ["tabs", "selectedTab", "categories"]),
  },
  watch: {
    categories() {
      // 카테고리 업뎃 때마다 탭 추가
      this.renderTabs();
    },
  },
};
</script>

<style scoped>
.tabs {
  overflow-x: auto;
}
.tabs > ul {
  display: flex;
  flex-direction: row;
  align-content: center;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 0;
  margin: 0 1em;
  list-style: none;
}
.tabs > ul > li {
  border-bottom: 1px solid lightgray;
  border-radius: 2px;
  line-height: 2.5;
  align-items: center;
  padding: 0 1em;
}
.nav-item {
  padding: 0;
  cursor: pointer;
}
.tabs > ul > li:hover {
  color: rgb(76, 113, 235);
}
.tabs > ul > li.is-active {
  background-color: rgb(76, 113, 235);
  color: white;
}
</style>
