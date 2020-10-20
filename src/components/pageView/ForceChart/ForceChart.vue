<template>
  <div class="ForceChart">
    <div style>
      <svg :width="chartWidth" :height="chartHeight">
        <defs>
          <filter id="shadow">
            <feDropShadow dx="0" dy="0" stdDeviation="0.3" />
          </filter>
        </defs>
        <text x="0" y="0" dx="0.5em" dy="1.5em" class="text info">
          UUID : {{ currentUUID }}
        </text>
        <text x="0" y="0" dx="0.5em" dy="3.0em" class="text info">
          Nodes : {{ nodesNumber }}
        </text>
        <text x="0" y="0" dx="0.5em" dy="4.5em" class="text info">
          Edges : {{ linksNumber }}
        </text>
        <g>
          <Links :links="links" :chartOption="chartOption" />
          <Nodes
            :nodes="nodes"
            :links="links"
            :eventOption="eventOption"
            :chartOption="chartOption"
          />
          <Texts :nodes="nodes" :visShowIds="visShowIds" />
        </g>
      </svg>
    </div>
  </div>
</template>
<script>
import Vue from "vue";
import Links from "./Links.vue";
import Nodes from "./Nodes.vue";
import Texts from "./Texts.vue";
import store from "@/store/";
import { mapState, mapGetters } from "vuex";
import * as d3 from "d3";

import {
  backgroundColor,
  contrastColor,
  classificationPalette,
} from "@/config/color";
// import { mapState } from "vuex";
// import * as _ from "lodash";
export default {
  name: "ForceChart",
  components: {
    Links,
    Nodes,
    Texts,
  },
  props: {
    eventOption: Object,
    visClick: Boolean,
    visBrush: Boolean,
    brushKeep: Boolean,
    visInvertBrush: Boolean,
    visDrag: Boolean,
    visMouseover: Boolean,
    visZoom: Boolean,
    visShowIds: Boolean,
    chartOption: Object,
  },
  data() {
    return {
      vis: d3.selectAll(),
      simulation__: {},
      brush: {},
      brushedNodes: [],
      invertBrush: {},
      brushG: d3.selectAll(),
      invertBrushG: d3.selectAll(),
      opacityNodes: d3.selectAll(),
      opacityLinks: d3.selectAll(),
      opacityTexts: d3.selectAll(),
      transform: { k: 1, x: 0, y: 0 },
    };
  },
  computed: {
    ...mapState({
      sourceData: (state) => state.data.sourceData,
      visualData: (state) => state.data.visualData,

      chartWidth: (state) => state.view.dpiX * 0.6,
      chartHeight: (state) => state.view.dpiY * 0.7,
      parentUUID: (state) => state.view.parentUUID,
      currentUUID: (state) => state.view.currentUUID,
      needUpdate: (state) => state.view.chartsNeedUpdate.force,

      currentOperations: (state) => state.analyze.currentOperations,
      rollbacked: (state) => state.analyze.rollbacked,
    }),
    ...mapGetters([
      "nodes",
      "links",
      "nodesNumber",
      "linksNumber",
      "beforeEvent",
    ]),
    simulation() {
      let simulation = this.simulation__;
      simulation.nodes(this.nodes);
      simulation
        .force("link")
        .links(this.links)
        .distance(this.chartOption.link.distance);
      simulation.force("charge").strength(this.chartOption.node.chargeForce);
      simulation.on("tick", this.ticked);
      return simulation;
    },
  },
  created() {
    this.contrastColor = contrastColor;
    this.backgroundColor = backgroundColor;
    this.simulation__ = d3
      .forceSimulation()
      .force(
        "link",
        d3.forceLink().id((d) => d.id || d.name)
      )
      .force("charge", d3.forceManyBody())
      .force(
        "center",
        d3.forceCenter(this.chartWidth / 2, this.chartHeight / 2)
      );
  },
  mounted() {
    // console.log(d3.version);
    // console.log(_.VERSION);
    console.log("ForceChart", this);
    // console.log(d3);
    const svg = d3
      .select(this.$el)
      .select("svg")
      .attr("viewBox", [0, 0, this.chartWidth, this.chartHeight]);
    const width = this.chartWidth,
      height = this.chartHeight;
    console.log("svg", svg);

    this.vis = svg.select("g");
    svg
      .call(
        d3.zoom().on("start", zoomStart).on("zoom", zoomed).on("end", zoomEnd)
      )
      .on("dblclick.zoom", null);

    // brush
    this.brush = d3
      .brush()
      .extent([
        [0, 0],
        [width, height],
      ])
      .on("start", this.brushStart)
      .on("brush", this.brushed)
      .on("end", this.brushEnd);
    this.brushG = svg.append("g").call(this.brush).attr("class", "brush");
    // console.log(this.brushG);

    // 使鼠标不能触发
    this.visBrush
      ? this.brushG.style("display", "inline")
      : this.brushG.style("display", "none");

    // invertBrush
    this.invertBrush = d3
      .brush()
      .extent([
        [0, 0],
        [width, height],
      ])
      .on("start", this.brushStart)
      .on("brush", this.brushed)
      .on("end", this.invertBrushEnd);
    this.invertBrushG = svg
      .append("g")
      .call(this.invertBrush)
      .attr("class", "invertBrush");

    this.visInvertBrush
      ? this.invertBrushG.style("display", "inline")
      : this.invertBrushG.style("display", "none");

    const zoomStart = () => {
      this.beforeEvent("zoom", this);
    };
    const zoomed = () => {
      if (!this.visZoom) return;
      let transform = d3.event.transform;
      this.vis.attr("transform", transform);
      this.transform.k = transform.k;
    };
    const zoomEnd = () => {
      if (!this.visZoom) return;
      let transform = d3.event.transform;
      let extentStart = transform.invert([0, 0]); // 视口的开始坐标
      let extentEnd = transform.invert([this.chartWidth, this.chartHeight]); // 视口的结束坐标
      let t = this.node.filter((d) => {
        return (
          extentStart[0] <= d.x &&
          extentStart[1] <= d.y &&
          d.x <= extentEnd[0] &&
          d.y <= extentEnd[1]
        );
      });
      t.each((d) => {
        d.attentionTimes += 1;
      });
      let operation = {
        action: "zoom",
        nodes: t.data(),
      };
      this.$store.dispatch("addOperation", operation);
      console.log("zoom");
    };
  },
  activated() {
    if (this.needUpdate) {
      this.render();
      store.commit("ForceUpdated");
    }
  },

  deactivated() {
    // this.simulation.stop();
  },

  methods: {
    render() {
      // 重新渲染图标
      if (this.nodes.length === 0) {
        return;
      }
      // debugger;
      this.transform.k = 1;
      this.transform.x = 0;
      this.transform.y = 0;
      let t = this.visTransform();
      t.x = 0;
      t.y = 0;
      t.k = 1;
      this.vis.attr("transform", t);
      this.simulation.alpha(1).restart(); // 更新数据后重新开始仿真
      console.log("render");
    },
    ticked() {
      console.log("ticked");
      // this.link
      //   .attr("x1", d => d.source.x)
      //   .attr("y1", d => d.source.y)
      //   .attr("x2", d => d.target.x)
      //   .attr("y2", d => d.target.y);
      // this.node.attr("cx", d => d.x).attr("cy", d => d.y);
      // if (this.visShowIds) {
      //   this.text.attr("x", d => d.x).attr("y", d => d.y);
      // }
    },
    tickEnd() {
      // 静态布局
      // this.link
      //   .attr("x1", d => d.source.x)
      //   .attr("y1", d => d.source.y)
      //   .attr("x2", d => d.target.x)
      //   .attr("y2", d => d.target.y);
      // this.node.attr("cx", d => d.x).attr("cy", d => d.y);
    },
    brushStart() {
      console.log("brushstart");
      // 记录之前的状态
      // console.log(d3.event);
      // debugger
      if (d3.event.selection === null) return;
      this.beforeEvent(this.visBrush ? "brush" : "invertBrush", this);

      if (!this.brushKeep && this.visBrush) {
        this.nodes.forEach((d) => {
          d.selected = false;
        });
      }
    },
    brushed() {
      if (d3.event.selection === null) return;
      console.log("brushing");
      let extent = d3.event.selection; // brush的一个事件
      let transform = this.visTransform();
      let extentStart = transform.invert(extent[0]); // brush的开始坐标
      let extentEnd = transform.invert(extent[1]); // brush的结束坐标
      // console.log(transform);
      // console.log(extent);
      // console.log(this.vis.node());
      // console.log(d3.zoomTransform(this.vis.node()));

      let type = this.visBrush ? "brushing" : "invertBrushing";
      this.nodes.forEach((node) => {
        extentStart[0] <= node.x &&
        extentStart[1] <= node.y &&
        node.x <= extentEnd[0] &&
        node.y <= extentEnd[1]
          ? (node[type] = true)
          : (node[type] = false);
      });
      // this.node.classed(className, d => {
      //   return (
      //     extentStart[0] <= d.x &&
      //     extentStart[1] <= d.y &&
      //     d.x <= extentEnd[0] &&
      //     d.y <= extentEnd[1]
      //   );
      // });
    },
    brushEnd() {
      if (d3.event.selection === null) return;
      console.log("brushed");
      let brushedNodes = this.nodes.filter((d) => d.brushing);
      brushedNodes.forEach((node) => {
        node.brushing = false;
        node.selected = true;
        node.attentionTimes += 1;
      });

      let operation = {
        action: "brush",
        nodes: brushedNodes,
      };
      this.$store.dispatch("addOperation", operation);
      console.log("brush");
    },
    invertBrushEnd() {
      if (d3.event.selection === null) return;
      let invertBrushedNodes = this.nodes.filter((d) => d.invertBrushing);
      invertBrushedNodes.forEach((node) => {
        node.invertBrushing = false;
        node.selected = false;
      });

      let operation = {
        action: "invertBrush",
        nodes: invertBrushedNodes,
      };
      this.$store.dispatch("addOperation", operation);
      console.log("invertBrush");
    },
    visTransform() {
      return d3.zoomTransform(this.vis.node());
    },
    fillColor(group) {
      return classificationPalette[group || 0];
    },
    test() {},
  },
  watch: {
    "eventOption.visBrush": function (val) {
      val
        ? this.brushG.style("display", "inline")
        : (this.brushG.style("display", "none"), this.brush.clear(this.brushG));
    },
    "eventOption.visInvertBrush": function (val) {
      val
        ? this.invertBrushG.style("display", "inline")
        : (this.invertBrushG.style("display", "none"),
          this.invertBrush.clear(this.invertBrushG));
    },
    "chartOption.link.distance": function () {
      if (this.chartOption.simulation.run) return;
      this.simulation.alphaTarget(0.5).restart();
      setTimeout(() => {
        if (this.chartOption.simulation.run) return;
        this.simulation.alphaTarget(0).stop();
      }, 400);
    },
    "chartOption.node.chargeForce": function () {
      if (this.chartOption.simulation.run) return;
      this.simulation.alphaTarget(0.5).restart();
      setTimeout(() => {
        if (this.chartOption.simulation.run) return;
        this.simulation.alphaTarget(0).stop();
      }, 400);
    },
    "chartOption.simulation.run": function (val) {
      val
        ? this.simulation
            .alphaTarget(this.chartOption.simulation.alphaTarget)
            .restart()
        : this.simulation.alphaTarget(0).stop();
    },
    "chartOption.simulation.alphaTarget": function (val) {
      if (this.chartOption.simulation.run) {
        if (val < 0.01) {
          this.chartOption.simulation.run = false;
        }
        this.simulation
          .alphaTarget(this.chartOption.simulation.alphaTarget)
          .restart();
      }
    },
  },
};
</script>
<style>
.ForceChart .text {
  user-select: none;
  font-family: Avenir;
  fill: var(--contrastColor);
  transition: fill 0.6s ease, fill-opacity 0.3s ease;
}
</style>
<style lang="scss" scope>
.ForceChart svg {
  /* display: none; */
  border: 1px solid #305dff;
  background: var(--backgroundColor);
}

.text {
  &.info {
    text-anchor: start;
    font-size: 10px;
  }
}
</style>