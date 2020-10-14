<template>
  <g class="nodes">
    <circle
      :cx="currentNode.x0"
      :cy="(currentNode.y0 + currentNode.y1) / 2"
      :r="markCircleR"
      :style="{ fill: 'none', strokeWidth: '10', stroke: '#1890ff' }"
    />
    <!-- g用来包裹node，transform从桑吉图node.x0开始 -->
    <g
      class="node"
      v-for="node in nodes"
      @click.stop="updateTooltip(node.data)"
      :transform="`translate(${node.x0},${0})`"
      :key="node.uuid"
    >
      <g
        v-if="node.data.marked"
        :transform="`translate(${0},${(node.y0 + node.y1) / 2})`"
      >
        <path
          :d="markedSymbol('star', 180)"
          stroke="#1890ff"
          stroke-width="2"
        />
      </g>
      <g
        :transform="`translate(${-markCircleR},${
          (node.y0 + node.y1) / 2 - markCircleR
        })`"
        :opacity="node.isShortestPath ? 1 : 0.3"
      >
        <ChartPie
          :nodes="createPieData(node)"
          :radius="markCircleR"
          :valueFn="(d) => d.nodesNum"
        />
      </g>
      <!-- <rect
              v-for="rect in createMultipleColorRects(node)"
              :fill="classificationPalette[rect.group]"
              :x="node.x0"
              :y="rect.y"
              :width="node.x1 - node.x0"
              :height="rect.height"
              s
              :key="rect.group"
            />-->
      <!-- <rect
          :x="currentNode.x0"
          :y="currentNode.y0"
          :width="currentNode.x1-currentNode.x0"
          :height="currentNode.y1-currentNode.y0"
          fill="none"
          stroke-width="8"
          stroke="#1890ff"
        />-->
      <!-- <title>{{node.uuid}}{{"\n"}}{{node.value}}</title> -->
    </g>
  </g>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import ChartPie from "@/components/commonUse/ChartPie.vue";
export default {
  name: "NodePie",
  components: { ChartPie },
  props: {
    nodes: Array,
    currentUUID: String,
    markCircleR: Number,
  },
  // data() {
  //   return {};
  // },
  computed: {
    ...mapState({
      sourceData: (state) => state.data.sourceData,
    }),
    nodesTotalNum() {
      return JSON.parse(this.sourceData).nodes.length;
    },
    currentNode() {
      return this.$parent.nodesDict[this.currentUUID];
    },
  },
  created() {},
  mounted() {},
  activated() {},
  methods: {
    createPieData(d) {
      // 在<g>元素之内添加多颜色矩形
      const nodes = d.data.nodes;
      const eachGroupNum = {};
      nodes.forEach((node) => {
        if (!node.group) {
          // group 为0，或undefined
          eachGroupNum["0"] === undefined
            ? (eachGroupNum["0"] = 1)
            : eachGroupNum["0"]++;
        } else {
          eachGroupNum[node.group + ""] === undefined
            ? (eachGroupNum[node.group + ""] = 1)
            : eachGroupNum[node.group + ""]++;
        }
      });

      const rects = [];
      const groups = Object.keys(eachGroupNum).sort();
      groups.forEach((group) => {
        rects.push({
          group: group,
          nodesNum: eachGroupNum[group],
        });
      });

      const nullNum = this.nodesTotalNum - nodes.length;
      if (nullNum > 0) {
        rects.push({
          group: "null",
          nodesNum: nullNum,
        });
      }

      return rects;
    },
    createMultipleColorRects(d) {
      // 在<g>元素之内添加多颜色矩形
      const height = d.y1 - d.y0;
      const nodes = d.data.nodes;
      const totalNum = nodes.length;
      const eachGroupNum = {};
      nodes.forEach((node) => {
        if (!node.group) {
          // group 为0，或undefined
          eachGroupNum["0"] === undefined
            ? (eachGroupNum["0"] = 1)
            : eachGroupNum["0"]++;
        } else {
          eachGroupNum[node.group + ""] === undefined
            ? (eachGroupNum[node.group + ""] = 1)
            : eachGroupNum[node.group + ""]++;
        }
      });

      const rects = [];
      const groups = Object.keys(eachGroupNum).sort();
      let preDy = 0;
      groups.forEach((group) => {
        const h = (height * eachGroupNum[group]) / totalNum;
        rects.push({
          group: group,
          nodesNum: eachGroupNum[group],
          y: d.y0 + preDy,
          height: h,
        });
        preDy += h;
      });
      return rects;
    },
    markedSymbol(...args) {
      return this.$parent.markedSymbol.apply(null, args);
    },
    updateTooltip(data) {
      this.$store.commit("updatePageAnalyzeTooltip", data);
      this.$parent.$emit("staticForceShowChanged", true);
    },
  },
};
</script>
<style scoped>
.node {
  cursor: pointer;
}
</style>