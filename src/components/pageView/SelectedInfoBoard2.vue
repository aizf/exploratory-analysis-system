<template>
  <div class="SelectedInfoBoard2"></div>
</template>
<script>
// import Vue from "vue";
import { mapState, mapGetters } from "vuex";
import echarts from "echarts";
// import * as _ from "lodash";
export default {
  name: "SelectedInfoBoard2",
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
    seriesData() {
      const data = [];
      const dict = {};
      this.items.forEach((d) => {
        const group = d.group || 0;
        if (group in dict) {
          dict[group]++;
        } else {
          dict[group] = 1;
        }
      });
      for (let [name, value] of Object.entries(dict)) {
        data.push({
          name,
          value,
          itemStyle: { color: this.classificationPalette[name] },
        });
      }
      return data;
    },
    series() {
      return {
        type: "pie",
        radius: "55%",
        center: ["50%", "50%"],
        data: this.seriesData,
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
        series: this.series,
      };
    },
  },
  mounted() {
    console.log("SelectedInfoBoard2", this);
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
.SelectedInfoBoard2 {
  width: 600px;
  height: 400px;
}
</style>