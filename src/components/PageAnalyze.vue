<template>
  <a-layout>
    <a-layout-sider
      width="200"
      theme="light"
      style="background: #fff"
      collapsible
      collapsedWidth="80"
    >
      <a-menu
        mode="inline"
        :defaultSelectedKeys="['1']"
        :defaultOpenKeys="['sub1']"
        :style="{ height: '100%', borderRight: 0 }"
        :inlineIndent="24"
      >
        <a-sub-menu key="sub1">
          <span slot="title">
            <a-icon type="user" />
            <span>PageAnalyze</span>
          </span>
          <!--  -->
          <a-menu-item key="1">miserables.json</a-menu-item>
        </a-sub-menu>

        <a-sub-menu key="sub2">
          <span slot="title">
            <a-icon type="laptop" />
            <span>hierarchical</span>
          </span>

          <a-menu-item key="4">readme.json</a-menu-item>
          <a-menu-item key="5">DataFlow</a-menu-item>
          <a-menu-item key="6">OprationFlow</a-menu-item>
        </a-sub-menu>

        <a-sub-menu key="sub3">
          <span slot="title">
            <a-icon type="notification" />
            <span>sub3</span>
          </span>
          <a-menu-item key="9">option9</a-menu-item>
          <a-menu-item key="10">option10</a-menu-item>
          <a-menu-item key="11">option11</a-menu-item>
          <a-menu-item key="12">option12</a-menu-item>
        </a-sub-menu>
      </a-menu>
    </a-layout-sider>

    <a-layout style="padding: 0 24px 0 5px">
      <a-layout-content :style="{ background: '#fff', padding: '24px', margin: 0 }">
        <a-tabs defaultActiveKey="1" :style="{ height: '200px'}">
          <a-tab-pane tab="Tab 1" key="1">Content of tab 1</a-tab-pane>
          <a-tab-pane tab="Tab 2" key="2">Content of tab 2</a-tab-pane>
          <a-tab-pane tab="Tab 3" key="3">Content of tab 3</a-tab-pane>
          <a-tab-pane tab="Tab 4" key="4">Content of tab 4</a-tab-pane>
          <a-tab-pane tab="Tab 5" key="5">Content of tab 5</a-tab-pane>
          <a-tab-pane tab="Tab 6" key="6">Content of tab 6</a-tab-pane>
          <a-tab-pane tab="Tab 7" key="7">Content of tab 7</a-tab-pane>
          <a-tab-pane tab="Tab 8" key="8">Content of tab 8</a-tab-pane>
          <a-tab-pane tab="Tab 9" key="9">Content of tab 9</a-tab-pane>
          <a-tab-pane tab="Tab 10" key="10">Content of tab 10</a-tab-pane>
          <a-tab-pane tab="Tab 11" key="11">Content of tab 11</a-tab-pane>
        </a-tabs>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>
<script>
export default {
  name: "PageAnalyze",
  components: {},
  data() {
    return {
      // interface
      collapsed: false, // 侧边栏
      visSwitched: false // 点击开关时，防止双击
    };
  },
  methods: {
    test() {
      console.log("c");
    },
    test1(e) {
      console.log(e);
      console.log(e.target);
    }
  }
};
</script>
<style></style>