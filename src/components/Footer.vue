<template>
  <div class="footer-wrapper">
    <ul class="footer">
      <li class="footer-list">
        copyright JinhakApply Internship Season 2, 2022
      </li>
      <li class="footer-list">
        <a href="https://github.com/jinhakapply-dev-internship/todo-list"
          >Github</a
        >
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
  flex-direction: column;
  align-items: center;
}
.footer-list {
  /* float: left; */
  padding-top: 15px;
}
a {
  text-decoration: none;
  color: black;
}
</style>
