<template>
  <div class="Scatter test-border">
    <div class="chart" ref="chart"></div>
    <a-select class="X" v-model="xDim" size="small" @change="handleChange">
      <a-select-option v-for="(d, i) in column" :value="i" :key="d">
        {{ d }}
      </a-select-option>
    </a-select>
    <a-select class="Y" v-model="yDim" size="small" @change="handleChange">
      <a-select-option v-for="(d, i) in column" :value="i" :key="d">
        {{ d }}
      </a-select-option>
    </a-select>
  </div>
</template>
<script>
// import Vue from "vue";
import { mapState, mapGetters } from "vuex";
import echarts from "echarts";
import eventBus from "../ForceChart/eventBus.js";
// import * as _ from "lodash";
export default {
  name: "Scatter",
  inject: ["backgroundColor", "contrastColor", "classificationPalette"],
  props: {
    items: Array,
  },
  data() {
    return {
      column: [
        "degree_centrality",
        "closeness_centrality",
        "betweenness_centrality",
        "eigenvector_centrality",
        "pagerank",
        "avg1",
        "avg2",
        "degree+closeness",
        "t-SNE-X",
        "t-SNE-Y",
      ],
      xDim: 0,
      yDim: 1,
    };
  },
  computed: {
    ...mapState({
      nodeFields: (state) => state.data.nodeFields,
      uidLinksMap: (state) => state.data.uidMaps.uidLinksMap,
      idNodeMap: (state) => state.data.uidMaps.idNodeMap,
    }),
    ...mapGetters(["nodes", "links", "nodesNumber"]),
  },
  mounted() {
    console.log("Scatter", this);
    this.chart = echarts.init(this.$refs.chart, null);
    eventBus.$on("centrality", (centrality) => {
      this.centrality = centrality;
      this.render();
    });
    this.$watch(
      "items",
      function () {
        this.render();
      },
      {
        deep: true,
      }
    );
    // this.chart.on("click", (params) => {
    //   const node = this.idNodeMap[params.name];
    //   node.selected = !node.selected;
    // });
    // this.chart.on("mouseover", (params) => {
    //   const node = this.idNodeMap[params.name];
    //   node.current = true;
    //   eventBus.$emit("board1-mouseover", node);
    // });
    // this.chart.on("mouseout", (params) => {
    //   const node = this.idNodeMap[params.name];
    //   node.current = false;
    //   eventBus.$emit("board1-mouseout", node);
    // });
  },
  methods: {
    render() {
      if (!this.centrality) return;
      const dict = {};
      const x = this.xDim,
        y = this.yDim,
        centrality = this.centrality;
      for (let i = 0; i < centrality.row.length; i++) {
        const id = centrality.row[i];
        dict[id] = centrality.data[i];
      }
      const data = [];

      for (let node of this.items) {
        data.push({
          name: node.id,
          value: [dict[node.id][x], dict[node.id][y]],
          itemStyle: {
            color: this.classificationPalette[node.group || 0],
          },
        });
      }
      const option = {
        grid: {
          bottom: "14%",
          height: "76%",
        },
        backgroundColor: this.backgroundColor,
        textStyle: {
          color: this.contrastColor,
        },
        tooltip: {
          trigger: "item",
          axisPointer: {
            type: "cross",
          },
          // formatter: "{b}",
        },
        xAxis: {
          name: "",
          nameLocation: "center",
          axisLine: {
            lineStyle: {
              color: this.contrastColor,
            },
          },
          splitLine: { show: false },
        },
        yAxis: {
          name: "",
          axisLine: {
            lineStyle: {
              color: this.contrastColor,
            },
          },
          splitLine: { show: false },
        },
        series: {
          type: "scatter",
          data: data,
          // label: { show: true, position: "top", formatter: "{b}" },
        },
      };
      this.chart.setOption(option, true);
    },
    handleChange() {
      this.render();
    },
  },
  watch: {},
};
</script>
<style lang="scss" scoped>
.Scatter {
  width: 600px;
  height: 380px;
  position: relative;
  > .chart {
    width: 100%;
    height: 100%;
  }
}
.X,
.Y {
  position: absolute;
  width: 160px;
  height: 5px;
}
.X {
  bottom: 24px;
  right: 10px;
  // transform: translate(-100%, -100%);
}
.Y {
  top: 0;
  left: 0px;
}
</style>