<template>
  <div class="ParallelCoordinate test-border" ref="chart"></div>
</template>
<script>
import { mapState, mapGetters } from "vuex";
import echarts from "echarts";
import axios from "axios";
export default {
  name: "ParallelCoordinate",
  inject: ["backgroundColor", "contrastColor", "classificationPalette"],
  props: {},
  data() {
    return {
      density: 0,
    };
  },
  computed: {
    ...mapState({
      idNodeMap: (state) => state.data.uidMaps.idNodeMap,
    }),
    ...mapGetters(["nodes", "links", "nodesNumber"]),
  },
  mounted() {
    console.log("ParallelCoordinate", this);
    this.requestCentrality();
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
    this.$watch(
      function () {
        this.nodes.map((d) => d.id);
      },
      function () {
        this.requestCentrality();
      },
      {
        immediate: true,
        deep: true,
      }
    );
  },
  methods: {
    requestCentrality() {
      const nodes = this.nodes.map((node) => ({
          id: node.id,
          group: node.group,
        })),
        links = this.links.map((link) => ({
          source: link.source.id,
          target: link.target.id,
        }));

      axios({
        method: "post",
        // url: "//127.0.0.1:3000/p/network_centrality",
        url: "//127.0.0.1:5000/network_centrality",
        data: { nodes, links },
      }).then((res) => {
        const {
          data: { data },
        } = res;
        this.rerender(data);
        // console.log("parallel", data);
      });
    },
    rerender({ density, column, row, data }) {
      this.density = density;
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
      // console.log("option", option);
      this.chart.setOption(option, true);
    },
    chartData(data) {
      const res = [];
      for (let i = 0; i < this.row.length; i++) {
        const id = this.row[i],
          value = data[i];
        const node = this.idNodeMap[id];
        res.push({
          name: id,
          value,
          lineStyle: {
            color: this.fillColor(node.group),
          },
        });
      }
      return res;
    },
    fillColor(group) {
      return this.classificationPalette[group || 0];
    },
  },
  watch: {},
};
</script>
<style lang="scss" scoped>
.ParallelCoordinate {
  width: 1350px;
  height: 280px;
}
</style>