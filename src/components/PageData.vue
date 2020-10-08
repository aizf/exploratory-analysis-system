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
            <a-icon type="database" />
            <span>Dataset</span>
          </span>
          <!--  -->
          <a-menu-item-group v-for="type in datasetsTypes" :key="type" :title="type">
            <a-menu-item
              v-for="ds in datasetsTypeDict[type]"
              :key="ds.name"
              @click="loadData"
            >{{ds.name}}</a-menu-item>
          </a-menu-item-group>
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
import Vue from "vue";
import { Icon, Tabs } from "ant-design-vue";
Vue.use(Icon);
Vue.use(Tabs);

import store from "@/store/";
import { mapState, mapGetters } from "vuex";
import * as d3 from "d3";
import datasets from "@/config/datasets"

import { codemirror } from "vue-codemirror";

import "codemirror/mode/javascript/javascript";

export default {
  name: "PageData",
  components: { codemirror },
  data() {
    return {
      // interface
      collapsed: false, // 侧边栏
      tabs: ["SourceData", "VisualData"],
      tabContents: Array(2),
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
    ...mapState({
      selectedDataset: state => state.data.selectedDataset,
      sourceData: state => state.data.sourceData,
      visualData: state => state.data.visualData,
      datasetsTypes: state => state.data.datasetsTypes,
      currentUUID: state => state.view.currentUUID
    }),
    ...mapGetters(["nodes", "generateUUID", "dataDeepClone"]),

    datasetsNames() {
      return Object.keys(datasets);
    },
    datasetsTypeDict() {
      const res = {};
      this.datasetsTypes.forEach(d => {
        res[d] = [];
      });
      this.datasetsNames.forEach(d => {
        const data = datasets[d];
        const dataType = data.dataType;
        if (!res[dataType]) return;
        res[dataType].push(data);
      });
      return res;
    }
  },
  methods: {
    loadData(event) {
      const that = this;
      const dataset = datasets[event.key];
      const datasetPath = "./static/" + dataset.fileName;
      if (event.key === this.selectedDataset) return;
      store.commit("changeSelectedDataset", event.key);
      let visualData;
      this.tabContents = []; // 清空数据
      this.$message.loading("Action in progress..", 0.3).then(() => {
        __loadData(dataset.dataType)(datasetPath);
      });

      function __loadData(dataType) {
        // 先传入类型，再传入路径
        switch (dataType) {
          case "node-link":
            return __loadNodeLinkData;
          case "hierarchical":
            return __loadHierarchicalData;
          case "node":
            return __loadNodeData;
          default:
            break;
        }
      }

      function __loadHierarchicalData(datasetPath) {
        d3.json(datasetPath)
          .then(res => {
            store.commit("updateSourceData", res);
            visualData = store.getters.hierarchical2nodeLink;
            that.tabContents.push(JSON.stringify(res, null, "\t"));
            that.tabContents.push(JSON.stringify(visualData, null, "\t"));
            changeState();
          })
          .catch(err => {
            console.log(err);
          });
      }
      function __loadNodeLinkData(datasetPath) {
        d3.json(datasetPath)
          .then(res => {
            // debugger
            visualData = { nodes: res.nodes, links: [] };
            store.commit("updateSourceData", res);
            visualData = res;
            that.tabContents.push(JSON.stringify(res, null, "\t"));
            that.tabContents.push(JSON.stringify(visualData, null, "\t"));
            changeState();
          })
          .catch(err => {
            console.log(err);
          });
      }
      function __loadNodeData(datasetPath) {
        d3.json(datasetPath)
          .then(res => {
            store.commit("updateSourceData", res);
            visualData = { nodes: res, links: [] };
            that.tabContents.push(JSON.stringify(res, null, "\t"));
            that.tabContents.push(JSON.stringify(visualData, null, "\t"));
            changeState();
          })
          .catch(err => {
            console.log(err);
          });
      }

      // the last step
      function changeState() {
        that.$set(visualData, "marked", false);
        const tmpDict = {};
        visualData.nodes.forEach((d, i) => {
          that.$set(d, "uid", i);
          that.$set(d, "x", 0);
          that.$set(d, "y", 0);
          that.$set(d, "selected", false);
          that.$set(d, "mouseover_show", true);
          that.$set(d, "brushing", false);
          that.$set(d, "invertBrushing", false);
          tmpDict[d.id] = d;
        });
        visualData.links.forEach(d => {
          that.$set(d, "mouseover_show", true);
          if (typeof d.source !== "object") {
            d.source = tmpDict[d.source];
            d.target = tmpDict[d.target];
          }
        });

        // 源数据改变后更新store状态
        store.commit("ChartsNeedUpdate", {
          force: true,
          scatter: true,
          table: true
        });
        store.commit("updateVisualData", visualData);
        store.dispatch("resetAll");

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