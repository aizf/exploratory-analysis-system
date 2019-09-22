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
            <span>Dataset</span>
          </span>
          <!--  -->
          <a-menu-item-group key="node-link" title="node-link">
            <a-menu-item key="miserables" @click="loadData">miserables</a-menu-item>
            <a-menu-item key="energy" @click="loadData">energy</a-menu-item>
          </a-menu-item-group>
          <a-menu-item-group key="hierarchical" title="hierarchical">
            <a-menu-item key="readme" @click="loadData">readme</a-menu-item>
            <a-menu-item key="test" @click="loadData">test(2196N,2195L)</a-menu-item>
          </a-menu-item-group>
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
      tabs: ["SourceData", "Node-Link", "Hierarchical"],
      tabContents: Array(3),
      lastSelect: undefined,
      // codemirror
      cmOptions: {
        // codemirror options
        tabSize: 2,
        mode: { name: "javascript", json: true },
        theme: "lucario",
        lineNumbers: true,
        line: true,
        readOnly: "nocursor"
        // more codemirror options, 更多 codemirror 的高级配置...
      }
    };
  },
  computed: {
    sourceData() {
      return this.$store.state.sourceData;
    },
    visualData() {
      return this.$store.state.visualData;
    },
    nodes() {
      return this.$store.getters.nodes;
    },
    datasets() {
      return this.$store.state.datasets;
    }
  },
  methods: {
    loadData(event) {
      let that = this;
      let dataset = this.datasets[event.key];
      let setPath = "./static/" + dataset.fileName;
      if (event.key === this.lastSelect) return;
      let visualData;
      this.tabContents = []; // 清空数据
      this.$message.loading("Action in progress..", 0.3).then(() => {
        __loadData(dataset.dataType)(setPath);
      });

      function __loadData(dataType) {
        // 先传入类型，再传入路径
        switch (dataType) {
          case "node-link":
            return __loadNodeLinkData;
            break;
          case "hierarchical":
            return __loadHierarchicalData;
            break;
          default:
            break;
        }
      }

      function __loadHierarchicalData(setPath) {
        d3.json(setPath)
          .then(res => {
            that.$store.commit("updateSourceData", res);
            visualData = that.$store.getters.hierarchical2nodeLink;
            // todo !!!!!!!!!!!!!
            that.tabContents.push(JSON.stringify(res, null, "\t"));
            that.tabContents.push(JSON.stringify(visualData, null, "\t"));
            that.tabContents.push("asdsafdhfghdfghsdf");
            changeState();
          })
          .catch(err => {
            console.log(err);
          });
      }
      function __loadNodeLinkData() {
        d3.json(setPath)
          .then(res => {
            that.$store.commit("updateSourceData", res);
            visualData = res;
            that.tabContents.push(JSON.stringify(res, null, "\t"));
            that.tabContents.push(JSON.stringify(visualData, null, "\t"));
            that.tabContents.push("asdsafdhfghdfghsdf");
            changeState();
          })
          .catch(err => {
            console.log(err);
          });
      }
      // the last step
      function changeState() {
        visualData.nodes.forEach(d => {
          d.attentionTimes = 0;
          d.selected = false;
        });
        // console.log(visualData);
        // debugger;
        console.log("change!");
        that.lastSelect = event.key;
        // 源数据改变后更新store状态
        that.$store.commit("updateIsNewData", true);
        that.$store.commit("updateVisualData", visualData);
        that.$store.commit("resetOperations");
        that.$store.commit("updateViewUpdate", "all");

        that.$message.success("Data loaded.");
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
  height: 80vh;
  width: 45%;
}
.CodeMirror-scroll {
  overflow-y: hidden;
  overflow-x: auto;
}
</style>