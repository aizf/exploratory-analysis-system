<template>
  <div :style="{float:'left'}">
    <div :style="{float:'left',width:width}">
      <TimeOrder></TimeOrder>
      <DataFlow></DataFlow>
    </div>
    <div :style="{float:'left'}">
      <a-card hoverable style="width: 240px">
        <keep-alive>
          <!-- 可视化视图 -->
          <StaticForce
            :viewUpdate="tooltipUpdate"
            :width="500"
            :height="500"
            :nodes="tooltipNodes"
            :links="tooltipLinks"
          ></StaticForce>
        </keep-alive>
        <a-card-meta title="Europe Street beat">
          <template slot="description">www.instagram.com</template>
        </a-card-meta>
      </a-card>
    </div>
  </div>
</template>

<script>
import store from "@/store/";
import { mapState, mapGetters } from "vuex";
import * as d3 from "d3";
import StaticForce from "./commonUse/StaticForce.vue";
import TimeOrder from "./pageAnalyze/TimeOrder.vue";
import DataFlow from "./pageAnalyze/DataFlow.vue";

export default {
  name: "PageAnalyze",
  components: {
    TimeOrder,
    DataFlow,
    StaticForce
  },
  data() {
    return {
      chart: {}
    };
  },
  computed: {
    ...mapState({
      visualData: state => state.data.visualData,

      width: state => state.view.dpiX * 0.7,
      height: state => state.view.dpiY - 64,
      colorPalette: state => state.view.colorPalette,
      backgroundColor: state => state.view.backgroundColor,

      operations: state => state.analyze.operations,
      currentOperations: state => state.analyze.currentOperations,
      undoStack: state => state.analyze.undoStack,
      redoStack: state => state.analyze.redoStack,
      rollbacked: state => state.analyze.rollbacked,
      tooltipUpdate: state => state.analyze.pageAnalyzeTooltipUpdata,
      tooltipNodes: state => state.analyze.pageAnalyzeTooltipData.nodes,
      tooltipLinks: state => state.analyze.pageAnalyzeTooltipData.links,
    }),
    ...mapGetters(["nodes", "links", "nodesNumber","generateUUID"])
  },
  mounted() {},
  activated() {},
  methods: {}
};
</script>