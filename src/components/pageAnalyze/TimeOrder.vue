<template>
  <div class="operations"></div>
</template>

<script>
import * as d3 from "d3";
import echarts from "echarts";

export default {
  name: "TimeOrder",
  data() {
    return {
      chart: {},
      view: {},
      view_: {}
    };
  },
  computed: {
    width() {
      return this.$store.state.dpiX * 0.7;
    },
    height() {
      return (this.$store.state.dpiY - 64) * 0.35;
    },
    visualData() {
      return this.$store.state.visualData;
    },
    nodes() {
      return this.$store.getters.nodes;
    },
    links() {
      return this.$store.getters.links;
    },
    backgroundColor() {
      return this.$store.state.backgroundColor;
    },
    colorPalette() {
      return this.$store.state.colorPalette;
    },
    operations() {
      return this.$store.state.operations;
    },
    operations_() {
      return this.$store.state.operations_;
    }
  },
  mounted() {

      // container: document.getElementsByClassName("operations")[0],

          // value: `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`

  },
  activated() {
    this.view.changeData(this.operations);
    this.view_.changeData(this.operations_);
  },
  methods: {}
};
</script>