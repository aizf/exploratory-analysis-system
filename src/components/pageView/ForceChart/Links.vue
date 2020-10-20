<template>
  <g class="links">
    <line
      v-for="link in links"
      :class="{ link: true, mouseover_show: link.mouseover_show }"
      :x1="link.source.x"
      :y1="link.source.y"
      :x2="link.target.x"
      :y2="link.target.y"
      :style="{
        stroke: chartOption.link.color,
        'stroke-width': fixedLinkWidth,
      }"
      :key="link.uid"
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
    ...mapGetters(["nodesNumber"]),
    fixedLinkWidth() {
      return this.chartOption.link.width / this.$parent.transform.k;
    },
  },
  created() {},
  mounted() {
    console.log("ForceChart-Links", this);
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
    fillColor(...args) {
      return this.$parent.fillColor.apply(this.$parent, args);
    },
  },
  watch: {},
};
</script>
<style lang="scss" scope>
.links {
  stroke-opacity: 0.8;
  &.mouseover {
    stroke-opacity: 0;
  }
}
.link {
  transition: stroke 0.6s ease, stroke-width 0.3s ease, stroke-opacity 0.3s ease;
  &.mouseover_show {
    stroke-opacity: 0.8;
  }
}
</style>