<template>
<div class="RecordDrawer">
  <a-card title="Card Title" class="record">
    <a-card-grid v-for="(item, index) in savedViewData" :key="index">
      <svg :width="width"
        :height="height"
        v-html="formatViewDom(item.dom)"
        :style="{background:backgroundColor}">
    </svg>
    </a-card-grid>
  </a-card>
  </div>
</template>
<script>
import * as d3 from "d3";

export default {
  name: "RecordDrawer",
  data() {
    return {
      width:606,
      height:352
    };
  },
  computed: {
        backgroundColor() {
      return this.$store.state.backgroundColor;
    },
    savedViewData() {
      return this.$store.getters.savedViewData;
    }
  },
  methods: {
    formatViewDom(dom) {
      let vis=d3.selectAll(dom);
      let transform=d3.zoomTransform(dom);
      vis.attr("transform", transform.scale(606/960));
      console.log(dom);
      console.log(vis);
      return vis.node().outerHTML;
    },
    test() {
      console.log("c");
    }
  }
};
</script>
<style>
.record .ant-card-grid {
  width: 100%;
  height: 400px;
}
.RecordDrawer line {
  stroke: #aaa;
  stroke-opacity: 0.8;
  stroke-width: 0.3;
}

.RecordDrawer circle {
  pointer-events: all;
  stroke: none;
  /*描边*/
  /* fill-opacity: 0.85; */
  /* filter:drop-shadow(-25px 25px 25px rgba(0, 243, 53, 0.7)); */
}

.RecordDrawer circle.selected {
  /* fill: red; */
  stroke: red;
  stroke-width: 1.5;
}
</style>
<style>
</style>