<template>
  <div class="TimeOrder" :style="{width:width+'px',height:height+'px',border:'1px solid #305dff'}"></div>
</template>

<script>
import * as d3 from "d3";
import echarts from "echarts";

export default {
  name: "TimeOrder",
  data() {
    return {
      chart: {},
      option: {},
      option_: {}
    };
  },
  computed: {
    width() {
      return this.$store.state.dpiX * 0.7;
    },
    height() {
      return (this.$store.state.dpiY - 64) * 0.35;
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
    operationTypes() {
      return this.$store.state.operationTypes;
    },
    operation_Types() {
      return this.$store.state.operation_Types;
    },
    operations() {
      return this.$store.state.operations;
    },
    operations_() {
      return this.$store.state.operations_;
    }
  },
  mounted() {
    this.chart = echarts.init(document.getElementsByClassName("TimeOrder")[0], null, {renderer: 'svg'});
    this.option = {
      dataset: [
        {
          id: "operations",
          source: this.operations
        },
        {
          id: "operations_",
          source: this.operations_
        }
      ],
      xAxis: {
        scale: true,
        type: "time"
      },
      yAxis: {
        scale: true,
        data: this.operationTypes,
        axisTick: {
          alignWithLabel: true,
          interval: true
        }
      },
      series: [
        {
          type: "effectScatter",
          data: [[172.7, 105.2], [153.4, 42]]
        },
        {
          type: "scatter",
          datasetIndex: 0,
          encode: {
            x: "time",
            y: "action"
          },
          tooltip: {
            formatter: function(obj) {
              let data = obj.data;
              return (
                '<div style="border-bottom: 1px solid rgba(255,255,255,.3); font-size: 18px;padding-bottom: 7px;margin-bottom: 7px">' +
                obj.seriesName +
                123213 +
                "</div>" +
                "action" +
                "：" +
                data.action +
                "<br>"
              );
            }
          }
        }
      ]
    };
    this.chart.setOption(this.option, true);
    // value: `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`
  },
  activated() {
    this.chart.setOption(this.option, true);
    // operations_
  },
  methods: {}
};
</script>