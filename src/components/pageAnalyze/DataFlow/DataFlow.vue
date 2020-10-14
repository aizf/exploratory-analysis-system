<template>
  <div class="DataFlow" :style="{ width: width + 'px', height: height + 'px' }">
    <svg :width="width" :height="height">
      <defs>
        <filter id="shadow">
          <feDropShadow dx="0" dy="0" stdDeviation="0.3" />
        </filter>
      </defs>
      <g>
        <NodePie
          :nodes="nodes"
          :markCircleR="markCircleR"
          :currentUUID="currentUUID"
        />
        <Link
          :nodes="nodes"
          :links="links"
          :markCircleR="markCircleR"
          :currentUUID="currentUUID"
        />
        <g class="texts" style="font: 10px sans-serif">
          <text
            v-for="node in nodes"
            :x="node.x1 + 6"
            :y="(node.y0 + node.y1) / 2 - markCircleR"
            dx="-0.35em"
            :stroke="contrastColor"
            text-anchor="start"
            :key="node.uuid"
          >
            {{ node.uuid }}
          </text>
        </g>
      </g>
    </svg>
  </div>
</template>

<script>
import Vue from "vue";
import { mapState, mapGetters } from "vuex";
import NodePie from "./NodePie.vue";
import Link from "./Link.vue";
import * as d3 from "d3";
import * as d3Sankey from "d3-sankey";
if (process.env.NODE_ENV === "development") {
  Object.assign(d3, d3Sankey);
}

import {
  backgroundColor,
  contrastColor,
  classificationPalette,
  classificationPalette2,
} from "@/config/color";

export default {
  name: "DataFlow",
  components: {
    NodePie,
    Link,
  },
  props: {
    option: Object,
  },
  data() {
    return {
      nodeWidth: 45,
      markCircleR: 50,
      vis: d3.selectAll(),
    };
  },
  computed: {
    ...mapState({
      visualData: (state) => state.data.visualData,

      width: (state) => state.view.dpiX * 0.7,
      height: (state) => (state.view.dpiY - 64) * 0.45,
      operationTypes: (state) => state.view.operationTypes,
      backOps: (state) => state.view.backOps,
      currentUUID: (state) => state.view.currentUUID,

      recordset: (state) => state.analyze.recordset,
    }),
    ...mapGetters(["tmpExistingViews"]),

    sankeyData() {
      // 用于计算sankey的数据

      // this.option.isCompressRecord && (rs = this.compressRecord(rs));
      // 去除uuid相同的node

      const nodes = Object.entries(this.tmpExistingViews.nodes).map(
        ([key, val]) => ({
          uuid: key,
          data: val,
          fixedValue: val.nodes.length,
          isShortestPath: false,
        })
      );

      // links
      const links = this.tmpExistingViews.links.filter(
        (d) => !this.backOps.includes(d.operation)
      ).map(d=>({...d}));

      return Vue.observable({ nodes: nodes, links: links });
    },
    graph() {
      // k为extent放缩系数
      const k = Math.floor(this.nodesNum / 10) + 1;
      this.sankey.extent([
        [1, 5],
        [this.width * k - 1, this.height - 5],
      ]);
      return this.sankey(this.sankeyData);
    },
    nodes() {
      return this.graph.nodes;
    },
    links() {
      return this.tmpExistingViews.links;
    },
    nodesNum() {
      return Object.keys(this.tmpExistingViews.nodes).length;
    },
    nodesDict() {
      const dict = {};
      this.sankeyData.nodes.forEach((d) => {
        dict[d.uuid] = d;
      });
      return dict;
    },
    currentNode() {
      return this.nodesDict[this.currentUUID];
    },
  },
  created() {
    this.contrastColor = contrastColor;
    this.backgroundColor = backgroundColor;
    this.classificationPalette = classificationPalette;
    this.classificationPalette2 = classificationPalette2;
    this.sankey = d3
      .sankey()
      .nodeAlign(d3.sankeyLeft)
      .nodeId((d) => d.uuid)
      .nodeWidth(this.nodeWidth)
      .nodePadding(60)
      .extent([
        [1, 5],
        [this.width * Math.floor(this.nodesNum / 10 + 1) - 1, this.height - 5],
      ]);
    // Vue.observable(this.sankey);
  },
  mounted() {
    console.log("DataFlow", this);
    // console.log("d3Sankey", d3Sankey);
    // console.log(d3);
    const svg = d3
      .select(this.$el)
      .select("svg")
      .attr("viewBox", [0, 0, this.width, this.height]);
    svg.node().addEventListener(
      "click",
      () => {
        this.$emit("staticForceShowChanged", false);
      },
      false
    );
    this.vis = svg.select("g");

    svg
      .call(
        d3
          .zoom()
          .extent([
            [0, 0],
            [this.width, this.height],
          ])
          .on("zoom", () => {
            const transform = d3.event.transform;
            this.vis.attr("transform", transform);
          })
      )
      .on("dblclick.zoom", null);
  },
  methods: {
    visTransform() {
      return d3.zoomTransform(this.vis.node());
    },
    markedSymbol(type, size) {
      const types = {
        circle: d3.symbols[0],
        cross: d3.symbols[1],
        diamond: d3.symbols[2],
        square: d3.symbols[3],
        star: d3.symbols[4],
        triangle: d3.symbols[5],
        wye: d3.symbols[6],
      };
      return d3.symbol().type(types[type]).size(size)();
    },
    compressRecord(rs) {
      return rs.filter((d, i, arr) => {
        if (i >= rs.length - 1) return true;
        return d.operation !== arr[i + 1].operation;
      });
    },
  },
  watch: {},
};
</script>
<style lang="scss" scoped>
.DataFlow {
  line {
  }
  circle {
    pointer-events: all;
    stroke: none;
  }
  circle.selected {
    /* fill: red; */
    stroke: red;
    stroke-width: 1.5;
  }
  circle.brushing {
    /* fill: red; */
    stroke: red;
    stroke-width: 1.5;
  }
}
</style>
