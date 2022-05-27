<template>
  <div class="footer-wrapper">
    <ul class="footer">
      <li class="footer-list">JHK 2022</li>
      <li class="footer-list">
        <a href="https://github.com/deftones88/VUE_TodoList_App">Github</a>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.footer-wrapper {
  text-align: center;
  /* display: table;
    margin: 0 auto; */
}
.footer {
  list-style-type: none;
  margin: 50px 0;
  overflow: hidden;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0;
}
.footer-list {
  /* float: left; */
  padding: 0 1em;
}
a {
  text-decoration: none;
  color: black;
}
</style>
