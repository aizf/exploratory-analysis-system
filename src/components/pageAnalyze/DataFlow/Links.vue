<template>
  <g class="links" fill="none">
    <!-- style="mix-blend-mode: multiply;" -->
    <g v-for="link in links$" style :key="link.index">
      <path
        :d="generatePath(link)"
        :stroke="pathColor(link.operation)"
        :stroke-width="link.width"
        :stroke-opacity="link.isShortestPath ? 0.7 : 0.2"
      />
      <title>{{ link.operation }}</title>
      <g
        :transform="`translate(${
          link.x1 + (link.x1 > link.x0 ? -15 - markCircleR : 20)
        },${link.y1})`"
      >
        <path
          :d="markedSymbol('triangle', 180)"
          :stroke="pathColor(link.operation)"
          stroke-width="2"
          :fill="pathColor(link.operation)"
          :opacity="link.isShortestPath ? 0.7 : 0.2"
          :transform="`rotate(${link.x1 > link.x0 ? -30 : 30})`"
        />
      </g>
    </g>
  </g>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import * as d3 from "d3";
import { classificationPalette2 } from "@/config/color";
import { dijkstra } from "@/utils/methods";
import { marks } from "@/utils/marks";
export default {
  name: "Links",
  components: {},
  props: {
    currentUUID: String,
    markCircleR: Number,
    nodes: Array,
    links: Array,
  },
  data() {
    return {
      linkWidth: 8,
    };
  },
  computed: {
    ...mapState({
      visualData: (state) => state.data.visualData,

      operationTypes: (state) => state.view.operationTypes,

      recordset: (state) => state.analyze.recordset,
    }),
    nodesNum() {
      // 用recordFlow，而非nodes，因为nodes是通过this.sankey()计算而来
      return this.nodes.length;
    },
    nodesDict() {
      return this.$parent.nodesDict;
    },
    links$() {
      // 先在nodes增加in和out的links，
      // 再根据node上links的数量设计y0(at source node),y1(at target node)
      this.setNodes();
      const links = this.links.map((d, i) => {
        const isLeft2Right =
          this.nodesDict[d.target].x0 > this.nodesDict[d.source].x0;
        const link = {
          index: i,
          operation: d.operation,
          source: this.nodesDict[d.source],
          target: this.nodesDict[d.target],
          width: this.linkWidth,
          x0: isLeft2Right
            ? this.nodesDict[d.source].x1
            : this.nodesDict[d.source].x0,
          x1: isLeft2Right
            ? this.nodesDict[d.target].x0
            : this.nodesDict[d.target].x1,
          isShortestPath: false,
        };
        link.source.sourceLinks.push(link);
        link.target.targetLinks.push(link);
        // console.log(d, i, link);
        // console.log(link.source===this.nodesDict[link.source.uuid])
        // debugger
        return link;
      });
      // 设置link的y0和y1,非响应式
      this.setLinkY();

      // 最短路径
      // pathUUID:最短路径上的UUIDs
      const nodesDict = this.nodesDict;
      const pathUUID = this.getDistances(links, "root");
      for (let i = 0; i < pathUUID.length; i++) {
        const uuid = pathUUID[i];
        // nodes
        nodesDict[uuid].isShortestPath = true;
        if (i === 0) continue;
        // links
        const objLink = nodesDict[pathUUID[i - 1]].sourceLinks.find(
          (link) => link.target.uuid === pathUUID[i]
        );
        // console.log("objLink", objLink);
        objLink.isShortestPath = true;
      }
      return links;
    },
  },
  created() {
    this.classificationPalette2 = classificationPalette2;
  },
  mounted() {
    console.log("DataFlow-Link", this);
  },
  activated() {},
  methods: {
    generatePath(d) {
      const isLeft2Right = d.target.x0 > d.source.x0;
      const offset = 21.87;
      return isLeft2Right
        ? d3
            .linkHorizontal()
            .source(() => [d.source.x0 + this.markCircleR, d.y0])
            .target(() => [d.target.x0 - this.markCircleR - offset, d.y1])()
        : d3
            .linkHorizontal()
            .source(() => [d.source.x0 - this.markCircleR, d.y0])
            .target(() => [d.target.x0 + this.markCircleR + offset, d.y1])();
    },
    pathColor(op) {
      return this.classificationPalette2[this.operationTypes.indexOf(op)];
    },
    markedSymbol(...args) {
      return marks.apply(null, args);
    },
    getDistances(links, source) {
      const uuidArr = this.nodes.map((node) => node.uuid);
      const uuid2indexMap = Object.fromEntries(
        this.nodes.map((node, i) => [node.uuid, i])
      );
      const matrix = new Array(this.nodesNum);

      for (let i = 0; i < this.nodesNum; i++) {
        matrix[i] = new Array(this.nodesNum).fill(Infinity);
      }
      for (let link of links) {
        matrix[uuid2indexMap[link.source.uuid]][
          uuid2indexMap[link.target.uuid]
        ] = 1;
      }
      console.log("matrix", matrix);
      const distances = dijkstra(matrix, uuid2indexMap[source]);
      const currentNodeIndex = uuid2indexMap[this.currentUUID];
      const pathIndex = [...distances[currentNodeIndex].path, currentNodeIndex];
      // pathUUID:最短路径上的节点
      const pathUUID = pathIndex.map((d) => uuidArr[d]);
      console.log("pathIndex", pathIndex);
      console.log("pathUUID", pathUUID);
      // console.log(`${uuid2indexMap["root"]} to ${currentNodeIndex}`);
      return pathUUID;
    },
    setNodes() {
      this.nodes.forEach((d) => {
        // 非响应式
        // sourceLinks: [] outgoing links
        // targetLinks: []  incoming links
        d.sourceLinks = [];
        d.targetLinks = [];
      });
    },
    setLinkY() {
      // 设置link的y0和y1,每个节点可能有多个link,需要平均高度
      this.nodes.forEach((node) => {
        // const height = node.y1 - node.y0;
        const height = 2 * this.markCircleR;
        const sourceLinks = node.sourceLinks;
        for (let i = 0; i < sourceLinks.length; i++) {
          const y0 = (node.y0 + node.y1) / 2 - this.markCircleR;
          // const y0 = node.y0;
          sourceLinks[i].y0 =
            y0 + (height * (i + 1)) / (sourceLinks.length + 1);
        }

        const targetLinks = node.targetLinks;
        for (let i = 0; i < targetLinks.length; i++) {
          const y0 = (node.y0 + node.y1) / 2 - this.markCircleR;
          // const y0 = node.y0;
          targetLinks[i].y1 =
            y0 + (height * (i + 1)) / (targetLinks.length + 1);
        }
      });
    },
  },
};
</script>
<style scoped>
</style>