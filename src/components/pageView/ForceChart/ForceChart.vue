<template>
  <svg class="ForceChart container" :width="width" :height="height">
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
    <rect class="zoom" x="0" y="0" :width="width" :height="height" />
    <g class="vis">
      <Links :links="links" :chartOption="chartOption" />
      <Nodes
        :nodes="nodes"
        :links="links"
        :eventOption="eventOption"
        :chartOption="chartOption"
        @changeWorkerData="changeWorkerData"
        @alterWorkerData="alterWorkerData"
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
import Worker from "./simulation.worker.cjs";
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
      uidNodeMap: (state) => state.data.uidMaps.uidNodeMap,
      width: (state) => state.view.dpiX * 0.4,
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
  },
  created() {
    this.contrastColor = contrastColor;
    this.backgroundColor = backgroundColor;
  },
  mounted() {
    // console.log(d3.version);
    // console.log(_.VERSION);
    // console.log(d3);
    console.log("ForceChart", this);
    const svg = d3
      .select(this.$el)
      .attr("viewBox", [0, 0, this.width, this.height]);
    const zoomDom = svg.select("rect.zoom");
    this.vis = svg.select("g.vis");
    // console.log(svg, zoomDom, this.vis);

    this.initZoom(zoomDom);
    this.initBrush(svg, zoomDom);
    this.initWorker();
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
      this.vis.attr("transform", d3.zoomIdentity.translate(0, 0).scale(1));
      this.initWorker();
      console.log("reInit");
    },
    initZoom(zoomDom) {
      const zoomStart = (e) => {
        console.log("zoom start", e);
        this.beforeEvent("zoom", this);
      };
      const zoomed = ({ transform }) => {
        console.log("zooming");
        this.vis.attr("transform", transform);
      };
      const zoomEnd = ({ transform }) => {
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
      const zoomInstance = d3.zoom();
      zoomDom.call(zoomInstance).on("dblclick.zoom", null);

      // d3 bug，禁用事件后，__zoom仍然变化
      // t用来记录禁用事件后的值，从而手动指定__zoom
      const t = { k: 1, x: 0, y: 0 };
      this.$watch(
        "eventOption.visZoom",
        (newVal) => {
          if (newVal) {
            const __zoom = d3.zoomTransform(zoomDom.node());
            Object.assign(__zoom, t);
            zoomInstance
              .on("start", zoomStart)
              .on("zoom", zoomed)
              .on("end", zoomEnd);
          } else {
            zoomInstance.on("start", null).on("zoom", null).on("end", null);
            const __zoom = d3.zoomTransform(zoomDom.node());
            Object.assign(t, __zoom);
          }
        },
        { immediate: true }
      );
    },
    initBrush(svg, zoomDom) {
      const brushStart = ({ selection }) => {
        // console.log("brushstart");
        if (selection === null) return;
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
      const brushing = ({ selection: extent }) => {
        if (extent === null) return;
        console.log("brushing");
        const transform = d3.zoomTransform(zoomDom.node());
        let extentStart = transform.invert(extent[0]); // brush的开始坐标
        let extentEnd = transform.invert(extent[1]); // brush的结束坐标

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
      const brushEnd = ({ selection }) => {
        if (selection === null) return;
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
      const invertBrushEnd = ({ selection }) => {
        if (selection === null) return;
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
    initWorker() {
      if (!this.worker) {
        this.worker = new Worker();
        this.worker.addEventListener("message", (e) => {
          if (e.data === "tickEnd") {
            this.chartOption.simulation.run = false;
            return;
          }
          // console.log("worker-message", e);
          const { nodes } = e.data;
          nodes.forEach((d) => {
            // if ("fx" in d) console.log(d);
            if ("fx" in d) return;
            this.uidNodeMap[d.uid].x = d.x;
            this.uidNodeMap[d.uid].y = d.y;
          });
        });
        this.$watch(
          () => {
            return this.nodes.map((d) => d.uid);
          },
          () => {
            this.changeWorkerData();
          }
        );
      }
      this.worker.postMessage({
        init: {
          chartOption: this.chartOption,
          width: this.width,
          height: this.height,
          nodes: this.calcNodes(),
          links: this.calcLinks(),
        },
      });
    },
    calcNodes() {
      return this.nodes.map((d) => {
        const node = {
          uid: d.uid,
          x: d.x,
          y: d.y,
        };
        if ("fx" in d) node.fx = d.fx;
        if ("fy" in d) node.fy = d.fy;
        return node;
      });
    },
    calcLinks() {
      return this.links.map((d) => ({
        source: d.source.uid,
        target: d.target.uid,
      }));
    },
    // 替换所有数据
    changeWorkerData() {
      this.worker.postMessage({
        changeData: {
          nodes: this.calcNodes(),
          links: this.calcLinks(),
        },
      });
    },
    // 修改部分数据
    alterWorkerData(nodes = [], links = []) {
      this.worker.postMessage({
        alterData: {
          nodes: nodes,
          links: links,
        },
      });
    },
    changeWorkerOption() {
      this.worker.postMessage({
        changeOption: this.chartOption,
      });
    },
    fillColor(group) {
      return classificationPalette[group || 0];
    },
    test() {},
  },
  watch: {
    chartOption: {
      handler: function () {
        this.changeWorkerOption();
      },
      deep: true,
    },
  },
};
</script>
<style>
.ForceChart .text {
  pointer-events: none;
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
rect.zoom {
  pointer-events: all;
  opacity: 0;
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