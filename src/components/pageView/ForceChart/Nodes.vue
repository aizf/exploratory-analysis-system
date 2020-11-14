<template>
  <g class="nodes">
    <circle
      v-for="node in nodes"
      class="node"
      :class="{
        current: node.current,
        selected: node.selected,
        mouseover_show: node.mouseover_show,
        brushing: node.brushing,
        invertBrushing: node.invertBrushing,
      }"
      filter="url(#shadow)"
      :r="fixedNodeSize"
      :fill="fillColor(node.group)"
      @click="clickSelect(node)"
      @mouseover="mouseover(node)"
      @mouseout="mouseout(node)"
      :ref="node.uid"
      :key="node.uid"
    />
  </g>
</template>

<script>
import eventBus from "./eventBus.js";
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
    transform: Object,
  },
  data() {
    return {};
  },
  computed: {
    ...mapState({
      visualData: (state) => state.data.visualData,
      uidMaps: (state) => state.data.uidMaps,
      uidNodeMap: (state) => state.data.uidMaps.uidNodeMap,
    }),
    ...mapGetters(["nodesNumber", "beforeEvent"]),
    fixedNodeSize() {
      return this.chartOption.node.nodeSize;
      // return this.chartOption.node.nodeSize / this.transform.k;
    },
  },
  created() {},
  mounted() {
    console.log("ForceChart-Nodes", this);
    this.initDrag();
    eventBus.$on("board1-mouseover", this.mouseover);
    eventBus.$on("board1-mouseout", this.mouseout);
    this.$on("setPostion", this.setPostion);
  },
  methods: {
    clickSelect(d) {
      if (!this.eventOption.visClick) return;
      this.beforeEvent("click", this);
      if (d.selected) {
        d.selected = false;
      } else {
        d.selected = true;
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

      // nodesG和linksG
      [this.$el, this.$el.previousElementSibling].forEach((d) => {
        d.classList.add("mouseover");
      });
      this.beforeEvent("mouseover", this);
      const displayNodes = [...this.uidMaps.uidLinkedNodesMap[node.uid], node];
      displayNodes.forEach((d) => {
        d.mouseover_show = true;
        ``;
      });
      const displayLinks = this.uidMaps.uidLinksMap[node.uid];
      displayLinks.forEach((d) => {
        d.mouseover_show = true;
      });

      if (!this.isDraging) {
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
      [this.$el, this.$el.previousElementSibling].forEach((d) => {
        d.classList.remove("mouseover");
      });
      const displayNodes = [...this.uidMaps.uidLinkedNodesMap[node.uid], node];
      displayNodes.forEach((d) => {
        d.mouseover_show = false;
      });
      const displayLinks = this.uidMaps.uidLinksMap[node.uid];
      displayLinks.forEach((d) => {
        d.mouseover_show = false;
      });
    },
    initDrag() {
      let mousePoint = []; // 相对于原始坐标系
      const dragstart = ({ subject: d, x, y }) => {
        // console.log(this);
        if (!this.eventOption.visDrag) return;
        this.beforeEvent("drag", this);
        if (this.chartOption.simulation.run) {
          d.fx = d.x;
          d.fy = d.y;
        }
        mousePoint = [x, y];
      };
      const dragging = () => {
        const fn = ({ subject: d, x, y }) => {
          // dragging
          if (!this.eventOption.visDrag) return;
          if (
            // 如果mousePoint没变过，则没有发生drag,当this.isDraging==false时判断
            !this.isDraging &&
            (mousePoint[0] !== x || mousePoint[1] !== y)
          ) {
            this.isDraging = true;
          }
          d.x = x;
          d.y = y;
          d.fx = x;
          d.fy = y;
          const dom = this.$refs[d.uid][0];
          dom.setAttribute("cx", x);
          dom.setAttribute("cy", y);
          this.$emit("alterWorkerData", [d]);
          eventBus.$emit("dragging");
          console.log("dragging");
        };
        return throttle(fn, 16.67, { leading: true, trailing: false });
      };
      const dragend = ({ subject: d }) => {
        if (!this.eventOption.visDrag) return;
        delete d.fx;
        delete d.fy;
        this.$emit("alterWorkerData", [d]);
        if (this.isDraging) {
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
      };
      this.isDraging = false; // 区分click和drag等
      this.dragInstance = d3
        .drag()
        .on("start", dragstart)
        .on("drag", dragging())
        .on("end", dragend);
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

    fillColor(...args) {
      return this.$parent.fillColor.apply(this.$parent, args);
    },
    setPostion() {
      for (let node of this.nodes) {
        if ("fx" in node) continue;
        const { uid, x, y } = node;
        const dom = this.$refs[uid][0];
        dom.setAttribute("cx", x);
        dom.setAttribute("cy", y);
      }
    },
  },
  watch: {
    nodes: {
      handler() {
        console.log("nodes change");
      },
      deep: true,
    },
  },
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
  cursor: pointer;

  transition: fill 0.6s ease, fill-opacity 0.3s ease, stroke-opacity 0.3s ease;

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
  &.current {
    stroke: var(--primary);
    stroke-width: 15;
    stroke-opacity: 0.5;
  }
  &.emphasis {
    r: 30;
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