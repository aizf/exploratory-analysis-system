<template>
  <svg class="ForceChart" :width="width" :height="height">
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
    <g class="vis">
      <Links :links="links" :chartOption="chartOption" />
      <Nodes
        :nodes="nodes"
        :links="links"
        :eventOption="eventOption"
        :chartOption="chartOption"
      />
      <Texts :nodes="nodes" :visShowIds="eventOption.visShowIds" />
    </g>
    <g class="base-brush brush" v-show="eventOption.visBrush" />
    <g class="base-brush invert-brush" v-show="eventOption.visInvertBrush" />
  </svg>
</template>
<script>
import Vue from "vue";
import Links from "./Links.vue";
import Nodes from "./Nodes.vue";
import Texts from "./Texts.vue";
import store from "@/store/";
import { mapState, mapGetters } from "vuex";
import * as d3 from "d3";
import throttle from "lodash/throttle";

import {
  backgroundColor,
  contrastColor,
  classificationPalette,
} from "@/config/color";
// import Worker from "worker-loader!./simulation.worker.js";
import Worker from "./simulation.worker.js";
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
    chartOption: Object,
  },
  data() {
    return {
      transform: { k: 1, x: 0, y: 0 },
    };
  },
  computed: {
    ...mapState({
      width: (state) => state.view.dpiX * 0.6,
      height: (state) => state.view.dpiY * 0.7,
      currentUUID: (state) => state.view.currentUUID,
      needUpdate: (state) => state.view.chartsNeedUpdate.force,
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
      .force("center", d3.forceCenter(this.width / 2, this.height / 2));
  },
  mounted() {
    // console.log(d3.version);
    // console.log(_.VERSION);
    console.log("ForceChart", this);
    // console.log(d3);
    const svg = d3
      .select(this.$el)
      .attr("viewBox", [0, 0, this.width, this.height]);
    // console.log("svg", svg);

    this.vis = svg.select("g.vis");
    // console.log("vis", this.vis);

    this.initZoom(svg);
    this.initBrush(svg);

    const worker = new Worker();
    worker.postMessage(2);
    worker.addEventListener("message", (e) => {
      console.log("worker-e", e);
    });
  },
  activated() {
    if (this.needUpdate) {
      this.reInit();
      store.commit("ForceUpdated");
    }
  },
  methods: {
    reInit() {
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
      console.log("reInit");
    },
    initZoom(svg) {
      const zoomStart = () => {
        // console.log("zoomStart");
        this.beforeEvent("zoom", this);
      };
      const zoomed = () => {
        if (!this.eventOption.visZoom) return;
        let transform = d3.event.transform;
        this.vis.attr("transform", transform);
        this.transform.k = transform.k;
      };
      const zoomEnd = () => {
        if (!this.eventOption.visZoom) return;
        let transform = d3.event.transform;
        let extentStart = transform.invert([0, 0]); // 视口的开始坐标
        let extentEnd = transform.invert([this.width, this.height]); // 视口的结束坐标
        let t = this.nodes.filter((d) => {
          return (
            extentStart[0] <= d.x &&
            extentStart[1] <= d.y &&
            d.x <= extentEnd[0] &&
            d.y <= extentEnd[1]
          );
        });
        t.forEach((d) => {
          d.attentionTimes += 1;
        });
        let operation = {
          action: "zoom",
          nodes: t,
        };
        this.$store.dispatch("addOperation", operation);
        console.log("zoom");
      };

      svg
        .call(
          d3.zoom().on("start", zoomStart).on("zoom", zoomed).on("end", zoomEnd)
        )
        .on("dblclick.zoom", null);
    },
    initBrush(svg) {
      const brushStart = () => {
        // console.log("brushstart");
        // console.log(d3.event);
        if (d3.event.selection === null) return;
        this.beforeEvent(
          this.eventOption.visBrush ? "brush" : "invertBrush",
          this
        );

        if (!this.eventOption.brushKeep && this.eventOption.visBrush) {
          this.nodes.forEach((d) => {
            d.selected = false;
          });
        }
      };
      const brushing = () => {
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

        let type = this.eventOption.visBrush ? "brushing" : "invertBrushing";
        this.nodes.forEach((node) => {
          extentStart[0] <= node.x &&
          extentStart[1] <= node.y &&
          node.x <= extentEnd[0] &&
          node.y <= extentEnd[1]
            ? (node[type] = true)
            : (node[type] = false);
        });
      };
      const brushed = throttle(brushing, 16, {
        leading: true,
        trailing: false,
      });
      const brushEnd = () => {
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
      };
      const invertBrushEnd = () => {
        if (d3.event.selection === null) return;
        let invertBrushedNodes = this.nodes.filter((d) => d.invertBrushing);
        invertBrushedNodes.forEach((node) => {
          node.invertBrushing = false;
          node.selected = false;
        });
        console.log("invertBrush");
      };

      const brush = d3
        .brush()
        .extent([
          [0, 0],
          [this.width, this.height],
        ])
        .on("start", brushStart)
        .on("brush", brushed)
        .on("end", brushEnd);
      svg.select("g.brush").call(brush);

      const invertBrush = d3
        .brush()
        .extent([
          [0, 0],
          [this.width, this.height],
        ])
        .on("start", brushStart)
        .on("brush", brushed)
        .on("end", invertBrushEnd);
      svg.select("g.invert-brush").call(invertBrush);
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
    visTransform() {
      return d3.zoomTransform(this.vis.node());
    },
    fillColor(group) {
      return classificationPalette[group || 0];
    },
    test() {},
  },
  watch: {
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
.ForceChart {
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

.base-brush {
  fill: none;
  pointer-events: all;
}
</style>