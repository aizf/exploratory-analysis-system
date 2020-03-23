<template>
  <div class="TimeOrder">
    <div :style="{width:width+'px'}">
      <a-row>
        <a-col :span="4" :style="{border :`1px solid ${contrastColor}`}">
          <span :style="{color:contrastColor}">xAxis : </span>
          <a-select :value="xDimension" size="small" style="width: 80%" @change="handleXChange">
            <a-select-option
              v-for="dimension in dimensions"
              :value="dimension.name"
              :key="dimension.name"
            >
              {{dimension.name}}
              <span
                :style="{color:'rgba(0, 0, 0, 0.45)'}"
              >type: {{dimension.type}}</span>
            </a-select-option>
          </a-select>
        </a-col>
        <a-col :span="1">
          <a-button
            size="small"
            ghost
            :style="{width: '70%',margin:'0 14%'}"
            @click="swapXYDimensions"
          >
            <a-icon type="swap" />
          </a-button>
        </a-col>
        <a-col :span="4" :style="{border :`1px solid ${contrastColor}`}">
          <span :style="{color:contrastColor}">yAxis : </span>
          <a-select :value="yDimension" size="small" style="width: 80%" @change="handleYChange">
            <a-select-option
              v-for="dimension in dimensions"
              :value="dimension.name"
              :key="dimension.name"
            >
              {{dimension.name}}
              <span
                :style="{color:'rgba(0, 0, 0, 0.45)'}"
              >type: {{dimension.type}}</span>
            </a-select-option>
          </a-select>
        </a-col>
      </a-row>
    </div>

    <div class="main" :style="{width:width+'px',height:height+'px'}"></div>
  </div>
</template>

<script>
import Vue from 'vue'
import {Col,Row,Select} from 'ant-design-vue'
Vue.use(Col);
Vue.use(Row);
Vue.use(Select);
// import store from "@/store/";
import { mapState, mapGetters } from "vuex";
import echarts from "echarts";

export default {
  name: "TimeOrder",
  data() {
    return {
      chart: {},
      option: {},
      // number,ordinal,float,int,time
      xDimension: "time",
      yDimension: "operation"
    };
  },
  computed: {
    ...mapState({
      visualData: state => state.data.visualData,

      width: state => state.view.dpiX * 0.7,
      height: state => (state.view.dpiY - 64) * 0.35,
      classificationPalette: state => state.view.classificationPalette,
      classificationPalette2: state => state.view.classificationPalette2,
      backgroundColor: state => state.view.backgroundColor,
      contrastColor: state => state.view.contrastColor,
      operationTypes: state => state.view.operationTypes,

      recordset: state => state.analyze.recordset
    }),
    ...mapGetters(["operations"]),

    dimensions() {
      // chartData的列定义
      return [
        // 0
        { name: "time", type: "time" },
        // 1
        {
          name: "operation",
          type: "ordinal",
          data: this.operationTypes
        },
        // 2
        {
          name: "index",
          type: "ordinal",
          data: this.recordset.map(d => d.index)
        },
        // 3
        {
          name: "Adjust Layout ? ",
          type: "ordinal",
          data: ["Yes", "No"]
        },
        // 4
        {
          name: "Switch Layout ? ",
          type: "ordinal",
          data: ["Yes", "No"]
        }
      ];
    },
    chartData() {
      // const arr=["click", "drag", "mouseover",
      //    "brush", "classification", "invertBrush",
      //     "zoom", "filter", "undo", "redo", "rollback"];
      // 数据
      function adjustView(op) {
        const arr = ["drag", "classification", "zoom", "filter"];
        return arr.includes(op) ? "Yes" : "No";
      }
      function switchView(op) {
        const arr = ["undo", "redo", "rollback"];
        return arr.includes(op) ? "Yes" : "No";
      }

      return this.recordset.map(d => {
        const op = d.operation;
        return [d.time, op, d.index, adjustView(op), switchView(op)];
      });
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
      color: this.classificationPalette2,
      backgroundColor: this.backgroundColor,
      textStyle: {
        color: this.contrastColor
      },
      xAxis: this.xAxis(this.dimensions.find(d => d.name === this.xDimension)),
      yAxis: this.yAxis(this.dimensions.find(d => d.name === this.yDimension)),
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
    },
    swapXYDimensions() {
      const tmp = this.xDimension;
      this.xDimension = this.yDimension;
      this.yDimension = tmp;
      this.chart.setOption({
        series: this.operationTypes.map(d => {
          return {
            name: d,
            encode: this.chartEncode
          };
        }),
        xAxis: this.xAxis(
          this.dimensions.find(d => d.name === this.xDimension)
        ),
        yAxis: this.yAxis(this.dimensions.find(d => d.name === this.yDimension))
      });
    }
  },
  watch: {}
};
</script>
<style scope>
</style>