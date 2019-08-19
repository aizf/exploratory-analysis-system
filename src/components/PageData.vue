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
            <span>DataSet</span>
          </span>
          <!--  -->
          <a-menu-item key="1" @click="loadData">miserables.json</a-menu-item>
          <a-menu-item key="2" @click="loadData">readme.json</a-menu-item>
        </a-sub-menu>

        <a-sub-menu key="sub2">
          <span slot="title">
            <a-icon type="laptop" />
            <span>hierarchical</span>
          </span>

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

    <a-layout style="padding: 0 0px 0 5px">
      <a-layout-content :style="{ background: '#fff', padding: '24px', margin: 0 }">
        <a-tabs defaultActiveKey="0" :style="{ height: '100%'}">
          <a-tab-pane v-for="(content, index) in tabContents" :tab="tabs[index]" :key="index+1">
            <codemirror ref="myCm" :value="content" :options="cmOptions"></codemirror>
          </a-tab-pane>
        </a-tabs>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>
<script>
import * as d3 from "d3";

import { codemirror } from "vue-codemirror";
import "codemirror/lib/codemirror.css";
// 主题
import "codemirror/theme/lucario.css";
// js高亮
import "codemirror/mode/javascript/javascript";
// 导入自动提示核心文件及样式
import "codemirror/addon/hint/show-hint.css";
import "codemirror/addon/hint/show-hint.js";
// 导入指定语言的提示文件
import "codemirror/addon/hint/javascript-hint.js";

export default {
  name: "PageData",
  components: { codemirror },
  data() {
    return {
      // interface
      collapsed: false, // 侧边栏
      visSwitched: false, // 点击开关时，防止双击
      tabs: ["SourceData", "Node-Link", "Hierarchical"],
      tabContents: [],
      // codemirror
      cmOptions: {
        // codemirror options
        tabSize: 2,
        mode: { name: "javascript", json: true },
        theme: "lucario",
        lineNumbers: true,
        line: true
        // more codemirror options, 更多 codemirror 的高级配置...
      }
    };
  },
  methods: {
    loadData(event) {
      let that = this;
      let setPath = "./static/";
      let setName = "";
      this.tabContents = []; // 清空数据
      switch (event.key) {
        case "1":
          setName = "miserables.json";
          break;
        case "2":
          setName = "readme.json";
          break;
        default:
          break;
      }
      __loadData(); // 异步加载数据

      function __loadData() {
        d3.json(setPath + setName)
          .then(res => {
            console.log(JSON.stringify(res, null, "\t"));
            console.log(res);
            that.$store.commit("updateSourceData", res);
            // todo !!!!!!!!!!!!!
            that.tabContents.push(JSON.stringify(res, null, "\t"));
            that.tabContents.push("123123123123123");
            that.tabContents.push("asdsafdhfghdfghsdf");
          })
          .catch(err => {
            console.log(err);
          });
      }
    },
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
<style>
.CodeMirror {
  border: 1px solid #eee;
  height: 100vh;
  width: 35%;
}
</style>