<template>
  <svg class="svg" ref="svg">
    <g class="links" stroke="#999">
      <line
        v-for="link in links"
        :x1="link.source.x"
        :y1="link.source.y"
        :x2="link.target.x"
        :y2="link.target.y"
        :style="{}"
        :key="link.index"
        :ref="'link' + link.index"
      />
    </g>
    <g class="nodes" fill="#1c7ed6">
      <circle
        v-for="node in nodes"
        class="node"
        :cx="node.x"
        :cy="node.y"
        :r="5"
        :ref="'node' + node.strucID"
        :key="node.strucID"
        @mouseover="clickSelect($event)"
      />
    </g>
  </svg>
</template>
<script>
import Vue from "vue";
// import { mapState, mapGetters } from "vuex";
// import sub0 from "@/assets/0.json";
// import sub1 from "@/assets/1.json";
// import sub2 from "@/assets/2.json";
// import sub3 from "@/assets/3.json";
// import sub4 from "@/assets/4.json";
// import sub5 from "@/assets/5.json";
// import * as _ from "lodash";
import * as d3 from "d3";
import { dataDeepClone } from "@/utils/methods.js";
export default {
  name: "StrucInputMain",
  components: {},
  inject: ["classificationPalette"],
  props: {},
  data() {
    return {
      nodes: [],
      links: [],
      nodesData: new WeakMap(),
    };
  },
  computed: {},
  mounted() {
    // console.log("StrucInputMain", this);
    const svg = d3.select(this.$refs.svg);
    const width = this.$el.clientWidth;
    const height = this.$el.clientHeight;
    this.linkG = svg.select(".links");
    this.nodeG = svg.select(".nodes");
    this.$on("add", this.add);
    this.simulation = d3
      .forceSimulation(this.nodes)
      .force("charge", d3.forceManyBody().strength(-100))
      .force(
        "link",
        d3.forceLink(this.links).id((d) => d.strucID)
      )
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("x", d3.forceX())
      .force("y", d3.forceY())
      // .on("tick", ticked)
      .restart();
  },
  methods: {
    update() {
      // this.nodeG.selectAll("circle").data(this.nodes);
      // this.linkG.selectAll("line").data(this.links);
      const simulation = this.simulation;
      simulation.alphaTarget(0.3).restart();
      setTimeout(() => {
        simulation.alphaTarget(0);
      }, 300);
      // console.log(svg);

      // let link = this.linkG.selectAll("line");
      // link = link.data(this.links).join("line");

      function ticked() {}

      simulation.nodes(this.nodes);

      const drag = (simulation) => {
        // let mousedowning = false;
        let link;
        let newNodes;
        const that = this;
        function dragstarted(event) {
          // TODO BUG source 节点没有跟随拖动，从而直接drag end
          if (!event.active) simulation.stop();
          // event.subject.fx = event.subject.x;
          // event.subject.fy = event.subject.y;
          const source = that.nodesData.get(this);
          // console.log("source", source);
          const strucID = that.nodes.length;
          newNodes = Vue.observable({
            strucID: strucID,
            x: event.x,
            y: event.y,
          });

          // simulation.nodes(this.nodes);
          // console.log(this, source, newNodes);

          that.nodes.push(newNodes);
          link = { source: source, target: newNodes };
          that.links.push(link);
        }

        function dragged(event) {
          // console.log(event.subject.x, event.subject.y);
          // console.log(event);
          newNodes.x = event.x;
          newNodes.y = event.y;
          newNodes.fx = event.x;
          newNodes.fy = event.y;
        }

        const dragended = (event) => {
          // console.log("dragend", event);
          // if (!event.active) simulation.alphaTarget(0);
          delete newNodes.fx;
          delete newNodes.fy;
          mouseup(event.x, event.y);
          this.update();
        };
        const mouseup = (x, y) => {
          const res = find(x, y, 5);
          if (res) {
            const link = this.links[this.links.length - 1];
            link.target = res;
            this.nodes = this.nodes.filter((d) => d != newNodes);
          } else {
            that.$nextTick(() => {
              // console.log("nextTick", that.$refs);
              // console.log("nextTick", that.$refs["node" + strucID]);
              that.nodesData.set(
                that.$refs["node" + newNodes.strucID][0],
                newNodes
              );
            });
          }
          // console.log(res);
        };
        const find = (x, y, radius) => {
          const nodes = this.nodes.filter((d) => d != newNodes);
          var i = 0,
            n = nodes.length,
            dx,
            dy,
            d2,
            node,
            closest;

          if (radius == null) radius = Infinity;
          else radius *= radius;

          for (i = 0; i < n; ++i) {
            node = nodes[i];
            dx = x - node.x;
            dy = y - node.y;
            d2 = dx * dx + dy * dy;
            if (d2 < radius) (closest = node), (radius = d2);
          }

          return closest;
        };
        return d3
          .drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended);
      };
      Vue.nextTick(() => {
        let node = this.nodeG.selectAll("circle");
        node.call(drag(simulation));
        node.on("click", function (event) {
          if (event.defaultPrevented) return;
          // console.log(this);
          // this.classList.contains("selected")
          //   ? this.classList.remove("selected")
          //   : this.classList.add("selected");
        });

        // node.on("mouseover", function (e) {
        //   // console.log(e.currentTarget);
        //   d3.select(e.currentTarget).attr("r", 8);
        // });
        // node.on("mouseout", function (e) {
        //   d3.select(e.currentTarget).attr("r", 5);
        // });
        // node.on("mousedown", function (e) {
        //   console.log(e.currentTarget);
        //   d3.select(e.currentTarget).attr("r", 8);
        // });
        // node.on("mouseup", function (e) {
        //   d3.select(e.currentTarget).attr("r", 5);
        // });
        // console.log("main", node);
      });
    },
    add(_nodes, _links) {
      const count = this.nodes.length;
      _nodes.forEach((d, i) => {
        d.strucID = count + i;
      });
      const { nodes, links } = dataDeepClone({ nodes: _nodes, links: _links });
      // console.log(nodes, links);
      nodes.forEach((d, i) => {
        this.$set(d, "x", d.x);
        this.$set(d, "y", d.y);
      });
      this.nodes.push(...nodes);
      this.links.push(...links);
      this.update();
      Vue.nextTick(() => {
        for (let i = count; i < this.nodes.length; i++) {
          // console.log(this.$refs["node" + i], nodes[i - count]);
          this.nodesData.set(this.$refs["node" + i][0], nodes[i - count]);
        }
      });
    },
    clickSelect(e) {
      console.log(e);
      const classList = e.currentTarget.classList;
      classList.contains("selected")
        ? classList.remove("selected")
        : classList.add("selected");
    },
    init() {},
  },
};
</script>
<style lang="scss" scoped>
.svg {
  width: 100%;
  height: 100%;
}
</style>