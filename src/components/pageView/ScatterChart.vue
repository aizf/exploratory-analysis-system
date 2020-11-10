<template>
  <div
    class="ScatterChart"
    :style="{
      margin: '5px',
      height: chartHeight + 5 + 'px',
      width: chartWidth + 5 + 2 * 200 + 'px',
    }"
  >
    <div style="float: left">
      <svg
        :width="chartWidth"
        :height="chartHeight"
        :style="{ border: '1px solid #305dff', background: backgroundColor }"
      >
        <defs>
          <filter id="shadow">
            <feDropShadow dx="0" dy="0" stdDeviation="0.3" />
          </filter>
        </defs>
      </svg>
    </div>
    <div
      :style="{
        float: 'left',
        height: chartHeight + 'px',
        margin: '0 5px',
        padding: '0 0 40px 0',
      }"
    >
      <a-select
        showSearch
        placeholder="Select X Field"
        optionFilterProp="children"
        style="width: 160px"
        @change="xDimensionChange"
        :filterOption="filterOption"
      >
        <a-select-option v-for="(d, i) in nodeFields" :key="i">{{
          i
        }}</a-select-option>
      </a-select>
      <a-select
        showSearch
        placeholder="Select Y Field"
        optionFilterProp="children"
        style="width: 160px"
        @change="yDimensionChange"
        :filterOption="filterOption"
      >
        <a-select-option v-for="(d, i) in nodeFields" :key="i">{{
          i
        }}</a-select-option>
      </a-select>
    </div>
  </div>
</template>
<script>
import Vue from "vue";
import { Select } from "ant-design-vue";
Vue.use(Select);
import store from "@/store/";
import { mapState, mapGetters } from "vuex";
import * as d3 from "d3";
// import { mapState } from "vuex";
// import * as _ from "lodash";
export default {
  name: "ScatterChart",
  props: {
    visClick: Boolean,
    visBrush: Boolean,
    visInvertBrush: Boolean,
    visDrag: Boolean,
    visMouseover: Boolean,
    visZoom: Boolean,
    visShowIds: Boolean,
  },
  data() {
    return {
      axisMargin: 50,
      xDimension: "", // x轴选择的维度,key,字符串,数据在computed中
      yDimension: "",
      node: d3.selectAll(),
      nodeG: d3.selectAll(),
      vis: d3.selectAll(),
      xAxis: d3.selectAll(),
      yAxis: d3.selectAll(),
      xScale: {},
      yScale: {},
      brush: {},
      invertBrush: {},
      brushG: d3.selectAll(),
      invertBrushG: d3.selectAll(),
      brushedNodes: d3.selectAll(),
      invertBrushedNodes: d3.selectAll(),
      opacityNodes: d3.selectAll(),
      opacityLinks: d3.selectAll(),
      opacityTexts: d3.selectAll(),
      text: d3.selectAll(),
      textG: d3.selectAll(),
      isDraging: false, // 区分click和drag等
      mousePoint: [], // 相对于原始坐标系
    };
  },
  computed: {
    ...mapState({
      sourceData: (state) => state.data.sourceData,
      visualData: (state) => state.data.visualData,
      nodeFields: (state) => state.data.nodeFields,
      // datasets: state => state.data.datasets,

      chartWidth: (state) => state.view.dpiX * 0.7,
      chartHeight: (state) => state.view.dpiY * 0.7,
      classificationPalette: (state) => state.view.classificationPalette,
      backgroundColor: (state) => state.view.backgroundColor,
      parentUUID: (state) => state.view.parentUUID,
      currentUUID: (state) => state.view.currentUUID,
      needUpdate: (state) => state.view.chartsNeedUpdate.scatter,
    }),
    ...mapGetters(["nodes", "links", "nodesNumber"]),

    xDimensionData() {
      // 断绝了数据与节点的关联性，仅当作坐标刻度用
      return this.nodes
        .map((i) => i[this.xDimension])
        .sort((a, b) => {
          // 该比较函数需要返回数值
          // a全为数字则相减，否则比较大小
          return isNaN(a) || isNaN(b) ? (a > b ? 1 : -1) : a - b;
        });
    },
    yDimensionData() {
      //
      return this.nodes
        .map((i) => i[this.yDimension])
        .sort((a, b) => {
          // 该比较函数需要返回数值
          // a全为数字则相减，否则比较大小
          return isNaN(a) || isNaN(b) ? (a > b ? 1 : -1) : a - b;
        });
    },
  },
  mounted() {},

  activated() {
    if (this.needUpdate) {
      this.update();
      store.commit("ScatterUpdated");
    }
  },

  methods: {},
  watch: {
    visBrush: function (val) {
      val
        ? (this.brushG.style("display", "inline"),
          this.brush.clear(this.brushG))
        : this.brushG.style("display", "none");
    },
    visInvertBrush: function (val) {
      val
        ? (this.invertBrushG.style("display", "inline"),
          this.invertBrush.clear(this.invertBrushG))
        : this.invertBrushG.style("display", "none");
    },
    visShowIds: function (val) {
      val
        ? this.textG.style("display", "inline")
        : this.textG.style("display", "none");
    },
  },
};
</script>
<style>
.ScatterChart .tick line {
  stroke: #aaa;
}

.ScatterChart .tick text {
  fill: #aaa;
}

.ScatterChart path {
  stroke: #aaa;
}

.ScatterChart circle.selected {
  /* fill: red; */
  stroke: red;
  stroke-width: 1.5;
}

.ScatterChart circle.invertBrushing {
  stroke: none;
  stroke-width: 0px;
}
</style>