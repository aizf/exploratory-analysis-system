<template>
  <svg :width="width" :height="height" :style="{ background: backgroundColor }">
    <defs>
      <filter id="shadow">
        <feDropShadow dx="0" dy="0" stdDeviation="0.3" />
      </filter>
    </defs>
    <g class="vis">
      <g class="links">
        <line
          class="link"
          v-for="link in selectedLinks"
          :x1="link.source.x"
          :y1="link.source.y"
          :x2="link.target.x"
          :y2="link.target.y"
          :key="link.uid"
        />
      </g>
      <g class="nodes">
        <circle
          v-for="node in nodes"
          class="node"
          :r="4.5"
          :fill="classificationPalette[node.group || 0]"
          filter="url(#shadow)"
          :cx="node.x"
          :cy="node.y"
          :key="node.uid"
        />
      </g>
    </g>
  </svg>
</template>
<script>
import { mapState, mapGetters } from "vuex";
import * as d3 from "d3";
import { layoutRange } from "@/utils/methods";
// import * as _ from "lodash";
export default {
  name: "MiniForce",
  inject: ["backgroundColor", "contrastColor", "classificationPalette"],
  props: {
    nodes: Array,
    width: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {};
  },
  computed: {
    ...mapState({
      nodeFields: (state) => state.data.nodeFields,
      uidLinksMap: (state) => state.data.uidMaps.uidLinksMap,
    }),
    ...mapGetters(["links"]),
    selectedLinks() {
      return this.links.filter(
        (link) => link.source.selected && link.target.selected
      );
    },
  },
  created() {},
  mounted() {
    const svg = d3
      .select(this.$el)
      .attr("viewBox", [0, 0, this.width, this.height]);

    this.vis = svg.select("g");

    const zoomed = ({ transform }) => {
      this.vis.attr("transform", transform);
    };
    svg.call(d3.zoom().on("zoom", zoomed)).on("dblclick.zoom", null);

    this.linkG = this.vis.select("g.links");
    this.nodeG = this.vis.select("g.nodes");
  },

  activated() {},

  deactivated() {},

  methods: {},
  watch: {},
};
</script>
<style lang="scss" scope>
.MiniForce {
  background: var(--backgroundColor);
}

.node {
  pointer-events: all;
  stroke: transparent;
  &.current {
    stroke: var(--primary);
    stroke-width: 15;
    stroke-opacity: 0.5;
  }
}
.links {
  stroke-width: 0.3;
  stroke: var(--contrastColor);
  stroke-opacity: 0.8;
}
</style>