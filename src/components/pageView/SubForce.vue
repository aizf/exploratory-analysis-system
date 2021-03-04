<template>
  <div>
    <svg class="con">
      <g>
        <g class="links" stroke="#999"></g>
        <g class="nodes" fill="#1c7ed6"></g>
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
// import * as _ from "lodash";
export default {
  name: "SubForce",
  components: {},
  inject: ["classificationPalette"],
  props: {
    nodes: Array,
    links: Array,
  },
  data() {
    return {};
  },
  computed: {},
  mounted() {
    this.update();
    // this.$watch(
    //   "nodes",
    //   (newVal) => {
    //     this.update();
    //   },
    //   { immediate: true }
    // );
    // this.$watch(
    //   "links",
    //   (newVal) => {
    //     this.update();
    //   },
    //   { immediate: true }
    // );
  },
  methods: {
    update() {
      const svg = d3.select(this.$el).select("svg");
      // console.log(svg);

      let link = svg.select(".links").selectAll("line");
      link = link.data(this.links).join("line");

      let node = svg.select(".nodes").selectAll("circle");
      node = node.data(this.nodes).join("circle").attr("r", 5);

      function ticked() {
        // console.log("sub-tick", node);
        node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

        link
          .attr("x1", (d) => d.source.x)
          .attr("y1", (d) => d.source.y)
          .attr("x2", (d) => d.target.x)
          .attr("y2", (d) => d.target.y);
      }
      const width = this.$el.clientWidth;
      const height = this.$el.clientHeight;
      const simulation = d3
        .forceSimulation(this.nodes)
        .force("charge", d3.forceManyBody().strength(-100))
        .force("link", d3.forceLink(this.links))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .on("tick", ticked)
        .restart();
      const drag = (simulation) => {
        function dragstarted(event) {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          event.subject.fx = event.subject.x;
          event.subject.fy = event.subject.y;
        }

        function dragged(event) {
          event.subject.fx = event.x;
          event.subject.fy = event.y;
        }

        function dragended(event) {
          if (!event.active) simulation.alphaTarget(0);
          event.subject.fx = null;
          event.subject.fy = null;
        }

        return d3
          .drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended);
      };
      node.call(drag(simulation));
      node.on("click", function () {
        // console.log(this);
        this.classList.contains("selected")
          ? this.classList.remove("selected")
          : this.classList.add("selected");
      });
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
  width: 100%;
  height: 100%;
  pointer-events: all;
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