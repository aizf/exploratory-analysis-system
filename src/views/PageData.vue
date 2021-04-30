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
          <a-menu-item-group
            v-for="type in datasetsTypes"
            :key="type"
            :title="type"
          >
            <a-menu-item
              v-for="ds in datasetsTypeDict[type]"
              :key="ds.name"
              @click="loadData"
              >{{ ds.name }}</a-menu-item
            >
          </a-menu-item-group>
        </a-sub-menu>
      </a-menu>
    </a-layout-sider>

    <a-layout style="padding: 0 0px 0 5px">
      <a-layout-content
        :style="{ background: '#fff', padding: '24px', margin: 0 }"
      >
        <a-tabs defaultActiveKey="0" :style="{ height: '100%' }">
          <a-tab-pane
            v-for="(content, key) in codeContent"
            :tab="key"
            :key="key"
          >
            <codemirror :value="content" :options="cmOptions"></codemirror>
          </a-tab-pane>
        </a-tabs>
        <a-checkbox @change="isDirectedChange($event.target.checked)">
          isDirected
        </a-checkbox>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>
<script>
import Vue from "vue";
import { mapState, mapGetters } from "vuex";
import * as d3 from "d3";
import { codemirror } from "vue-codemirror";
import "codemirror/mode/javascript/javascript";
import { Icon, Tabs } from "ant-design-vue";
Vue.use(Icon);
Vue.use(Tabs);

import store from "@/store/";
import datasets from "@/config/datasets";
import { hierarchical2nodeLink } from "@/utils/methods";

export default {
  name: "PageData",
  components: { codemirror },
  data() {
    return {
      datasetsTypes: [
        "node-link",
        "hierarchical",
        // "node"
      ],
      collapsed: false, // 侧边栏
      codeContent: {
        SourceData: "",
        VisualData: "",
      },
      selectedDataset: "",
      // codemirror
      cmOptions: {
        // codemirror options
        tabSize: 2,
        mode: { name: "javascript", json: true },
        theme: "lucario",
        lineNumbers: true,
        line: true,
        readOnly: "nocursor",
      },
    };
  },
  computed: {
    ...mapState({
      sourceData: (state) => state.data.sourceData,
      visualData: (state) => state.data.visualData,
      currentUUID: (state) => state.view.currentUUID,
    }),
    ...mapGetters(["nodes"]),

    datasetsNames() {
      return Object.keys(datasets);
    },
    datasetsTypeDict() {
      const res = {};
      this.datasetsTypes.forEach((d) => {
        res[d] = [];
      });
      this.datasetsNames.forEach((d) => {
        const data = datasets[d];
        const dataType = data.dataType;
        if (!res[dataType]) return;
        res[dataType].push(data);
      });
      return res;
    },
    cmSourceData() {
      return JSON.stringify(JSON.parse(this.sourceData), null, "\t");
    },
  },
  methods: {
    loadData(event) {
      const that = this;
      const dataset = datasets[event.key];

      const datasetPath = "./static/" + dataset.fileName;
      if (event.key === this.selectedDataset) return;
      this.selectedDataset = event.key;
      // TODO
      store.commit("updateDatasetName", "facebook");
      const nodeFields = dataset.nodeFields;
      store.commit("updateNodeFields", nodeFields);
      if (dataset.static) store.commit("updateStatic");

      let visualData;
      this.tabContents = []; // 清空数据
      this.$message.loading("Action in progress..", 0.3).then(() => {
        const loadFun = loadFuns[dataset.dataType];
        loadFun(datasetPath);
      });

      // 三种数据加载函数
      const loadFuns = {
        "node-link": (datasetPath) => {
          d3.json(datasetPath)
            .then((res) => {
              // store.commit("updateSourceData", JSON.stringify(res));
              visualData = res;
              // this.codeContent["SourceData"] = this.cmSourceData;
              // this.codeContent["VisualData"] = JSON.stringify(
              //   visualData,
              //   null,
              //   "\t"
              // );
              this.changeState(visualData);
            })
            .catch((err) => {
              console.log(err);
            });
        },
        hierarchical: (datasetPath) => {
          d3.json(datasetPath)
            .then((res) => {
              // store.commit("updateSourceData", JSON.stringify(res));
              visualData = hierarchical2nodeLink(res);
              // this.codeContent["SourceData"] = this.cmSourceData;
              // this.codeContent["VisualData"] = JSON.stringify(
              //   visualData,
              //   null,
              //   "\t"
              // );
              this.changeState(visualData);
            })
            .catch((err) => {
              console.log(err);
            });
        },
        node: (datasetPath) => {
          d3.json(datasetPath)
            .then((res) => {
              // store.commit("updateSourceData", JSON.stringify(res));
              visualData = { nodes: res, links: [] };
              // this.codeContent["SourceData"] = this.cmSourceData;
              // this.codeContent["VisualData"] = JSON.stringify(
              //   visualData,
              //   null,
              //   "\t"
              // );
              this.changeState(visualData);
            })
            .catch((err) => {
              console.log(err);
            });
        },
      };
    },
    changeState(visualData) {
      this.$set(visualData, "marked", false);
      const uidNodeMap = new Array(visualData.nodes.length);
      const idNodeMap = {};
      // let maxSize = -Infinity;
      visualData.nodes.forEach((d, i) => {
        "group" in d || this.$set(d, "group", 0);
        this.$set(d, "current", false);
        this.$set(d, "selected", false);
        this.$set(d, "mouseover_show", true);
        d["brushing"] = false;
        d["invertBrushing"] = false;
        d["uid"] = i + "";
        // d["attentionTimes"] = 0;
        uidNodeMap[d.uid] = d;
        idNodeMap[d.id] = d;
        // if ("size" in d) maxSize = Math.max(maxSize, +d.size);
      });
      // if (maxSize > -Infinity) {
      //   visualData.nodes.forEach((d) => (d.size /= maxSize));
      // } else {
      //   visualData.nodes.forEach((d) => (d.size = 1));
      // }
      // visualData.nodes.sort(() => {
      //   return 0.5 - Math.random();
      // });
      // console.log(arr);

      // let maxWeight = -Infinity;
      visualData.links.forEach((d, i) => {
        this.$set(d, "uid", i);
        this.$set(d, "mouseover_show", true);
        if (typeof d.source !== "object") {
          d.source = idNodeMap[d.source];
          d.target = idNodeMap[d.target];
        }
        // if ("value" in d) maxWeight = Math.max(maxWeight, +d.value);
        // if ("weight" in d) maxWeight = Math.max(maxWeight, +d.weight);
      });
      // if (maxWeight > -Infinity) {
      //   visualData.links.forEach((d) => {
      //     if ("value" in d) d.weight = d.value / maxWeight;
      //     else if ("weight" in d) d.weight /= maxWeight;
      //   });
      // } else {
      //   visualData.links.forEach((d) => (d.weight = 1));
      // }

      const uidLinksMap = this.genUidLinksMap(visualData);
      const uidLinkedNodesMap = this.genUidLinkedNodesMap(visualData);

      // 源数据改变后更新store状态
      this.isDirectedChange(!!visualData.isDirected);
      store.commit("updateUidMaps", {
        idNodeMap,
        uidNodeMap,
        uidLinksMap,
        uidLinkedNodesMap,
      });
      // store.commit("ChartsNeedUpdate", {
      //   force: true,
      //   scatter: true,
      // });
      // console.log("visualData", visualData);
      store.commit("updateVisualData", visualData);
      store.commit("updateSourceNum", visualData.nodes.length);
      store.dispatch("resetAll");

      this.$message.success("Data loaded.");
    },
    genUidLinksMap({ nodes, links }) {
      const dict = Array.from(Array(nodes.length), () => []);
      links.forEach((d) => {
        const { source, target } = d;
        dict[source.uid].push(d);
        dict[target.uid].push(d);
      });
      return dict;
    },
    genUidLinkedNodesMap({ nodes, links }) {
      const dict = Array.from(Array(nodes.length), () => []);
      links.forEach((d) => {
        const { source, target } = d;
        dict[source.uid].push(target);
        dict[target.uid].push(source);
      });
      nodes.forEach((d) => {
        dict[d.uid] = [...new Set(dict[d.uid])];
      });
      return dict;
    },
    genMatrix({ nodes, links }) {
      // 生成link关系矩阵
      const nodesNum = nodes.length;
      const matrix = Array.from(Array(nodesNum), () =>
        Array(nodesNum).fill(null)
      );
      links.forEach((d) => {
        const { source, target } = d;
        matrix[source.uid][target.uid] = d;
        matrix[target.uid][source.uid] = d;
      });
      return matrix;
    },
    isDirectedChange(value) {
      store.commit("updateIsDirected", value);
    },
    test() {
      console.log("c");
    },
  },
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