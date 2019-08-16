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
          <a-menu-item key="1" @click="currentPageKey='1'">Data</a-menu-item>
          <a-menu-item key="2" @click="currentPageKey='2'">View</a-menu-item>
          <a-menu-item key="3" @click="currentPageKey='3'">Analyze</a-menu-item>
        </a-menu>
      </a-layout-header>
      <keep-alive>
        <component :is="currentPage"></component>
      </keep-alive>
    </a-layout>
  </div>
</template>

<script>
import PageData from "./components/PageData.vue";
import PageView from "./components/PageView.vue";
import PageAnalyze from "./components/PageAnalyze.vue";

export default {
  name: "app",
  components: {
    PageData,
    PageView,
    PageAnalyze
  },
  data() {
    return {
      currentPageKey: "1"
    };
  },
  methods: {},
  computed: {
    currentPage() {
      switch (this.currentPageKey) {
        case "1":
          return "PageData";
          break;
        case "2":
          return "PageView";
          break;
        case "3":
          return "PageAnalyze";
          break;
        default:
          break;
      }
    }
  }
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
