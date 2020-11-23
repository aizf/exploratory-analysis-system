<template>
  <a-layout id="pageView">
    <a-layout-sider width="150" theme="light" style="background: #fff">
      <a-card
        title="Data Fields"
        :headStyle="{ padding: '0 24px 0 24px' }"
        :bodyStyle="{ padding: '5px 10px 5px 10px' }"
      >
        <a-row>
          <a-col :span="12" offset="4"></a-col>
          <a-col :span="4" offset="2"></a-col>
        </a-row>
      </a-card>
      <a-button
        @click="communities"
        style="margin: 0 0 0 5px"
      >
        communities
      </a-button>
      <a-button
        @click="updateWorker"
        style="margin: 0 0 0 5px"
      >
        updateWorker
      </a-button>
      <EventOption
        :eventOption="eventOption"
        @vis-brush="onVisBrush"
        @vis-invert-brush="onVisInvertBrush"
      />
      <ChartOption
        :chartOption="chartOption"
        @changeCurrentChart="changeCurrentChart"
      />
    </a-layout-sider>

    <a-layout class="view">
      <a-layout-content :style="{ padding: '5px 0 0 0', margin: 0 }">
        <div class="view-tools-board">
          <MarkedViews class="view-tools-item" />
          <div class="view-tools-item">
            <a-button
              @click="viewUndo"
              shape="circle"
              :disabled="undoDisabled"
              ghost
            >
              <a-icon type="undo" />
            </a-button>
            <a-button
              @click="viewRedo"
              shape="circle"
              :disabled="redoDisabled"
              style="margin: 0 0 0 5px"
              ghost
            >
              <a-icon type="redo" />
            </a-button>
          </div>
          <div class="view-tools-item">
            <a-tag
              v-for="(color, index) in classificationPalette"
              :color="color"
              @click="groupTheSelectedNodes(index)"
              :key="index"
              >{{ index }}</a-tag
            >
          </div>
          <div class="view-tools-item">
            <ClusterOption />
          </div>
          <div class="view-tools-item">
            <a-button
              type="primary"
              size="small"
              @click="selectInvert"
              :style="{ marginLeft: '0', width: '95px' }"
              ghost
              >Select Invert</a-button
            >
          </div>
          <div class="view-tools-item">
            <a-button
              type="primary"
              size="small"
              @click="pin"
              :style="{ marginLeft: '0', width: '40px' }"
              ghost
              >Pin</a-button
            >
            <a-button
              type="primary"
              size="small"
              @click="cancelPin"
              :style="{ marginLeft: '0', width: '95px' }"
              ghost
              >Cancel Pin</a-button
            >
          </div>
          <div class="view-tools-item">
            <a-button
              type="primary"
              size="small"
              @click="viewFilter"
              :style="{ marginLeft: '0', width: '70px' }"
              ghost
              >Filter</a-button
            >
          </div>
          <div class="view-tools-item">
            <a-button
              type="primary"
              size="small"
              @click="merge"
              :style="{ marginLeft: '0', width: '70px' }"
              ghost
              >Merge</a-button
            >
          </div>
          <div class="view-tools-item">
            <a-icon type="tags" />
            <span>showIds</span>
            <a-switch v-model="eventOption.visShowIds" />
          </div>
        </div>

        <div class="main-view">
          <keep-alive>
            <!-- 可视化视图 -->
            <component
              ref="theView"
              class="view1"
              :is="currentChart"
              :eventOption="eventOption"
              :chartOption="chartOption"
              @changeChartOption="handleChartOption"
            ></component>
          </keep-alive>
          <SelectedInfoBoard class="view2" />
          <NodesList class="view3" />
          <ParallelCoordinate class="view4" :chartOption="chartOption" />
        </div>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>
<script>
import Vue from "vue";
import store from "@/store/";
import { mapState, mapGetters } from "vuex";
import axios from "axios";
// import * as d3 from "d3";
import ForceChart from "@c/pageView/ForceChart";
import ScatterChart from "@c/pageView/ScatterChart.vue";
import NodesList from "@c/pageView/NodesList.vue";
import SelectedInfoBoard from "@c/pageView/SelectedInfoBoard";
import ParallelCoordinate from "@c/pageView/ParallelCoordinate";
import EventOption from "@c/pageView/EventOption.vue";
import ChartOption from "@c/pageView/ChartOption.vue";
import ClusterOption from "@c/pageView/ClusterOption.vue";
import MarkedViews from "@c/pageView/MarkedViews";
import { classificationPalette } from "@/config/color";
export default {
  name: "PageView",
  components: {
    ForceChart,
    ScatterChart,
    NodesList,
    SelectedInfoBoard,
    ParallelCoordinate,
    EventOption,
    ChartOption,
    ClusterOption,
    MarkedViews,
  },
  data() {
    return {
      // interface
      collapsed: false, // 侧边栏
      rootSubmenuKeys: ["sub1", "sub2", "sub3"],
      openKeys: ["sub1"],
      // view
      eventOption: {
        visClick: true,
        visDrag: true,
        visMouseover: true,
        visBrush: false,
        brushKeep: false,
        visInvertBrush: false,
        visZoom: false,
        visShowIds: false,
      },
      // option
      chartOption: {
        simulation: { run: true, alphaTarget: 0.3, centerStrength: 1 },
        node: { nodeSize: 4.5, borderColor: "red", chargeForce: -30 },
        link: { color: "#aaa", width: 0.3, distance: 30 },
      },

      currentChart: "ForceChart",
    };
  },
  provide: {},
  computed: {
    ...mapState({
      visualData: (state) => state.data.visualData,
      idNodeMap: (state) => state.data.uidMaps.idNodeMap,
      // datasets: state => state.data.datasets,

      parentUUID: (state) => state.view.parentUUID,
      currentUUID: (state) => state.view.currentUUID,

      undoList: (state) => state.analyze.undoList,
      redoList: (state) => state.analyze.redoList,
      //toolbox
    }),
    ...mapGetters([
      "nodes",
      "links",
      "viewSlice",
      "beforeEvent",
      "tmpExistingViews",
    ]),
    undoDisabled() {
      return !this.undoList.length;
    },
    redoDisabled() {
      return !this.redoList.length;
    },
  },
  created() {
    this.classificationPalette = classificationPalette;
  },
  mounted() {
    console.log("PageView", this);
  },
  methods: {
    onVisBrush(which) {
      if (which !== "switch") {
        // 判断点击的是<a-menu-item>还是<a-switch>
        this.eventOption.visBrush = !this.eventOption.visBrush;
      }

      if (this.eventOption.visBrush) {
        this.eventOption.visInvertBrush = false;
      }
    },
    onVisInvertBrush(which) {
      if (which !== "switch") {
        // 判断点击的是<a-menu-item>还是<a-switch>
        this.eventOption.visInvertBrush = !this.eventOption.visInvertBrush;
      }

      if (this.eventOption.visInvertBrush) {
        this.eventOption.visBrush = false;
      }
    },
    changeCurrentChart(chart) {
      this.currentChart = chart;
    },
    viewUndo() {
      this.$store.commit("changeUndoRedo", (undo) => {
        if (!undo.length) {
          return;
        }
        this.beforeEvent("undo", this, undo.pop());
        console.info("undo!");
      });
    },
    viewRedo() {
      this.$store.commit("changeUndoRedo", (undo, redo) => {
        if (!redo.length) {
          return;
        }
        this.beforeEvent("redo", this, redo.shift());
        console.info("redo!");
      });
    },
    // filter别名，切片和切片回退
    viewFilter() {
      const slicedData = this.viewSlice();
      if (!slicedData.nodes.length) {
        this.$message.error("No nodes are selected !");
        return;
      }
      slicedData.uuid = this.currentUUID;

      this.beforeEvent("filter", this);

      slicedData.nodes.forEach((d) => {
        this.$set(d, "selected", false);
      });

      this.$store.commit("updateVisualData", slicedData);
      this.$store.commit("addOperation", {
        action: "filter",
        nodes: slicedData,
        time: new Date(),
      });
      console.log("filter");
    },
    selectInvert() {
      this.nodes.forEach((node) => (node.selected = !node.selected));
    },
    pin() {
      const nodes = this.nodes.filter((d) => d.selected);
      nodes.forEach((node) => {
        node.fx = node.x;
        node.fy = node.y;
        node.pin = true;
      });
      this.$refs.theView.$emit("alterWorkerData", nodes);
    },
    cancelPin() {
      const nodes = this.nodes.filter((d) => d.selected);
      nodes.forEach((node) => {
        delete node.fx;
        delete node.fy;
        node.pin = false;
      });
      this.$refs.theView.$emit("alterWorkerData", nodes);
    },
    groupTheSelectedNodes(group) {
      // console.log(group);
      this.beforeEvent("classification", this);
      store.state.data.visualData.nodes.forEach((d) => {
        if (d.selected) {
          this.$set(d, "group", group);
        }
      });
    },
    handleChartOption(val) {
      // 处理ForceChart.vue更改Chart Option的callback
      Object.keys(val).forEach((d) => {
        Object.keys(val[d]).forEach((dd) => {
          this.chartOption[d][dd] = val[d][dd];
        });
      });
    },
    communities() {
      const nodes = this.nodes.map((node) => ({
          id: node.id,
        })),
        links = this.links.map((link) => ({
          source: link.source.id,
          target: link.target.id,
        }));
      axios({
        method: "post",
        // url: "//127.0.0.1:3000/p/network_centrality",
        url: "//127.0.0.1:5000/communities",
        data: { nodes, links },
      }).then((res) => {
        const {
          data: { data },
        } = res;
        console.log("communities", data);
        for (let i = 0; i < data.length; i++) {
          const g = data[i];
          for (let id of g) {
            this.idNodeMap[id].group = i;
          }
        }
      });
    },
    merge() {
      // save
      const nodes = this.nodes.map((node) => ({
          id: node.id,
          x: node.x,
          y: node.y,
          group: node.group,
          size: node.size,
        })),
        links = this.links.map((link) => ({
          source: link.source.id,
          target: link.target.id,
        }));
      axios({
        method: "post",
        // url: "//127.0.0.1:3000/p/network_centrality",
        url: "//127.0.0.1:5000/save",
        data: { nodes, links },
      }).then((res) => {});
    },
    updateWorker() {
      console.log("force change");
      this.$refs.theView.changeWorkerData();
    },
  },
  watch: {},
};
</script>
<style lang="scss" scoped>
/* .vMenu {
  display: -webkit-flex;
  display: flex;
  flex-wrap: wrap;
} */
.view-tools-board {
  height: 26px;
  width: 1152px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 1;
}
.view {
  background: var(--backgroundColor);
  margin-left: 5px;
  padding-top: 10px;
}
.main-view {
  position: relative;
  background: var(--backgroundColor);
  > .view1 {
    position: absolute;
    top: 0;
    left: 0;
  }
  > .view2 {
    position: absolute;
    top: 0;
    left: 750px;
  }
  > .view3 {
    position: absolute;
    top: 0;
    left: 1350px;
  }
  > .view4 {
    position: absolute;
    top: 595px;
    left: 0;
  }
}
</style>
<style>
#pageView .ant-tabs-tab {
  text-align: left;
  padding: 2px 5px;
  margin-bottom: 6px;
}
#pageView .ant-tabs-left-content {
  padding-left: 0px;
}
</style>
<style>
.vSubMenu {
  font-size: 14px;
  font-weight: 400;
  width: 30px;
  margin-left: 8%;
}
.vSubTitle {
  font-size: 15px;
  font-weight: 650;
  margin-left: 2%;
}
/* .vSubMenu:hover {
  color: #1890ff;
  cursor: pointer;
} */
.optionInput {
  height: 26px;
  width: 85%;
  margin: 0 8%;
}
.test-border {
  border: 1px solid skyblue;
}
</style>>
