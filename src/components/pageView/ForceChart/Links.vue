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