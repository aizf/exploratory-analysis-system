<template>
  <div class="con test-border">
    <svg class="svg" ref="svg">
      <g ref="g" font-family="Avenir" font-size="8px">
        <g class="links" fill="none" stroke-opacity="0.4" stroke-width="1.5">
          <path
            v-for="(link, i) in links"
            :d="genPath(link)"
            :stroke="pathColor(link)"
            :key="i"
          />
        </g>
        <g class="nodes" stroke-linejoin="round" stroke-width="3">
          <g
            v-for="(node, i) in nodes"
            :transform="`translate(${node.y - nodeSize[0] / 2},${
              node.x - nodeSize[1] / 2
            })`"
            :key="i"
          >
            <foreignObject :width="nodeSize[0]" :height="nodeSize[1]">
              <SubRecord
                xmlns="http://www.w3.org/1999/xhtml"
                :record="node.data"
                :words="node.data.words"
                :nodes="node.data.nodes"
                :links="node.data.links"
                :index="node.data.index"
                :style="{ background: backgroundColor }"
              />
            </foreignObject>
          </g>
        </g>
      </g>
    </svg>
  </div>
</template>
<script>
// import Vue from "vue";
import { RecycleScroller } from "vue-virtual-scroller";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";
import { mapState, mapGetters } from "vuex";
import * as d3 from "d3";
import SubRecord from "../SubRecord.vue";
// import data from "@/assets/tree.json";
// import * as _ from "lodash";
export default {
  name: "Tree",
  components: { SubRecord },
  inject: ["classificationPalette", "backgroundColor", "contrastColor"],
  props: {},
  data() {
    return {
      nodes: [],
      links: [],
      nodeSize: [350, 277],
    };
  },
  computed: {},
  mounted() {
    const svg = this.$refs.svg;
    const width = svg.clientWidth;
    const height = svg.clientHeight;

    d3.select(svg)
      .call(
        d3
          .zoom()
          .extent([
            [0, 0],
            [width, height],
          ])
          .on("zoom", zoomed)
      )
      .on("dblclick.zoom", null);

    function zoomed({ transform }) {
      g.attr("transform", transform);
    }

    const tree = (data) => {
      const root = d3.hierarchy(data);
      root.dx = 10;
      root.dy = width / (root.height + 1);
      return d3
        .tree()
        .nodeSize([this.nodeSize[0] * 1.5, this.nodeSize[1] * 1.5])(root);
    };

    // console.log(this.$parent);
    const data = this.$parent.$parent.refs.Record.root;
    const root = tree(data);
    console.log("tree", root);

    let x0 = Infinity;
    let x1 = -x0;
    root.each((d) => {
      if (d.x > x1) x1 = d.x;
      if (d.x < x0) x0 = d.x;
    });

    const g = d3
      .select(this.$refs.g)
      .attr("transform", `translate(${root.dy / 3},${root.dx - x0})`);

    this.links = root.links();
    this.nodes = root.descendants();
    // this.update();
  },
  methods: {
    genPath(d) {
      return d3
        .linkHorizontal()
        .x((d) => d.y)
        .y((d) => d.x)
        .call(null, d);
    },
    pathColor(link) {
      const { source, target } = link;
      const n1 = source.data.nodes.length;
      const n2 = target.data.nodes.length;
      if (n1 === n2) return this.contrastColor;
      else if (n1 > n2) return "#37b24d";
      else return "#f03e3e";
    },
  },
};
</script>
<style>
.selected {
  stroke: red;
}
</style>
<style lang="scss" scoped>
.con {
  width: 1200px;
  height: 800px;
  pointer-events: all;
  display: flex;
  justify-content: center;
  align-items: center;
}
.svg {
  width: 100%;
  height: 100%;
  pointer-events: all;
  user-select: none;
}
.draw {
  height: 50%;
  border-bottom: 1px solid skyblue;
}
.select {
  height: 50%;
  display: flex;
  flex-wrap: wrap;
}
.sub-select {
  height: 50%;
  width: 33%;
}
</style>