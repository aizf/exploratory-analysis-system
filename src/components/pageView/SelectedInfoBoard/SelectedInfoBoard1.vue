<template>
  <div class="SelectedInfoBoard1 test-border"></div>
</template>
<script>
// import Vue from "vue";
import { mapState, mapGetters } from "vuex";
import echarts from "echarts";
import eventBus from "../ForceChart/eventBus.js";
// import * as _ from "lodash";
export default {
  name: "SelectedInfoBoard1",
  inject: ["backgroundColor", "contrastColor", "classificationPalette"],
  props: {
    items: Array,
  },
  data() {
    return {
      // option: {},
    };
  },
  computed: {
    ...mapState({
      nodeFields: (state) => state.data.nodeFields,
      uidLinksMap: (state) => state.data.uidMaps.uidLinksMap,
      idNodeMap: (state) => state.data.uidMaps.idNodeMap,
    }),
    ...mapGetters(["nodes", "links", "nodesNumber"]),
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
        data: this.items.map((d) => ({
          value: this.uidLinksMap[d.uid].length,
          itemStyle: {
            color: this.classificationPalette[d.group || 0],
          },
        })),
      };
    },
    option() {
      return {
        grid: {
          top: 20,
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
    this.chart.on("click", (params) => {
      const node = this.idNodeMap[params.name];
      node.selected = !node.selected;
    });
    this.chart.on("mouseover", (params) => {
      const node = this.idNodeMap[params.name];
      node.current = true;
      eventBus.$emit("board1-mouseover", node);
    });
    this.chart.on("mouseout", (params) => {
      const node = this.idNodeMap[params.name];
      node.current = false;
      eventBus.$emit("board1-mouseout", node);
    });
  },
  methods: {},
  watch: {},
};
</script>
<style lang="scss" scoped>
.SelectedInfoBoard1 {
  width: 600px;
  height: 380px;
}
</style>