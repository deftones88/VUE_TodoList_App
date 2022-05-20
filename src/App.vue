<template>
  <div id="app">
    <Header />
    <MainPage />
    <Footer />
  </div>
</template>

<script>
import Header from "./components/Header.vue";
import Footer from "./components/Footer.vue";
import MainPage from "./pages/Main.vue";

export default {
  name: "App",
  components: {
    Header,
    Footer,
    MainPage,
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
.router-wrapper {
  min-height: 60vh;
}
</style>
