<template>
  <g class="texts" v-if="visShowIds">
    <text
      v-for="node in nodes"
      :class="{ text: true, mouseover_show: node.mouseover_show }"
      :x="node.x"
      :y="node.y"
      dy="-0.8em"
      :style="{ fill: fillColor(node.group) }"
      :key="node.uid"
    >
      {{ node.id }}
    </text>
  </g>
</template>

<script>
export default {
  name: "Texts",
  props: {
    visShowIds: Boolean,
    nodes: Array,
  },
  methods: {
    fillColor(...args) {
      return this.$parent.fillColor.apply(this.$parent, args);
    },
  },
};
</script>
<style lang="scss" scope>
.texts {
  &.mouseover {
    fill-opacity: 0;
  }
}
.text {
  font-size: 10px;
  text-anchor: middle;
  &.mouseover_show {
    fill-opacity: 1;
  }
}
</style>