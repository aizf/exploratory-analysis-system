<template>
  <a-card
    title="Others Views"
    :headStyle="{ padding: '0 24px 0 24px' }"
    :bodyStyle="{ padding: '5px 10px 5px 10px' }"
  >
    <a-button
      @click="
        updateSelectedNodes();
        onParallelCoordinate();
      "
      style="margin: 0 0 0 5px"
    >
      Parallel Coordinate
    </a-button>
    <a-button
      @click="
        updateSelectedNodes();
        onScatter();
      "
      style="margin: 0 0 0 5px"
    >
      Scatter Chart
    </a-button>
    <a-button style="margin: 0 0 0 5px"> Tree </a-button>
    <a-button style="margin: 0 0 0 5px"> Heat Map </a-button>
    <a-button @click="downJson" style="margin: 0 0 0 5px">
      Download .json
    </a-button>
    <!-- <div class="mask"> -->
    <div class="view" v-show="currentChart != ''" @click.self="currentChart = ''">
      <component
        ref="theView"
        class="view1"
        :is="currentChart"
        :items="selectedNodes"
      ></component>
    </div>
    <!-- </div> -->
  </a-card>
</template>
<script>
// import Vue from "vue";
import { mapState, mapGetters } from "vuex";
// import * as _ from "lodash";
import * as FileSaver from "file-saver";
import ParallelCoordinate from "./ParallelCoordinate";
import Scatter from "./Scatter";
import eventBus from "./eventBus.js";

export default {
  name: "OthersViews",
  components: { ParallelCoordinate, Scatter },
  inject: ["classificationPalette"],
  props: {},
  data() {
    return {
      selectedNodes: [],
      charts: ["ParallelCoordinate", "ScatterChart"],
      currentChart: "",
    };
  },
  computed: {
    ...mapState({
      visualData: (state) => state.data.visualData,
    }),
    ...mapGetters(["nodes", "links"]),
  },
  mounted() {
    console.log("OthersViews", this);
  },
  methods: {
    downJson() {
      const keys1 = ["id", "x", "y"];
      const keys2 = ["facebook_id", "page_name", "page_type"];
      const nodes = this.nodes.map((d) => {
        const node = {};
        for (let key of keys1) node[key] = d[key];
        for (let key of keys2) node[key] = d[key];
        return node;
      });
      const links = this.links.map((d) => ({
        source: d.source.id,
        target: d.target.id,
      }));

      const g = { nodes, links };
      const json = JSON.stringify(g);
      const blob = new Blob([json], {
        type: "text/json;charset=utf-8",
      });
      FileSaver.saveAs(blob, "hello world.json");
    },
    updateSelectedNodes() {
      this.selectedNodes = this.nodes.filter((d) => d.selected);
    },
    onParallelCoordinate() {
      const name = "ParallelCoordinate";
      if (this.currentChart === name) this.currentChart = "";
      else this.currentChart = "ParallelCoordinate";
    },
    onScatter() {
      const name = "Scatter";
      if (this.currentChart === name) this.currentChart = "";
      else this.currentChart = "Scatter";
    },
  },
};
</script>
<style lang="scss" scoped>
.view {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 99;
  display: flex;
  justify-content: center;
  align-items: center;
}
.mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.45);
  opacity: 0;
  filter: alpha(opacity=45);
  transition: opacity 0.3s linear, height 0s ease 0.3s;
  z-index: 9999999999;
}
</style>