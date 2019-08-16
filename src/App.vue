<template>
  <div id="app">
    <a-layout id="components-layout-demo-top-side-2" style="min-height: 100vh">
      <a-layout-header class="header">
        <div class="logo" />
        <a-menu
          theme="dark"
          mode="horizontal"
          :defaultSelectedKeys="['1']"
          :style="{ lineHeight: '64px' }"
        >
          <a-menu-item key="1">Data</a-menu-item>
          <a-menu-item key="2">View</a-menu-item>
          <a-menu-item key="3">Analyze</a-menu-item>
        </a-menu>
      </a-layout-header>
      <PageView></PageView>
    </a-layout>
  </div>
</template>

<script>
import PageView from "./components/PageView.vue";

export default {
  name: "app",
  components: {
    PageView
  },
  data() {
    return {};
  },
  methods: {}
};
</script>

<style scoped>
/* #app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
} */
#components-layout-demo-top-side-2 .logo {
  width: 120px;
  height: 31px;
  background: rgba(255, 255, 255, 0.2);
  margin: 16px 28px 16px 0;
  float: left;
}
</style>
