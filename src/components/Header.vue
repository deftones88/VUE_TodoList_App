<template>
  <div @click="updateVisibleCat(false)">
    <nav class="headerNav">
      <h1>Todo List</h1>
    </nav>
  </div>
</template>

<script>
import { mapActions } from "pinia";
import { useStore } from "@/store/useNotes";

export default {
  name: "Header",
  data() {
    return {};
  },
  methods: {
    ...mapActions(useStore, ["updateVisibleCat"]),
  },
};
</script>
<style scoped>
.headerNav {
  margin: 48px 0 40px;
}
</style>
