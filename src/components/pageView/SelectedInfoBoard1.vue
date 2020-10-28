<template>
  <div class="SelectedInfoBoard1"></div>
</template>
<script>
// import Vue from "vue";
import { mapState, mapGetters } from "vuex";
import echarts from "echarts";
// import * as _ from "lodash";
export default {
  name: "SelectedInfoBoard1",
  inject: ["backgroundColor", "contrastColor", "classificationPalette"],
  props: {},
  data() {
    return {
      // option: {},
    };
  },
  computed: {
    ...mapState({
      nodeFields: (state) => state.data.nodeFields,
      uidLinksMap: (state) => state.data.uidMaps.uidLinksMap,
    }),
    ...mapGetters(["nodes", "links", "nodesNumber"]),
    items() {
      const mouseoverNodes = this.nodes.filter((d) => d.mouseover_show);
      return mouseoverNodes;
    },
    xAxis() {
      return {
        type: "category",
        data: this.items.map((d) => d.id),
        axisTick: { alignWithLabel: true },
        axisLabel: {
          interval: 0,
          rotate: 90,
        },
      };
    },
    series() {
      return {
        type: "bar",
        label: {
          show: true,
          position: "top",
        },
        backgroundStyle: {
          color: "rgba(220, 220, 220, 0.8)",
        },
        data: this.items.map((d) => this.uidLinksMap[d.uid].length),
      };
    },
    option() {
      return {
        grid:{
          top:20
        },
        backgroundColor: this.backgroundColor,
        textStyle: {
          color: this.contrastColor,
        },
        xAxis: this.xAxis,
        yAxis: {
          type: "value",
        },
        series: this.series,
      };
    },
  },
  mounted() {
    console.log("SelectedInfoBoard1", this);
    this.chart = echarts.init(this.$el, null);
    // this.option = this.initOption();
    this.$watch(
      "nodes",
      function () {
        this.chart.setOption(this.option, true);
      },
      {
        immediate: true,
        deep: true,
      }
    );
  },
  methods: {},
  watch: {},
};
</script>
<style lang="scss" scoped>
.SelectedInfoBoard1 {
  width: 600px;
  height: 400px;
}
</style>