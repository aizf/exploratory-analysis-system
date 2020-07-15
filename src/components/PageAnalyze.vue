<template>
  <div class="pageAnalyze" :style="{background:backgroundColor}">
    <DataFlow @staticForceShowChanged="changeStaticForceShow"></DataFlow>
    <div :style="{width:'100%',borderTop :`1px dashed ${contrastColor}`}" />
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
Vue.use(Col);
Vue.use(Row);
// import store from "@/store/";
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
      chart: {},
      isStaticForceShow: false
    };
  },
  computed: {
    ...mapState({
      visualData: state => state.data.visualData,

      width: state => state.view.dpiX * 0.7,
      height: state => state.view.dpiY - 64,
      classificationPalette: state => state.view.classificationPalette,
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
  methods: {
    changeStaticForceShow(val) {
      this.isStaticForceShow = val;
    }
  }
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
</style>