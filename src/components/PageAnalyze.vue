<template>
  <a-row :style="{background:backgroundColor}">
    <a-col :span="18" :style="{borderRight :`1px dashed ${contrastColor}`}">
      <DataFlow></DataFlow>
      <div :style="{width:'100%',borderTop :`1px dashed ${contrastColor}`}" />
      <TimeOrder></TimeOrder>
    </a-col>
    <a-col :span="6">
      <keep-alive>
        <!-- 可视化视图 -->
        <StaticForce :width="500" :height="500" :nodes="tooltipNodes" :links="tooltipLinks"></StaticForce>
      </keep-alive>
    </a-col>
  </a-row>
</template>

<script>
import Vue from 'vue'
import {Col,Row} from 'ant-design-vue'
Vue.use(Col);
Vue.use(Row);
import store from "@/store/";
import { mapState, mapGetters } from "vuex";
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
      contrastColor: state => state.view.contrastColor,

      operations: state => state.analyze.operations,
      currentOperations: state => state.analyze.currentOperations,
      tooltipNodes: state => state.analyze.pageAnalyzeTooltipData.nodes,
      tooltipLinks: state => state.analyze.pageAnalyzeTooltipData.links
    }),
    ...mapGetters(["nodes", "links", "nodesNumber", "generateUUID"])
  },
  mounted() {},
  activated() {},
  methods: {}
};
</script>