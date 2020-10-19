<template>
  <div class="pageAnalyze" :style="{ background: backgroundColor }">
    <FlowController :option.sync="option"></FlowController>
    <DataFlow
      :option="option"
      @staticForceShowChanged="changeStaticForceShow"
    ></DataFlow>
    <div :style="{ width: '100%', borderTop: `1px dashed ${contrastColor}` }" />
    <TimeOrder></TimeOrder>
    <keep-alive>
      <!-- 可视化视图 -->
      <StaticForce
        v-show="isStaticForceShow"
        :width="450"
        :height="450"
        :nodes="tooltipNodes"
        :links="tooltipLinks"
        class="staticForce"
      ></StaticForce>
    </keep-alive>
  </div>
</template>

<script>
import Vue from "vue";
import { Col, Row } from "ant-design-vue";
import axios from "axios";
Vue.use(Col);
Vue.use(Row);
// import store from "@/store/";
import { mapState, mapGetters } from "vuex";
import FlowController from "./pageAnalyze/FlowController.vue";
import StaticForce from "./commonUse/StaticForce.vue";
import TimeOrder from "./pageAnalyze/TimeOrder.vue";
import DataFlow from "./pageAnalyze/DataFlow";

import { backgroundColor, contrastColor } from "@/config/color";

export default {
  name: "PageAnalyze",
  components: {
    FlowController,
    TimeOrder,
    DataFlow,
    StaticForce,
  },
  data() {
    return {
      chart: {},
      isStaticForceShow: false,
      option: {
        isCompressRecord: false,
        isFrequentItem: false,
      },
      compressThreshold: 5 * 1000,
    };
  },
  computed: {
    ...mapState({
      visualData: (state) => state.data.visualData,

      width: (state) => state.view.dpiX * 0.7,
      height: (state) => state.view.dpiY - 64,

      tooltipNodes: (state) => state.analyze.pageAnalyzeTooltipData.nodes,
      tooltipLinks: (state) => state.analyze.pageAnalyzeTooltipData.links,
      recordset: (state) => state.analyze.recordset,
    }),
    ...mapGetters(["nodes", "links", "nodesNumber"]),
  },
  created() {
    this.contrastColor = contrastColor;
    this.backgroundColor = backgroundColor;
  },
  mounted() {},
  activated() {},
  methods: {
    changeStaticForceShow(val) {
      this.isStaticForceShow = val;
    },
  },
  watch: {
    "option.isFrequentItem": function (newVal) {
      if (!newVal) return;
      axios({
        method: "post",
        url: "//127.0.0.1:3000/p/",
        data: this.recordset.links,
      }).then((res) => {
        const data = res.data;
        console.log("isFrequentItem", data);
      });
    },
  },
};
</script>
<style scoped>
.pageAnalyze {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  min-height: 100vh;
}

.staticForce {
  position: absolute;
  top: 0;
  right: 0;
  /* border: 1px solid #305dff; */
}

.FlowController {
  position: absolute;
  top: 0;
  left: 0;
}
</style>