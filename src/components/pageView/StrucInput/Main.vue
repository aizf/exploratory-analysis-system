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
        :class="{ selected: node.selected }"
        :cx="node.x"
        :cy="node.y"
        :r="5"
        :ref="'node' + node.strucID"
        :key="node.strucID"
        @mouseover="clickSelect(node)"
      />
    </g>
  </svg>
</template>
<script>
import Vue from "vue";
import { mapState, mapGetters } from "vuex";
// import sub0 from "@/assets/0.json";
// import * as _ from "lodash";
import store from "@/store/";
import * as d3 from "d3";
import { dataDeepClone } from "@/utils/methods.js";
export default {
  name: "StrucInputMain",
  components: {},
  inject: ["classificationPalette"],
  props: {},
  data() {
    return {
      // nodes: [],
      // links: [],
      dragging: false,
      nodesData: new WeakMap(),
    };
  },
  computed: {
    ...mapState({
      nodes: (state) => state.strucInput.nodes,
      links: (state) => state.strucInput.links,
      isUpdate: (state) => state.strucInput.isUpdate,
    }),
  },
  mounted() {
    console.log("StrucInputMain", this);
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
      // if (this.nodes.length === 0) return;
      // console.log("do update");
      const simulation = this.simulation;
      simulation.alphaTarget(0);
      simulation.nodes(this.nodes);
      simulation.force(
        "link",
        d3.forceLink(this.links).id((d) => d.strucID)
      );

      if (!this.dragging) {
        simulation.alphaTarget(0.3).restart();
        setTimeout(() => {
          simulation.alphaTarget(0);
        }, 800);
      }
      // console.log(svg);

      // let link = this.linkG.selectAll("line");
      // link = link.data(this.links).join("line");

      function ticked() {}

      const drag = (simulation) => {
        // let mousedowning = false;
        let link;
        let newNodes;
        const that = this;
        function dragstarted(event) {
          if (!event.active) simulation.stop();
          that.dragging = true;
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

          link = { source: source, target: newNodes };
          // console.log([...this.nodes, newNodes]);
          // console.log([...this.links, link]);
          store.commit("updateG", {
            nodes: [...that.nodes, newNodes],
            links: [...that.links, link],
          });
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
          this.dragging = false;
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
            const nodes = this.nodes.filter((d) => d != newNodes);
            store.commit("updateG", {
              nodes,
              links: this.links,
            });
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
      store.commit("updateGDone");
      Vue.nextTick(() => {
        for (let i = 0; i < this.nodes.length; i++) {
          // console.log(this.$refs["node" + i], nodes[i - count]);
          const nodes = [...this.nodes].sort((a, b) => a.strucID - b.strucID);
          this.nodesData.set(this.$refs["node" + i][0], nodes[i]);
        }
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
      // console.log(1,_nodes, _links);
      const { nodes, links } = dataDeepClone(
        { nodes: _nodes, links: _links },
        "id",
        "strucID"
      );
      nodes.forEach((d, i) => {
        d.strucID = count + i;
      });
      nodes.forEach((d) => {
        this.$set(d, "x", d.x);
        this.$set(d, "y", d.y);
      });
      // console.log(2,nodes, links);

      // this.nodes.push(...nodes);
      // this.links.push(...links);
      store.commit("updateG", {
        nodes: [...this.nodes, ...nodes],
        links: [...this.links, ...links],
      });
    },
    clickSelect(node) {
      this.nodes.forEach((d) => (d.selected = false));
      node.selected = true;
    },
    getG() {
      return {
        nodes: [...this.nodes],
        links: [...this.links],
      };
    },
    init() {},
  },
  watch: {
    isUpdate: {
      handler(newVal) {
        if (newVal) {
          console.log("update");
          this.update();
        }
      },
    },
  },
};
</script>
<style lang="scss" scoped>
.svg {
  width: 100%;
  height: 100%;
}
</style>