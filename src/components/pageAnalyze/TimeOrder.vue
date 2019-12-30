<template>
  <div class="TimeOrder" :style="{width:width+'px',height:height+'px'}">
    <a-select :defaultValue="xDimension" size="small" style="width: 180px" @change="handleXChange">
      <a-select-option
        v-for="dimension in dimensions"
        :value="dimension.name"
        :key="dimension.name"
      >
        {{dimension.name}}
        <span :style="{color:'rgba(0, 0, 0, 0.45)'}">type: {{dimension.type}}</span>
      </a-select-option>
    </a-select>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import echarts from "echarts";

export default {
  name: "TimeOrder",
  data() {
    return {
      chart: {},
      option: {},
      dimensions: [
        { name: "time", type: "time" },
        { name: "operation", type: "ordinal" }
      ],
      xDimension: "time",
      yDimension: "operation"
    };
  },
  computed: {
    ...mapState({
      visualData: state => state.data.visualData,

      width: state => state.view.dpiX * 0.7,
      height: state => (state.view.dpiY - 64) * 0.35,
      colorPalette: state => state.view.colorPalette,
      colorPalette2: state => state.view.colorPalette2,
      backgroundColor: state => state.view.backgroundColor,
      contrastColor: state => state.view.contrastColor,
      operationTypes: state => state.view.operationTypes,

      recordset: state => state.analyze.recordset
    }),
    ...mapGetters(["operations"]),

    chartData() {
      return this.recordset.map(d => ({
        value: [d.time, d.operation],
        itemStyle: {
          color: this.colorPalette2[this.operationTypes.indexOf(d.operation)]
        }
      }));
    }
  },

  mounted() {
    this.chart = echarts.init(document.querySelector(".TimeOrder"), null, {
      renderer: "svg"
    });
    this.option = {
      color: [
        "#c23531",
        "#2f4554",
        "#61a0a8",
        "#d48265",
        "#91c7ae",
        "#749f83",
        "#ca8622",
        "#bda29a",
        "#6e7074",
        "#546570",
        "#c4ccd3"
      ],
      backgroundColor: this.backgroundColor,
      textStyle: {
        color: this.contrastColor
      },
      xAxis: {
        type: "time",
        axisLine: {
          lineStyle: {
            color: this.contrastColor
          }
        },
        axisTick: {
          lineStyle: {
            color: this.contrastColor
          }
        },
        axisLabel: {
          textStyle: {
            color: this.contrastColor
          }
        }
      },
      yAxis: {
        data: this.operationTypes,
        axisLine: {
          lineStyle: {
            color: this.contrastColor
          }
        },
        axisTick: {
          alignWithLabel: true,
          lineStyle: {
            color: this.contrastColor
          }
        },
        axisLabel: {
          align: "right",
          textStyle: {
            color: this.contrastColor
          }
        }
      },
      tooltip: {
        formatter: function(params) {
          console.log(params);
          const dimensionNames = params.dimensionNames;
          const value = params.value;
          const n = dimensionNames.length;
          let string = `<div style="border-bottom: 1px solid rgba(255,255,255,.3); font-size: 12px;padding-bottom: 7px;margin-bottom: 7px">`;
          for (let i = 0; i < n; i++) {
            if (i) string += "<br/>";
            string += dimensionNames[i] + ": " + value[i];
          }
          string += "</div>";
          return string;
        }
      },
      series: [
        {
          type: "scatter",
          dimensions: this.dimensions,
          data: this.chartData,
          encode: {
            x: this.xDimension,
            y: this.yDimension
          }
        }
      ]
    };
    this.chart.setOption(this.option, true);
  },
  activated() {
    this.chart.setOption({
      series: [
        {
          data: this.chartData,
          encode: {
            x: this.xDimension,
            y: this.yDimension
          }
        }
      ]
    });
  },
  methods: {},
  watch: {
    xDimension: function(newV) {
      this.chart.setOption({
        series: [
          {
            encode: {
              x: newV
            }
          }
        ]
      });
    },
    yDimension: function(newV) {
      this.chart.setOption({
        series: [
          {
            encode: {
              y: newV
            }
          }
        ]
      });
    }
  }
};
</script>