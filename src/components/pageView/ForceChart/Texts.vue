<template>
  <g class="texts" v-show="visShowIds">
    <text
      v-for="node in nodes"
      :class="{ text: true, mouseover_opacity: !node.mouseover_show }"
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
  methods:{
    fillColor(...args){
      return this.$parent.fillColor.apply(this.$parent,args)
    }
  }
};
</script>
<style lang="scss" scope>
.text {
  font-size: 10px;
  text-anchor: middle;
  &.mouseover_opacity {
    fill-opacity: 0;
  }
}
</style>