<template>
  <div class="TimeOrder" :style="{width:width+'px',height:height+'px'}"></div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import echarts from "echarts";

export default {
  name: "TimeOrder",
  data() {
    return {
      chart: {},
      option: {}
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
    ...mapGetters(["nodes", "links", "operations"]),
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
    this.chart = echarts.init(
      document.getElementsByClassName("TimeOrder")[0],
      null,
      { renderer: "svg" }
    );
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
        data: this.operationTypes,
        scale: true,
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
      series: [
        {
          type: "scatter",
          data: this.chartData,

          tooltip: {
            formatter: function(obj) {
              const data = obj.data;
              return (
                '<div style="border-bottom: 1px solid rgba(255,255,255,.3); font-size: 18px;padding-bottom: 7px;margin-bottom: 7px">' +
                // obj.seriesName +
                "</div>" +
                "action" +
                "：" +
                data.operation +
                "<br>"
              );
            }
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
          data: this.chartData
        }
      ]
    });
  },
  methods: {}
};
</script>