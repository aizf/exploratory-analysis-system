<template>
  <div class="ForceChart">
    <div class="chart" :style="{width:width+'px', height:height+'px'}"></div>
  </div>
</template>
<script>
import store from "@/store/";
import { mapState, mapGetters } from "vuex";
import echarts from "echarts";
import "echarts-gl";
// import * as _ from "lodash";
export default {
  name: "ForceChart",
  props: {
    visClick: Boolean,
    visBrush: Boolean,
    brushKeep: Boolean,
    visInvertBrush: Boolean,
    visDrag: Boolean,
    visMouseover: Boolean,
    visZoom: Boolean,
    visShowIds: Boolean
  },
  data() {
    return {
      chart: {},
      option: {},

      isDraging: false, // 区分click和drag等
      mousePoint: [] // 相对于原始坐标系
    };
  },
  computed: {
    ...mapState({
      visualData: state => state.data.visualData,
      // datasets: state => state.data.datasets,

      width: state => state.view.dpiX * 0.6,
      height: state => state.view.dpiY * 0.7,
      colorPalette: state => state.view.colorPalette,
      backgroundColor: state => state.view.backgroundColor,
      contrastColor: state => state.view.contrastColor,
      parentUUID: state => state.view.parentUUID,
      currentUUID: state => state.view.currentUUID,
      needUpdate: state => state.view.chartsNeedUpdate.force,

      currentOperations: state => state.analyze.currentOperations,
      rollbacked: state => state.analyze.rollbacked
    }),
    ...mapGetters([
      "nodes",
      "links",
      "nodesNumber",
      "linksNumber",
      "generateUUID",
      "beforeEvent"
    ])
  },
  created() {},
  mounted() {
    // console.log(d3.version);
    // console.log(_.VERSION);
    const that = this;
    console.log("ForceChart", this);
    this.chart = echarts.init(document.querySelector(".chart"));
    this.option = {
      // color: this.colorPalette,
      backgroundColor: this.backgroundColor,
      series: [
        {
          type: "graphGL",
          nodes: this.nodes,
          edges: this.links,
          itemStyle: {
            color: this.contrastColor
          },
          lineStyle: {
            color: this.contrastColor,
            width: 1
          },
          forceAtlas2: {
            steps: 5,
            jitterTolerence: 10,
            edgeWeightInfluence: 4
          }
        }
      ]
    };

    // mounted---nextTick
    this.$nextTick(function() {});
  },
  updated() {},
  activated() {
    if (this.needUpdate) {
      this.chart.setOption(this.option, true);
      this.render();
      store.commit("ForceUpdated");
    }
  },

  deactivated() {
    // this.simulation.stop();
  },

  methods: {
    render() {
      console.log("render");
    },

    ticked() {},
    tickEnd() {},
    brushStart() {},
    brushed() {},
    brushEnd() {},
    invertBrushEnd() {},
    // drag
    dragstarted(d) {},
    dragged(d) {},
    dragended(d, i, p) {},
    d3_clickSelect(d, i, p) {},
    clickSelect(d) {},
    mouseover(d) {},
    mouseout() {},

    test() {}
  },
  watch: {}
};
</script>
<style scope>
</style>