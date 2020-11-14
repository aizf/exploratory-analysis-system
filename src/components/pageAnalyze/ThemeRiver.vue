<template>
  <div
    class="ThemeRiver"
    :style="{ width: width + 'px', height: height + 'px' }"
    ref="view"
  ></div>
</template>

<script>
import Vue from "vue";
// import store from "@/store/";
import { mapState } from "vuex";
import echarts from "echarts";
export default {
  name: "ThemeRiver",
  inject: [
    "backgroundColor",
    "contrastColor",
    "classificationPalette",
    "classificationPalette2",
  ],
  data() {
    return {};
  },
  computed: {
    ...mapState({
      width: (state) => state.view.dpiX * 0.7,
      height: (state) => (state.view.dpiY - 64) * 0.35,
      operationTypes: (state) => state.view.operationTypes,

      recordset: (state) => state.analyze.recordset,
    }),
    chartData() {
      // const arr=["click", "drag", "mouseover",
      //    "brush", "classification", "invertBrush",
      //     "zoom", "filter", "undo", "redo", "rollback"];
      // 数据
      const data = [];
      const dict = new Map();
      this.recordset.links.forEach(({ operation, time }) => {
        const t = +time;
        if (dict.has(t)) {
          const obj = dict.get(t);
          if (operation in obj) obj[operation]++;
          else obj[operation] = 1;
        } else {
          dict.set(t, { [operation]: 1 });
        }
      });
      console.log(dict);
      for (let [t, obj] of dict) {
        for (let [op, n] of Object.entries(obj)) {
          data.push([t, n, op]);
        }
        data.push([t, 0, "base"]);
      }
      console.log(data);
      return data;
    },
  },
  mounted() {
    console.log("ThemeRiver", this);
    this.chart = echarts.init(this.$refs.view, null);
    this.option = {
      animation: false,
      color: this.classificationPalette2,
      backgroundColor: this.backgroundColor,
      textStyle: {
        color: this.contrastColor,
      },
      singleAxis: {
        axisTick: {},
        axisLabel: {},
        type: "time",
        axisPointer: {
          animation: true,
          label: {
            show: true,
          },
        },
        splitLine: {
          show: true,
          lineStyle: {
            type: "dashed",
            opacity: 0.2,
          },
        },
      },
      legend: {
        orient: "vertical",
        right: "right",
        textStyle: {
          color: this.contrastColor,
        },
      },
      tooltip: {},
      // dataZoom: [{ type: "inside" }, { type: "slider" }],
      // tooltip: {
      //   formatter: function(params) {
      //     // console.log(params);
      //     const dimensionNames = params.dimensionNames;
      //     const value = params.value;
      //     const n = dimensionNames.length;
      //     let string = `<div style="border-bottom: 1px solid rgba(255,255,255,.3); font-size: 12px;padding-bottom: 7px;margin-bottom: 7px">`;
      //     for (let i = 0; i < n; i++) {
      //       if (i) string += "<br/>";
      //       string += dimensionNames[i] + ": " + value[i];
      //     }
      //     string += "</div>";
      //     return string;
      //   }
      // },
      series: [
        {
          name: 0,
          type: "themeRiver",
          data: this.chartData,
        },
      ],
    };
    // console.log(JSON.stringify(this.option));
    this.chart.setOption(this.option, true);
  },
  activated() {
    this.chart.setOption({
      series: [
        {
          name: 0,
          type: "themeRiver",
          data: this.chartData,
        },
      ],
    });
  },
  methods: {},
  watch: {},
};
</script>
<style scope>
</style>
<style>
</style>