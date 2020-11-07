<template>
  <g class="links">
    <line
      v-for="link in links"
      :class="{ link: true, mouseover_show: link.mouseover_show }"
      :style="{
        stroke: chartOption.link.color,
        'stroke-width': fixedLinkWidth,
      }"
      :key="link.uid"
      :ref="link.uid"
    />
  </g>
</template>

<script>
import eventBus from "./eventBus.js";
export default {
  name: "Links",
  props: {
    links: Array,
    chartOption: Object,
  },
  data() {
    return {
      isDraging: false, // 区分click和drag等
      mousePoint: [], // 相对于原始坐标系
    };
  },
  computed: {
    fixedLinkWidth() {
      return this.chartOption.link.width / this.$parent.transform.k;
    },
  },
  created() {},
  mounted() {
    console.log("ForceChart-Links", this);
    this.$on("setPostion", this.setPostion);
    eventBus.$on("dragging", this.setPostion);
  },
  activated() {},
  methods: {
    fillColor(...args) {
      return this.$parent.fillColor.apply(this.$parent, args);
    },
    setPostion() {
      // console.log("setPostion");
      for (let link of this.links) {
        const { x: x1, y: y1 } = link.source;
        const { x: x2, y: y2 } = link.target;
        const dom = this.$refs[link.uid][0];
        dom.setAttribute("x1", x1);
        dom.setAttribute("y1", y1);
        dom.setAttribute("x2", x2);
        dom.setAttribute("y2", y2);
      }
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