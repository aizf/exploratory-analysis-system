<template>
  <div>
    <div class="operations" style="height: 50vh"></div>
    <div class="oper" style="height: 50vh"></div>
  </div>
</template>

<script>
import echarts from "echarts";
import G2 from '@antv/g2';
import { View } from '@antv/data-set';
// language js
import { codemirror } from "vue-codemirror";
// theme css
import "codemirror/lib/codemirror.css";
// more codemirror resources
// import 'codemirror/some-resource...'
export default {
  name: "PageAnalyze",
  components: { codemirror },
  data() {
    return {
      operationsVis: {},
      operationsChart: {},
      option: {}
    };
  },
  computed: {
    codemirror() {
      return this.$refs.myCm.codemirror;
    },
    operations() {
      return this.$store.state.operations;
    }
  },
  mounted() {
    this.operationsChart = echarts.init(
      document.getElementsByClassName("operations")[0]
    );
    console.log("echarts", this.operationsChart);
    console.log(this.operations);
    this.option = {
      backgroundColor: this.$store.state.backgroundColor,
      color: this.$store.state.colorPalette,
      grid: {
        x: "10%",
        x2: 150,
        y: "18%",
        y2: "10%"
      },
      dataset: {
        source: this.operations
      },
      xAxis: {
        type: "time",
        name: "时间",
        nameGap: 16,
        nameTextStyle: {
          color: "#fff",
          fontSize: 14
        },
        splitLine: {
          show: false
        },
        axisLine: {
          lineStyle: {
            color: "#eee"
          }
        }
      },
      yAxis: {
        type: "category",
        data: ["click", "brush", "drag", "mouseover", "invertBrush", "zoom"],
        name: "操作",
        nameLocation: "end",
        nameGap: 20,
        nameTextStyle: {
          color: "#fff",
          fontSize: 16
        },
        axisLine: {
          lineStyle: {
            color: "#eee"
          }
        },
        splitLine: {
          show: false
        }
      },
      series: [
        {
          name: "北京",
          type: "scatter",
          encode: {
            x: "time",
            y: "action"
          }
        }
      ]
    };
    this.operationsChart.setOption(this.option, true);

    const chart = new G2.Chart({
      container: document.getElementsByClassName("oper")[0],
      forceFit: true,
      height: 400,
      data:this.operations,
    });
  },
  activated() {
    this.operationsChart.setOption(this.option, true);
  },
  methods: {}
};
</script>