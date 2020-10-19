<template>
  <g class="nodes">
    <circle
      v-for="node in nodes"
      :class="{
        node: true,
        display: true,
        selected: node.selected,
        mouseover_opacity: !node.mouseover_show,
        brushing: node.brushing,
        invertBrushing: node.invertBrushing,
      }"
      filter="url(#shadow)"
      @click="clickSelect(node)"
      @mouseover="mouseover(node)"
      @mouseout="mouseout"
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
export default {
  name: "Nodes",
  props: {
    nodes: Array,
    links: Array,
  },
  data() {
    return {
      linkWidth: 8,
    };
  },
  computed: {
    ...mapState({
      visualData: (state) => state.data.visualData,

      operationTypes: (state) => state.view.operationTypes,

      recordset: (state) => state.analyze.recordset,
    }),
  },
  created() {
    // this.classificationPalette2 = classificationPalette2;
  },
  mounted() {
    console.log("ForceChart-Nodes", this);
  },
  activated() {},
  methods: {},
};
</script>
<style lang="scss" scope>
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
  &.mouseover_opacity {
    fill-opacity: 0.2;
    stroke-opacity: 0.2;
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