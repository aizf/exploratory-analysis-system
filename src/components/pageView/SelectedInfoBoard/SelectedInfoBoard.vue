<template>
  <div class="SelectedInfoBoard test-border" :style="{ height: height + 'px' }">
    <SelectedInfoBoard1 :items="selectedNodes" />
    <Pie :items="selectedNodes" />
    <MiniForce :nodes="selectedNodes" :width="300" :height="200" />
  </div>
</template>
<script>
// import Vue from "vue";
import { mapState, mapGetters } from "vuex";
import SelectedInfoBoard1 from "./SelectedInfoBoard1";
import Pie from "./Pie";
import MiniForce from "./MiniForce";
import echarts from "echarts";
// import * as _ from "lodash";
export default {
  name: "SelectedInfoBoard",
  inject: ["backgroundColor", "contrastColor", "classificationPalette"],
  components: {
    SelectedInfoBoard1,
    Pie,
    MiniForce,
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