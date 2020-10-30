<template>
  <div class="SelectedInfoBoard">
    <SelectedInfoBoard1 :items="selectedNodes" />
    <SelectedInfoBoard2 :items="selectedNodes" />
    <MiniForce :nodes="selectedNodes" :width="300" :height="400" />
  </div>
</template>
<script>
// import Vue from "vue";
import { mapState, mapGetters } from "vuex";
import SelectedInfoBoard1 from "./SelectedInfoBoard1";
import SelectedInfoBoard2 from "./SelectedInfoBoard2";
import MiniForce from "./MiniForce";
import echarts from "echarts";
// import * as _ from "lodash";
export default {
  name: "SelectedInfoBoard",
  inject: ["backgroundColor", "contrastColor", "classificationPalette"],
  components: {
    SelectedInfoBoard1,
    SelectedInfoBoard2,
    MiniForce,
  },
  props: {},
  data() {
    return {};
  },
  computed: {
    ...mapState({
      nodeFields: (state) => state.data.nodeFields,
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
  height: 800px;
  display: flex;
  flex-wrap: wrap;
}
.SelectedInfoBoard > * {
  flex: 0 0 auto;
}
</style>