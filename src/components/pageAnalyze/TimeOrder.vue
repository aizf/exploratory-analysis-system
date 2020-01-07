<template>
  <div class="TimeOrder">
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

    <a-select :defaultValue="yDimension" size="small" style="width: 180px" @change="handleYChange">
      <a-select-option
        v-for="dimension in dimensions"
        :value="dimension.name"
        :key="dimension.name"
      >
        {{dimension.name}}
        <span :style="{color:'rgba(0, 0, 0, 0.45)'}">type: {{dimension.type}}</span>
      </a-select-option>
    </a-select>

    <div class="main" :style="{width:width+'px',height:height+'px'}"></div>
  </div>
</template>

<script>
import store from "@/store/";
import { mapState, mapGetters } from "vuex";
import echarts from "echarts";

export default {
  name: "TimeOrder",
  data() {
    return {
      chart: {},
      option: {},
      // number,ordinal,float,int,time
      dimensions: [
        { name: "time", type: "time" },
        {
          name: "operation",
          type: "ordinal",
          data: store.state.view.operationTypes
        }
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
      return this.recordset.map(d => [d.time, d.operation]);
    },
    chartEncode() {
      return {
        x: this.xDimension,
        y: this.yDimension,
        tooltip: this.dimensions.map(d => d.name)
      };
    }
  },

  mounted() {
    console.log("TimeOrder", this);
    this.chart = echarts.init(document.querySelector(".main"), null, {
      renderer: "svg"
    });
    console.log("chart", this.chart);
    this.option = {
      color: this.colorPalette2,
      backgroundColor: this.backgroundColor,
      textStyle: {
        color: this.contrastColor
      },
      xAxis: this.xAxis(this.dimensions[0]),
      yAxis: this.yAxis(this.dimensions[1]),
      legend: {
        orient: "vertical",
        right: "right",
        textStyle: {
          color: this.contrastColor
        }
        // data: this.operationTypes
      },
      tooltip: {},
      dataZoom: [{ type: "inside" }, { type: "slider" }],
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
      series: this.operationTypes.map(d => {
        return {
          name: d,
          type: "scatter",
          dimensions: this.dimensions,
          // dd[1] because of [d.time, d.operation]
          data: this.chartData.filter(dd => dd[1] === d),
          encode: this.chartEncode
        };
      })
    };
    this.chart.setOption(this.option, true);
  },
  activated() {
    this.chart.setOption({
      series: this.operationTypes.map(d => {
        return {
          name: d,
          data: this.chartData.filter(dd => dd[1] === d)
        };
      })
    });
  },
  methods: {
    xAxis(dimension) {
      const axis = {
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
          textStyle: {
            color: this.contrastColor
          }
        },
        splitLine: { show: false }
      };
      return this.handleAxisType(dimension, axis);
    },
    yAxis(dimension) {
      const axis = {
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
        },
        splitLine: { show: false }
      };
      return this.handleAxisType(dimension, axis);
    },
    handleAxisType(dimension, axis) {
      const type = dimension.type;
      switch (type) {
        case "time":
          Object.assign(axis, { type });
          break;
        case "ordinal":
          Object.assign(axis, { data: dimension.data, type: "category" });
          break;
        case "value":
          Object.assign(axis, { type });
          break;
        case "log":
          Object.assign(axis, { type });
          break;
        default:
          alert("type error");
          break;
      }
      return axis;
    },

    handleXChange(value) {
      this.xDimension = value;
      const dimension = this.dimensions.find(d => d.name === value);
      this.chart.setOption({
        series: this.operationTypes.map(d => {
          return {
            name: d,
            encode: this.chartEncode
          };
        }),
        xAxis: this.xAxis(dimension)
      });
    },
    handleYChange(value) {
      this.yDimension = value;
      const dimension = this.dimensions.find(d => d.name === value);
      this.chart.setOption({
        series: this.operationTypes.map(d => {
          return {
            name: d,
            encode: this.chartEncode
          };
        }),
        yAxis: this.yAxis(dimension)
      });
    }
  },
  watch: {}
};
</script>