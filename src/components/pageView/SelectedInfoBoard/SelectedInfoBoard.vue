<template>
  <div class="SelectedInfoBoard test-border" :style="{ height: height + 'px' }">
    <Scatter :items="selectedNodes" />
    <Pie :items="selectedNodes" />
    <MiniForce1 :items="selectedNodes" :width="300" :height="200" />
  </div>
</template>
<script>
// import Vue from "vue";
import { mapState, mapGetters } from "vuex";
import Scatter from "./Scatter";
import Pie from "./Pie";
import MiniForce1 from "./MiniForce1";
import echarts from "echarts";
// import * as _ from "lodash";
export default {
  name: "SelectedInfoBoard",
  inject: ["backgroundColor", "contrastColor", "classificationPalette"],
  components: {
    Scatter,
    Pie,
    MiniForce1,
  },
  props: {},
  data() {
    return {};
  },
  computed: {
    ...mapState({
      nodeFields: (state) => state.data.nodeFields,
      height: (state) => state.view.dpiY * 0.55,
    }),
    ...mapGetters(["nodes", "links", "nodesNumber"]),
    selectedNodes() {
      const nodes = this.nodes.filter((d) => d.selected);
      return nodes;
    },
    selectedLinks() {
      const nodes = this.nodes.filter((d) => d.selected);
      return nodes;
    },
  },
  mounted() {
    console.log("SelectedInfoBoard", this);
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
.SelectedInfoBoard {
  width: 600px;
  display: flex;
  flex-wrap: wrap;
}
.SelectedInfoBoard > * {
  flex: 0 0 auto;
}
</style>