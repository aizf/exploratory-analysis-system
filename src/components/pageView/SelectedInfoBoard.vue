<template>
  <div class="SelectedInfoBoard">
    <SelectedInfoBoard1 />
    <SelectedInfoBoard2 />
  </div>
</template>
<script>
// import Vue from "vue";
import { mapState, mapGetters } from "vuex";
import SelectedInfoBoard1 from "./SelectedInfoBoard1";
import SelectedInfoBoard2 from "./SelectedInfoBoard2";
import echarts from "echarts";
// import * as _ from "lodash";
export default {
  name: "SelectedInfoBoard",
  inject: ["backgroundColor", "contrastColor", "classificationPalette"],
  components: {
    SelectedInfoBoard1,
    SelectedInfoBoard2
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
    items() {
      const mouseoverNodes = this.nodes.filter((d) => d.mouseover_show);
      return mouseoverNodes.length ? mouseoverNodes : this.nodes;
    },
  },
  mounted() {
    console.log("SelectedInfoBoard", this);
  },
  methods: {
    clickSelect(node) {
      node.selected = !node.selected;
    },
  },
};
</script>
<style lang="scss" scoped>
.SelectedInfoBoard {
  width: 600px;
  height: 800px;
}
</style>