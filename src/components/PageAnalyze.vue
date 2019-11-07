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
    width() {
      return this.$store.state.dpiX * 0.7;
    },
    height() {
      return this.$store.state.dpiY - 64;
    },
    visualData() {
      return this.$store.state.visualData;
    },
    nodes() {
      return this.$store.getters.nodes;
    },
    links() {
      return this.$store.getters.links;
    },
    backgroundColor() {
      return this.$store.state.backgroundColor;
    },
    colorPalette() {
      return this.$store.state.colorPalette;
    },
    operations() {
      return this.$store.state.operations;
    },
    tooltipUpdate() {
      return this.$store.state.pageAnalyzeTooltipUpdata;
    },
    tooltipNodes() {
      return this.$store.state.pageAnalyzeTooltipData.nodes;
    },
    tooltipLinks() {
      return this.$store.state.pageAnalyzeTooltipData.links;
    }
  },
  mounted() {},
  activated() {},
  methods: {}
};
</script>