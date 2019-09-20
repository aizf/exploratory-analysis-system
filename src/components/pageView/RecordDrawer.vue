<template>
  <div class="RecordDrawer">
    <a-card title="Card Title" class="record">
      <a-card-grid
        v-for="(item, index) in savedViewData"
        :key="index"
        @click="rollback(item.data,item.dom,item.selectedIds)"
      >
        <svg
          :width="width"
          :height="height"
          v-html="formatViewDom(item.dom)"
          :style="{background:backgroundColor}"
        />
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
      width: 634,
      height: 380
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
      let vis = d3.select(dom);
      let transform = d3.zoomTransform(dom);
      vis.attr("transform", transform.scale(this.height / 600));
      // console.log(dom);
      // console.log(vis);
      return vis.node().outerHTML;
    },
    rollback(data, dom, selectedIds) {
      console.log(selectedIds);
      data.nodes.forEach(node => {
        console.log("before", node);
        // data未重新分组，手动更新index
        selectedIds.includes(node.id || node.name)
          ? (node.selected = true)
          : (node.selected = false);
        console.log(data.nodes);
        // console.log(selectedIndexs.includes(node.index));
        // console.log(selectedIndexs);
        console.log("after", node);
        // debugger
      });
      console.log(data.nodes);
      this.$store.commit("updateVisualData", data);
      this.$store.commit("updateViewUpdate", "all");
      this.$store.commit("addOperation", {
        action: "rollback",
        nodes: data,
        time: new Date()
      });
      console.log("rollback", data);
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
  padding: 10px 10px 10px 10px;
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