<template>
  <a-layout id="pageView">
    <a-layout-sider width="250" theme="light" style="background: #fff">
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

    <a-layout style="padding: 0 0 0 5px">
      <a-layout-content
        :style="{ background: '#fff', padding: '24px', margin: 0 }"
      >
        <div class="view-tools-board">
          <MarkedViews class="view-tools-item" />
          <div class="view-tools-item">
            <a-button @click="viewUndo" shape="circle" :disabled="undoDisabled">
              <a-icon type="undo" />
            </a-button>
            <a-button
              @click="viewRedo"
              shape="circle"
              :disabled="redoDisabled"
              style="margin: 0 0 0 5px"
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
            <a-button
              type="primary"
              size="small"
              @click="viewFilter"
              :style="{ marginLeft: '0', width: '70px' }"
              >filter</a-button
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
              :is="currentChart"
              :eventOption="eventOption"
              :chartOption="chartOption"
              @changeChartOption="handleChartOption"
            ></component>
          </keep-alive>
          <SelectedInfoBoard />
          <NodesList />
          <!-- <WebGLChart :eventOption="eventOption" :chartOption="chartOption" /> -->
        </div>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>
<script>
import Vue from "vue";
import {
  Badge,
  Button,
  Checkbox,
  Col,
  Drawer,
  Icon,
  Input,
  InputNumber,
  Popover,
  Row,
  Slider,
  Switch,
  Tabs,
  Tag,
} from "ant-design-vue";
Vue.use(Badge);
Vue.use(Button);
Vue.use(Checkbox);
Vue.use(Col);
Vue.use(Drawer);
Vue.use(Icon);
Vue.use(Input);
Vue.use(InputNumber);
Vue.use(Popover);
Vue.use(Row);
Vue.use(Slider);
Vue.use(Switch);
Vue.use(Tabs);
Vue.use(Tag);
import store from "@/store/";
import { mapState, mapGetters } from "vuex";
// import * as d3 from "d3";
import ForceChart from "./pageView/ForceChart";
import WebGLChart from "./pageView/ForceChart/WebGLChart";
import ScatterChart from "./pageView/ScatterChart.vue";
import NodesList from "./pageView/NodesList.vue";
import SelectedInfoBoard from "./pageView/SelectedInfoBoard.vue";
import EventOption from "./pageView/EventOption.vue";
import ChartOption from "./pageView/ChartOption.vue";
import MarkedViews from "./pageView/MarkedViews";
import { classificationPalette } from "@/config/color";
export default {
  name: "PageView",
  components: {
    ForceChart,
    // WebGLChart,
    ScatterChart,
    NodesList,
    SelectedInfoBoard,
    EventOption,
    ChartOption,
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
        visClick: false,
        visDrag: true,
        visMouseover: true,
        visBrush: false,
        brushKeep: false,
        visInvertBrush: false,
        visZoom: true,
        visShowIds: false,
      },
      // option
      chartOption: {
        simulation: { run: true, alphaTarget: 0.3 },
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
  },
  watch: {},
};
</script>
<style scoped>
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
}
.main-view {
  padding: 10px 0 0 0;
  display: flex;
  background: var(--backgroundColor);
}
.main-view > * {
  flex: 0 0 auto;
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
</style>>
