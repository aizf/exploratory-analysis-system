<template>
  <div id="app">
    <!-- <Test @welcome="testFn" /> -->
    <a-layout id="app-layout" style="min-height: 100vh">
      <a-layout-header class="header" style="height:50px">
        <div class="logo" />
        <a-menu
          theme="dark"
          mode="horizontal"
          :defaultSelectedKeys="['1']"
          :style="{ lineHeight: '50px' }"
        >
          <a-menu-item key="Data">
            <router-link to="/Data">Data</router-link>
          </a-menu-item>
          <a-menu-item key="View" :disabled="!dataSelected">
            <a-tooltip placement="bottom" :title="pageViewTooltipTitle">
              <router-link to="/View">View</router-link>
            </a-tooltip>
          </a-menu-item>
          <a-menu-item key="Analyze" :disabled="!dataSelected">
            <a-tooltip placement="bottom" :title="pageAnalyzeTooltipTitle">
              <router-link to="/Analyze">Analyze</router-link>
            </a-tooltip>
          </a-menu-item>
        </a-menu>
      </a-layout-header>
      <router-view></router-view>
      <!-- <keep-alive> -->
      <!-- <component :is="currentPage"></component> -->
      <!-- </keep-alive> -->
    </a-layout>
  </div>
</template>

<script>
import Vue from "vue";
import { Layout, Menu, Tooltip } from "ant-design-vue";
Vue.use(Layout);
Vue.use(Menu);
Vue.use(Tooltip);
import { mapState } from "vuex";
// import PageData from "@/components/PageData.vue";
// import PageView from "@/components/PageView.vue";
// import PageAnalyze from "@/components/PageAnalyze.vue";
// import Test from "@/components/Test.vue";

export default {
  name: "app",
  components: {
    // PageData,
    // PageView,
    // PageAnalyze,
    // Test
  },
  data() {
    return {
      t: { a: 1, b: 2 }
    };
  },
  methods: {
    testFn() {
      alert("123");
    }
  },
  computed: {
    ...mapState({
      selectedDataset: state => state.data.selectedDataset
    }),
    dataSelected() {
      // 判断是否选择了数据集
      return this.selectedDataset !== "";
    },
    pageViewTooltipTitle() {
      return !this.dataSelected ? "请先在左侧选择数据" : "数据可视化界面";
    },
    pageAnalyzeTooltipTitle() {
      return !this.dataSelected ? "请先在左侧选择数据" : "交互分析界面";
    }
  },
  created() {
    if (this.$route.name !== "Data" && !this.dataSelected) {
      this.$router.push("/Data");
    }
  },
  mounted() {
    console.log(this);
    console.log(this.$children);
    console.log("state", this.$store.state);
    console.log("getters", this.$store.getters);
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
#app-layout .logo {
  width: 120px;
  height: 31px;
  background: rgba(255, 255, 255, 0.2);
  margin: 10px 28px 10px 0;
  float: left;
}
</style>
