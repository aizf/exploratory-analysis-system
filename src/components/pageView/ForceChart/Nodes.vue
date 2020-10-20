<template>
  <g class="nodes">
    <circle
      v-for="node in nodes"
      :class="{
        node: true,
        selected: node.selected,
        mouseover_show: node.mouseover_show,
        brushing: node.brushing,
        invertBrushing: node.invertBrushing,
      }"
      filter="url(#shadow)"
      @click="clickSelect(node)"
      @mouseover="mouseover(node)"
      @mouseout="mouseout(node)"
      :style="{
        r: fixedNodeSize,
        cx: node.x,
        cy: node.y,
        fill: fillColor(node.group),
      }"
      :key="node.uid"
    />
  </g>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import * as d3 from "d3";
import throttle from "lodash/throttle";
export default {
  name: "Nodes",
  props: {
    nodes: Array,
    links: Array,
    eventOption: Object,
    chartOption: Object,
  },
  data() {
    return {
      isDraging: false, // 区分click和drag等
      mousePoint: [], // 相对于原始坐标系
    };
  },
  computed: {
    ...mapState({
      visualData: (state) => state.data.visualData,
      idMaps: (state) => state.data.idMaps,
    }),
    ...mapGetters(["nodesNumber", "beforeEvent"]),
    fixedNodeSize() {
      return this.chartOption.node.nodeSize / this.$parent.transform.k;
    },
  },
  created() {
    this.dragInstance = d3
      .drag()
      .on("start", this.dragstarted)
      .on("drag", this.dragged())
      .on("end", this.dragended);
  },
  mounted() {
    console.log("ForceChart-Nodes", this);
    this.$watch(
      () => {
        return this.nodes.map((d) => d.uid);
      },
      () => {
        this.$nextTick(() => {
          const node = d3.select(this.$el).selectAll("circle");
          node.data(this.nodes).call(this.dragInstance);
        });
      },
      { immediate: true }
    );
  },
  activated() {},
  methods: {
    clickSelect(d) {
      if (!this.eventOption.visClick) return;
      this.beforeEvent("click", this);
      if (d.selected) {
        d.selected = false;
      } else {
        d.selected = true;
        d.attentionTimes += 1;
        let operation = {
          action: "click",
          nodes: [d],
        };
        this.$store.dispatch("addOperation", operation);
        console.log("click");
      }
    },
    mouseover(node) {
      if (!this.eventOption.visMouseover || this.isDraging) return;
      [
        this.$el,
        this.$el.previousElementSibling,
        this.$el.nextElementSibling,
      ].forEach((d) => {
        d.classList.add("mouseover");
      });
      this.beforeEvent("mouseover", this);
      const displayNodes = [...this.idMaps.idLinkedNodesMap[node.id], node];
      displayNodes.forEach((d) => {
        d.mouseover_show = true;
        ``;
      });
      const displayLinks = this.idMaps.idLinksMap[node.id];
      displayLinks.forEach((d) => {
        d.mouseover_show = true;
      });

      if (!this.isDraging) {
        displayNodes.forEach((d) => {
          d.attentionTimes += 1;
        });
        let operation = {
          action: "mouseover",
          nodes: displayNodes,
        };
        this.$store.dispatch("addOperation", operation);
        console.log("mouseover");
      }
    },
    mouseout(node) {
      if (!this.eventOption.visMouseover || this.isDraging) return;
      [
        this.$el,
        this.$el.previousElementSibling,
        this.$el.nextElementSibling,
      ].forEach((d) => {
        d.classList.remove("mouseover");
      });
      const displayNodes = [...this.idMaps.idLinkedNodesMap[node.id], node];
      displayNodes.forEach((d) => {
        d.mouseover_show = false;
      });
      const displayLinks = this.idMaps.idLinksMap[node.id];
      displayLinks.forEach((d) => {
        d.mouseover_show = false;
      });
    },
    dragstarted(d) {
      // console.log(this);
      if (!this.eventOption.visDrag) return;
      this.beforeEvent("drag", this);
      if (this.chartOption.simulation.run) {
        d.fx = d.x;
        d.fy = d.y;
      }
      this.mousePoint = [d3.event.x, d3.event.y];
    },
    dragging(d) {
      // dragging
      if (!this.eventOption.visDrag) return;
      if (this.chartOption.simulation.run) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
      } else {
        d.x = d3.event.x;
        d.y = d3.event.y;
      }
      // console.log([d3.event.x, d3.event.y]);
      if (
        // 如果mousePoint没变过，则没有发生drag,当this.isDraging==false时判断
        !this.isDraging &&
        (this.mousePoint[0] !== d3.event.x || this.mousePoint[1] !== d3.event.y)
      ) {
        // console.log("computing !!");
        this.isDraging = true;
      }
    },
    // 节流dragging，防止运算阻塞dom渲染
    dragged() {
      return throttle(this.dragging, 16, { leading: true, trailing: false });
    },
    dragended(d) {
      if (!this.eventOption.visDrag) return;
      // if (!d3.event.active) this.simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
      if (this.isDraging) {
        d.attentionTimes += 1;
        // drag <text>时，通过以下返回node
        let operation = {
          action: "drag",
          nodes: [d],
        };
        this.$store.dispatch("addOperation", operation);
        this.isDraging = false;
        console.log("drag");
        // t.dispatch("mouseout");
      }
    },
    fillColor(...args) {
      return this.$parent.fillColor.apply(this.$parent, args);
    },
  },
  watch: {},
};
</script>
<style lang="scss" scope>
.nodes.mouseover {
  fill-opacity: 0.2;
  stroke-opacity: 0.2;
}
.node {
  pointer-events: all;
  stroke: transparent;

  transition: fill 0.6s ease, fill-opacity 0.3s ease, stroke-opacity 0.3s ease;
  /* cx 0.016s linear, cy 0.016s linear; */

  &.selected {
    /* fill: red; */
    stroke: red;
    stroke-width: 0.8;
  }
  &.brushing {
    animation: stroke-blink 1s ease 0s infinite;
  }
  &.invertBrushing {
    animation: stroke-blink 1s ease 0s infinite;
  }
  &.mouseover_show {
    fill-opacity: 1;
    stroke-opacity: 1;
  }
}

@keyframes stroke-blink {
  0% {
    stroke: transparent;
    stroke-width: 0;
  }
  50% {
    stroke: red;
    stroke-width: 1.8;
  }
  100% {
    stroke: transparent;
    stroke-width: 0;
  }
}
</style>