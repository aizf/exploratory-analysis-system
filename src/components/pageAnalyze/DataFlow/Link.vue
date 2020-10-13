<template>
  <g class="links" fill="none">
    <!-- style="mix-blend-mode: multiply;" -->
    <g v-for="link in links" style :key="link.index">
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
export default {
  name: "Link",
  components: {},
  props: {
    currentNode: Object,
    markCircleR: Number,
    nodes: Array,
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
      const dict = {};
      this.nodes.forEach((node) => {
        dict[node.data.uuid] = node;
      });
      return dict;
    },
    links() {
      // 先在nodes增加in和out的links，
      // 再根据node上links的数量设计y0(at source node),y1(at target node)

      const links = [];
      // sourceLinks: [] outgoing links
      // targetLinks: []  incoming links
      const recordNodes = [...this.recordset, this.currentNode];
      const nodesDict = this.nodesDict;
      this.nodes.forEach((node) => {
        this.$set(node, "isShortestPath", false);
      });

      const uuidArr = this.nodes.map((node) => node.data.uuid);
      const uuidDict = Object.fromEntries(
        this.nodes.map((node, i) => [node.data.uuid, i])
      );

      for (let i = 1; i < recordNodes.length; i++) {
        // links
        const link = {
          index: i - 1,
          // uuid: recordNodes[i - 1].uuid,
          operation: recordNodes[i - 1].operation,
          source: nodesDict[recordNodes[i - 1].data.uuid],
          target: nodesDict[recordNodes[i].data.uuid],
          width: this.linkWidth,
          x0: 0,
          y0: 0,
          x1: 0,
          y1: 0,
          isShortestPath: false,
        };

        // 判断路径方向
        const isLeft2Right = link.target.x0 > link.source.x0;
        link.x0 = isLeft2Right ? link.source.x1 : link.source.x0;
        link.x1 = isLeft2Right ? link.target.x0 : link.target.x1;
        links.push(link);

        // nodes添加sourceLinks和targetLinks
        nodesDict[recordNodes[i - 1].data.uuid].sourceLinks.push(link);
        nodesDict[recordNodes[i].data.uuid].targetLinks.push(link);
      }

      // 设置link的y0和y1
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

      // 计算最短路径
      const distances = this.getDistances(recordNodes, "root");
      // debugger
      const currentNodeIndex = uuidDict[this.currentNode.data.uuid];
      const pathIndex = [...distances[currentNodeIndex].path, currentNodeIndex];
      // pathUuid:最短路径上的节点
      const pathUuid = pathIndex.map((d) => uuidArr[d]);
      console.log("pathIndex", pathIndex);
      console.log(`${uuidDict["root"]} to ${currentNodeIndex}`);
      // 将关键路径的isShortestPath设置为true
      for (let i = 0; i < pathUuid.length; i++) {
        this.nodesDict[pathUuid[i]].isShortestPath = true;
        if (!i) {
          continue;
        }
        // pathUuid增加了currentNodeUUID，因此length大于等于1
        const objLink = nodesDict[pathUuid[i - 1]].sourceLinks.find(
          (link) => link.target.data.uuid === pathUuid[i]
        );
        objLink.isShortestPath = true;
      }
      // console.log(matrix);
      // console.log(this.dijkstra(matrix, uuidDict["root"]));
      return links;
    },
  },
  created() {
    this.classificationPalette2 = classificationPalette2;
  },
  mounted() {},
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
      return this.$parent.markedSymbol.apply(null, args);
    },
    getDistances(recordNodes, source) {
      const matrix = new Array(this.nodesNum);
      const uuidArr = this.nodes.map((node) => node.data.uuid);
      const uuidDict = Object.fromEntries(
        this.nodes.map((node, i) => [node.data.uuid, i])
      );

      for (let i = 0; i < this.nodesNum; i++) {
        matrix[i] = new Array(this.nodesNum).fill(Infinity);
      }
      for (let i = 1; i < this.nodesNum; i++) {
        matrix[uuidDict[recordNodes[i - 1].data.uuid]][
          uuidDict[recordNodes[i].data.uuid]
        ] = 1;
      }
      console.log("matrix", matrix);
      dijkstra(matrix, uuidDict[source]);
    },
  },
};
</script>
<style scoped>
</style>