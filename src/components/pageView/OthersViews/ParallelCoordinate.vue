<template>
  <div class="ParallelCoordinate test-border">
    <div class="chart" ref="chart"></div>
    <!-- <div class="button button-0" @click="applyInfo(0)"></div>
    <div class="button button-1" @click="applyInfo(1)"></div>
    <div class="button button-2" @click="applyInfo(2)"></div>
    <div class="button button-3" @click="applyInfo(3)"></div>
    <div class="button button-4" @click="applyInfo(4)"></div>
    <div class="button button-5" @click="applyInfo(5)"></div> -->
  </div>
</template>
<script>
import { mapState, mapGetters } from "vuex";
// import eventBus from "./ForceChart/eventBus.js";
import echarts from "echarts";
import axios from "axios";
import eventBus from "./eventBus.js";
export default {
  name: "ParallelCoordinate",
  inject: ["backgroundColor", "contrastColor", "classificationPalette"],
  props: { items: Array },
  data() {
    return {};
  },
  computed: {
    ...mapState({
      datasetName: (state) => state.data.datasetName,
      idNodeMap: (state) => state.data.uidMaps.idNodeMap,
      isDirected: (state) => state.data.isDirected,
    }),
    ...mapGetters(["nodes", "links", "nodesNumber"]),
    defaultCircleSize() {
      return +this.chartOption.node.nodeSize;
    },
  },
  mounted() {
    console.log("ParallelCoordinate", this);
    this.chart = echarts.init(this.$refs.chart, null);
    this.chart.on("brushselected", (params) => {
      // console.log(params);
      const index = params.batch[0].selected[0].dataIndex;
      // console.log(index.map((d) => this.row[d]));
      this.nodes.forEach((d) => (d.selected = false));
      index.forEach((d) => {
        const node = this.idNodeMap[this.row[d]];
        node.selected = true;
      });
    });
    this.requestCentrality();
    // this.$watch(
    //   function () {
    //     this.nodes.map((d) => d.id);
    //   },
    //   function () {
    //     this.requestCentrality();
    //   },
    //   {
    //     immediate: true,
    //     deep: true,
    //   }
    // );
  },
  methods: {
    requestCentrality() {
      axios({
        method: "get",
        // url: "//127.0.0.1:3000/p/network_centrality",
        url: `/static/${this.datasetName}/centrality.json`,
      }).then((res) => {
        const { data } = res;
        // this.avgC(data);
        this.data = data;
        this.rerender(data);
        this.chart.hideLoading();
        // console.log("parallel", data);
      });
    },
    rerender({ density, average_degree, column, row, data }) {
      // eventBus.$emit("density", density);
      // eventBus.$emit("average_degree", average_degree);
      eventBus.$emit("centrality", { column, row, data });
      this.$parent.centrality = { column, row, data };
      // console.log(column, row, data);
      this.row = row;
      this.data = data;
      const parallelAxis = () => {
        return column.map((d, i) => ({ dim: i, name: d }));
      };
      const option = {
        animation: false,
        brush: {
          toolbox: ["clear"],
          brushLink: "all",
          throttleDelay: 300,
        },
        parallelAxis: parallelAxis(),
        parallel: {
          bottom: "5%",
          left: "5%",
          height: "80%",
          width: "85%",
          parallelAxisDefault: {
            type: "value",
            name: "parallelAxis",
            nameLocation: "end",
            nameGap: 20,
            splitNumber: 3,
            nameTextStyle: {
              fontSize: 14,
            },
            axisLine: {
              lineStyle: {
                color: this.contrastColor,
              },
            },
            axisTick: {
              lineStyle: {
                color: this.contrastColor,
              },
            },
            splitLine: {
              show: false,
            },
            axisLabel: {
              color: this.contrastColor,
            },
          },
        },
        series: [
          {
            name: "parallel",
            type: "parallel",
            smooth: true,
            lineStyle: {
              width: 1,
              opacity: 0.3,
            },
            data: this.chartData(data),
          },
        ],
      };
      // console.log("chartData", this.chartData(data));
      this.chart.setOption(option, true);
    },
    chartData(data) {
      // res = [{name,value:[],lineStyle},{},...]
      const dict = new Map();

      // 全部节点
      for (let i = 0; i < this.row.length; i++) {
        const id = this.row[i],
          value = data[i];
        const node = this.idNodeMap[id];
        const datum = {
          name: id,
          value,
          lineStyle: {
            color: this.fillColor(node.group),
          },
        };
        dict.set(id, datum);
      }

      // 部分节点
      const ids = this.items.map((d) => d.id);

      return ids.map((id) => dict.get(id));
    },
    fillColor(group) {
      return this.classificationPalette[group || 0];
    },
    applyInfo(n) {
      for (let i = 0; i < this.row.length; i++) {
        const id = this.row[i],
          value = this.data[i][n];
        const node = this.idNodeMap[id];
        node.size = this.defaultCircleSize * 2 * value;
      }
    },
    avgC({ column, row, data }) {
      // 每个维度的平均值
      const ss = [];
      for (let j = 0; j < column.length; j++) {
        const list = [];
        for (let i = 0; i < row.length; i++) {
          list.push(data[i][j]);
        }
        ss[j] = this.calcS(list);
      }
      const ssSum = ss.reduce((sum, d) => sum + d);
      const weights = ss.map((d) => d / ssSum);
      for (let i = 0; i < row.length; i++) {
        let res = 0;
        for (let j = 0; j < column.length; j++) {
          res += data[i][j] * weights[j];
        }
        data[i].push(res);
      }
      column.push("avg");
    },
    // 计算方差
    /**
     * @param list Array
     */
    calcS(list) {
      const n = list.length;
      const avg = list.reduce((sum, d) => sum + d) / n;
      return list.reduce((sum, d) => sum + Math.pow(d - avg, 2)) / n;
    },
  },
  watch: {
    items: {
      handler(newVal) {
        console.log("items");
        this.rerender(this.data);
      },
    },
  },
};
</script>
<style lang="scss" scoped>
.ParallelCoordinate {
  width: 1350px;
  height: 280px;
  position: relative;
  background: var(--backgroundColor);
}
.chart {
  width: 100%;
  height: 100%;
}
.button {
  width: 120px;
  height: 30px;
  position: absolute;
  cursor: pointer;
  &-0 {
    top: 0;
    left: 10px;
  }
  &-1 {
    top: 0;
    left: 190px;
  }
  &-2 {
    top: 0;
    left: 480px;
  }
  &-3 {
    top: 0;
    left: 670px;
  }
  &-4 {
    top: 0;
    left: 900px;
  }
  &-5 {
    top: 0;
    left: 1150px;
  }
}
</style>