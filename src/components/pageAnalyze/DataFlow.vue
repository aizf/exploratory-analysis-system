<template>
  <div class="DataFlow" :style="{width:width+'px',height:height+'px'}">
    <svg :width="width" :height="height">
      <defs>
        <filter id="shadow">
          <feDropShadow dx="0" dy="0" stdDeviation="0.3" />
        </filter>
      </defs>
      <g>
        <circle
          :cx="currentNode.x0"
          :cy="(currentNode.y0+currentNode.y1)/2"
          :r="markCircleR"
          :style="{fill:'none',strokeWidth:'10',stroke:'#1890ff'}"
        />
        <!-- <rect
          :x="currentNode.x0"
          :y="currentNode.y0"
          :width="currentNode.x1-currentNode.x0"
          :height="currentNode.y1-currentNode.y0"
          fill="none"
          stroke-width="8"
          stroke="#1890ff"
        />-->
        <g class="nodes" stroke="#000">
          <!-- g用来包裹node，transform从桑吉图node.x0开始 -->
          <g
            v-for="node in nodes"
            @click="updateTooltip(node.data)"
            :transform="`translate(${node.x0},${0})`"
            :key="node.data.uuid"
          >
            <g v-if="node.data.marked" :transform="`translate(${0},${(node.y0+node.y1)/2})`">
              <path :d="markedSymbol('star',180)" stroke="#1890ff" stroke-width="2" />
            </g>
            <g
              :transform="`translate(${-markCircleR},${(node.y0+node.y1)/2-markCircleR})`"
              :opacity="node.isShortestPath ? 1 : 0.3"
            >
              <ChartPie
                :nodes="createPieData(node)"
                :radius="markCircleR"
                :valueFn="d=>d.nodesNum"
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
            <!-- <title>{{node.uuid}}{{"\n"}}{{node.value}}</title> -->
          </g>
        </g>
        <g class="links" fill="none">
          <!-- style="mix-blend-mode: multiply;" -->
          <g v-for="link in links" style :key="link.index">
            <path
              :d="generatePath(link)"
              :stroke="pathColor(link.operation)"
              :stroke-width="link.width"
              :stroke-opacity="link.isShortestPath ? 0.7 : 0.2"
            />
            <title>{{link.operation}}</title>
            <g
              :transform="`translate(${link.x1+(link.x1>link.x0?-15-markCircleR:20)},${link.y1})`"
            >
              <path
                :d="markedSymbol('triangle',180)"
                :stroke="pathColor(link.operation)"
                stroke-width="2"
                :fill="pathColor(link.operation)"
                :opacity="link.isShortestPath ? 0.7 : 0.2"
                :transform="`rotate(${link.x1>link.x0?-30:30})`"
              />
            </g>
          </g>
        </g>
        <g class="texts" style="font: 10px sans-serif;">
          <text
            v-for="node in nodes"
            :x="node.x1 + 6"
            :y="(node.y0+node.y1)/2-markCircleR"
            dx="-0.35em"
            :stroke="contrastColor"
            text-anchor="start"
            :key="node.data.uuid"
          >{{node.data.uuid}}</text>
        </g>
      </g>
    </svg>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import * as d3 from "d3";
import * as d3Sankey from "d3-sankey";
import ChartPie from "@/components/commonUse/ChartPie.vue";

export default {
  name: "DataFlow",
  components: {
    ChartPie
  },
  data() {
    return {
      link: d3.selectAll(),
      node: d3.selectAll(),
      nodeWidth: 45,
      linkWidth: 8,
      markCircleR: 50,
      vis: d3.selectAll(),
      linkG: d3.selectAll(),
      nodeG: d3.selectAll(),
      textG: d3.selectAll(),
      sankey: {},
      nodesUpdater: 0
    };
  },
  computed: {
    ...mapState({
      visualData: state => state.data.visualData,
      nodesTotalNum: state => state.data.nodesTotalNum,

      width: state => state.view.dpiX * 0.7,
      height: state => (state.view.dpiY - 64) * 0.45,
      classificationPalette: state => state.view.classificationPalette,
      classificationPalette2: state => state.view.classificationPalette2,
      backgroundColor: state => state.view.backgroundColor,
      contrastColor: state => state.view.contrastColor,
      operationTypes: state => state.view.operationTypes,
      currentUUID: state => state.view.currentUUID,

      operations: state => state.analyze.operations,
      recordset: state => state.analyze.recordset
    }),
    ...mapGetters(["recordFlow", "dijkstra"]),

    graph() {
      return this.sankey(this.recordFlow);
    },
    nodes() {
      // nodes不是data，因此不是响应的，所以设置nodesUpdater
      this.nodesUpdater;
      const nodes = this.graph.nodes;
      nodes.forEach(node => {
        // this.$set(node, "isShortestPath", false);
        node.sourceLinks = [];
        node.targetLinks = [];
      });
      return nodes;
      // let tempDict = { startUUID: {}, op:"",opTime: 0, endUUID: {} };
    },
    nodesNum() {
      // 用recordFlow，而非nodes，因为nodes是通过this.sankey()计算而来
      return this.recordFlow.nodes.length;
    },
    nodesDict() {
      const dict = {};
      this.nodes.forEach(node => {
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
      const nodesDict = {};
      this.nodes.forEach(node => {
        nodesDict[node.data.uuid] = node;
      });

      // 计算最短路径
      const matrix = new Array(this.nodesNum);
      for (let i = 0; i < this.nodesNum; i++) {
        matrix[i] = new Array(this.nodesNum).fill(Infinity);
      }
      const uuidArr = this.nodes.map(node => node.data.uuid);

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
          isShortestPath: false
        };

        // 判断路径方向
        const isLeft2Right = link.target.x0 > link.source.x0;
        link.x0 = isLeft2Right ? link.source.x1 : link.source.x0;
        link.x1 = isLeft2Right ? link.target.x0 : link.target.x1;
        links.push(link);

        // nodes添加sourceLinks和targetLinks
        nodesDict[recordNodes[i - 1].data.uuid].sourceLinks.push(link);
        nodesDict[recordNodes[i].data.uuid].targetLinks.push(link);

        // 设置路径
        matrix[uuidArr.indexOf(recordNodes[i - 1].data.uuid)][
          uuidArr.indexOf(recordNodes[i].data.uuid)
        ] = 1;
        // debugger;
      }

      // 设置link的y0和y1
      this.nodes.forEach(node => {
        node.isShortestPath = false;

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

      const distances = this.dijkstra(matrix, uuidArr.indexOf("root"));
      // debugger
      const currentNodeIndex = uuidArr.indexOf(this.currentNode.data.uuid);
      const pathIndex = [...distances[currentNodeIndex].path, currentNodeIndex];
      // pathUuid:最短路径上的节点
      const pathUuid = pathIndex.map(d => uuidArr[d]);
      console.log("matrix", matrix);
      console.log("pathIndex", pathIndex);
      console.log(`${uuidArr.indexOf("root")} to ${currentNodeIndex}`);
      // 将关键路径的isShortestPath设置为true
      for (let i = 0; i < pathUuid.length; i++) {
        this.nodesDict[pathUuid[i]].isShortestPath = true;
        if (!i) {
          continue;
        }
        // pathUuid增加了currentNodeUUID，因此length大于等于1
        const objLink = nodesDict[pathUuid[i - 1]].sourceLinks.find(
          link => link.target.data.uuid === pathUuid[i]
        );
        objLink.isShortestPath = true;
      }
      // console.log(matrix);
      // console.log(this.dijkstra(matrix, uuidArr.indexOf("root")));
      this.nodesUpdater++;
      return links;
    },
    currentNode() {
      return this.nodes.find(node => node.data.uuid === this.currentUUID);
    }
  },
  created() {
    this.sankey = d3Sankey
      .sankey()
      .nodeAlign(d3Sankey["sankeyLeft"])
      .nodeId(d => d.data.uuid)
      .nodeWidth(this.nodeWidth)
      .nodePadding(60)
      .extent([
        [1, 5],
        [this.width * Math.floor(this.nodesNum / 10 + 1) - 1, this.height - 5]
      ]);
  },
  mounted() {
    console.log("DataFlow", this);
    // console.log("d3Sankey", d3Sankey);
    // console.log(d3);
    const svg = d3
      .select(this.$el)
      .select("svg")
      .attr("viewBox", [0, 0, this.width, this.height]);
    this.vis = svg.select("g");

    svg
      .call(
        d3
          .zoom()
          .extent([
            [0, 0],
            [this.width, this.height]
          ])
          .on("zoom", () => {
            const transform = d3.event.transform;
            this.vis.attr("transform", transform);
          })
      )
      .on("dblclick.zoom", null);

    this.$nextTick(function() {
      this.nodeG = this.vis.select("g.nodes");
      this.linkG = this.vis.select("g.links");
      this.textG = this.vis.select("g.texts");
    });
  },
  activated() {},
  methods: {
    update() {
      const that = this;
      console.log("recordFlow:", this.recordFlow);
      // this.$store.state.formattedDataFlow();
      // let { nodes, links } = this.sankey(this.recordFlow);
      // console.log(nodes, links);

      // this.node = this.nodeG
      //   .selectAll("g")
      //   .data(this.nodes)
      //   .join("g")
      //   .each((d, i, p) => {
      //     // debugger;
      //     this.createMultipleColorsRect(d, i, p);
      //   });
      // .attr("fill", "green");
      // this.node.append("title").text(d => `${d.uuid}\n${d.value}`);
      // .call(d3.drag().on("drag", this.dragged));

      // this.link = this.linkG
      //   .selectAll("g")
      //   .data(this.links)
      //   .join("g")
      //   .style("mix-blend-mode", "multiply");

      // this.link
      //   .append("path")
      //   .attr("d", d =>
      //     d3
      //       .linkHorizontal()
      //       .source(() => [d.source.x1, (d.source.y0 + d.source.y1) / 2])
      //       .target(() => [d.target.x0, (d.target.y0 + d.target.y1) / 2])()
      //   )
      //   .attr("stroke", "#aaa")
      //   .attr("stroke-width", 5);
      // this.link.append("title").text(d => {
      //   // let operations = d.operations.map(d => d.action).join("→");
      //   // return `${d.source.id} → ${d.target.id}\n${operations}`;
      //   return d.operation;
      // });
      //**
      // // text的x，y反向，值为相反数
      // this.textG
      //   .selectAll("text")
      //   .data(nodes)
      //   .join("text")
      //   .attr("y", d => -(d.x1 + 6))
      //   // .attr("x", d => (d.x0 < this.width / 2 ? d.x1 + 6 : d.x0 - 6))
      //   .attr("x", d => -d.y0)
      //   .attr("dx", "-0.35em")
      //   .attr("text-anchor", "start")
      //   // .attr("text-anchor", d => (d.x0 < this.width / 2 ? "start" : "end"))
      //   .text(d => d.uuid)
      //   .attr("transform", "rotate(90)")
      //   .attr("transform-origin", "(left,bottom)");
      //**
      // this.textG
      // .attr("x", d => (d.x0 < this.width / 2 ? d.x1 + 6 : d.x0 - 6))
      // .attr("text-anchor", d => (d.x0 < this.width / 2 ? "start" : "end"))

      // this.dataFlowShowOperations(); // 显示视图节点间的操作
    },
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
    createPieData(d) {
      // 在<g>元素之内添加多颜色矩形
      const nodes = d.data.nodes;
      const eachGroupNum = {};
      nodes.forEach(node => {
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
      groups.forEach(group => {
        rects.push({
          group: group,
          nodesNum: eachGroupNum[group]
        });
      });

      const nullNum = this.nodesTotalNum - nodes.length;
      if (nullNum > 0) {
        rects.push({
          group: "null",
          nodesNum: nullNum
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
      nodes.forEach(node => {
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
      groups.forEach(group => {
        const h = (height * eachGroupNum[group]) / totalNum;
        rects.push({
          group: group,
          nodesNum: eachGroupNum[group],
          y: d.y0 + preDy,
          height: h
        });
        preDy += h;
      });
      return rects;
    },

    createMultipleColorsRect__(d, i, p) {
      // 在<g>元素之内添加多颜色矩形
      const height = d.y1 - d.y0;
      const width = d.x1 - d.x0;
      const nodes = d.data.nodes;
      const totalNum = d.data.nodes.length;
      const eachGroupNum = {};
      nodes.forEach(node => {
        if (!node.group) {
          eachGroupNum["0"] === undefined
            ? (eachGroupNum["0"] = 0)
            : eachGroupNum["0"]++;
        } else {
          eachGroupNum[node.group + ""] === undefined
            ? (eachGroupNum[node.group + ""] = 0)
            : eachGroupNum[node.group + ""]++;
        }
      });
      const groups = Object.keys(eachGroupNum).sort();
      const g = d3.select(p[i]);
      let preDy = 0; // 偏移量
      groups.forEach(group => {
        const h = (height * eachGroupNum[group]) / totalNum;
        g.append("rect")
          .attr("fill", this.classificationPalette[group])
          .attr("x", d.x0)
          .attr("y", d.y0 + preDy)
          .attr("width", width)
          .attr("height", h);
        preDy += h;
      });
      g.on("click", () => {
        this.updateTooltip(d.data);
      });
    },
    dataFlowShowOperations(_ = true) {
      // const width = this.sankey.nodeWidth() / 2;
      // const width = 10;
      // const height = 50;
      const r = 10;
      // this.link.selectAll("path").remove();
      this.link.each((d, i, p) => {
        // console.log(d);
        const operations = d.operations.map(d => d.action);
        const op_num = operations.length;
        if (!op_num) return;
        d3.select(p[i])
          .select("path")
          .remove();
        const left = [d.source.x1, (d.source.y0 + d.source.y1) / 2];
        const right = [d.target.x0, d.y1];
        const padding = [
          (right[0] - left[0]) / (op_num + 1),
          (right[1] - left[1]) / (op_num + 1)
        ];

        const links = new Array(op_num + 1).fill({});
        const op_link = d3
          .select(p[i])
          .selectAll("path")
          .data(links)
          .join("path")
          .attr("d", (d, i) =>
            d3
              .linkHorizontal()
              .source(d => [left[0] + i * padding[0], left[1] + i * padding[1]])
              .target(d => [
                left[0] + (i + 1) * padding[0],
                left[1] + (i + 1) * padding[1]
              ])()
          )
          .attr("stroke", "#aaa")
          .attr("stroke-width", 5);
        console.log(op_link);
        const op_node = d3
          .select(p[i])
          .attr("class", "linkLink")
          .selectAll("circle")
          .data(operations)
          .join("circle")
          .attr("cx", (d, i) => left[0] + (i + 1) * padding[0])
          .attr("cy", (d, i) => left[1] + (i + 1) * padding[1])
          .attr("r", r)
          .attr("fill", d => this.classificationPalette[this.operationTypes.indexOf(d)]);
        // debugger
        op_node.append("title").text(d => d);
        // console.log(op_node);
        // console.log(
        //   d3
        //     .linkHorizontal()
        //     .source([0, 0])
        //     .target(1, 1)
        // );
      });
    },
    visTransform() {
      return d3.zoomTransform(this.vis.node());
    },
    updateTooltip(data) {
      this.$store.commit("updatePageAnalyzeTooltip", data);
    },
    markedSymbol(type, size) {
      let __type;
      switch (type) {
        case "circle":
          __type = d3.symbols[0];
          break;
        case "cross":
          __type = d3.symbols[1];
          break;
        case "diamond":
          __type = d3.symbols[2];
          break;
        case "square":
          __type = d3.symbols[3];
          break;
        case "star":
          __type = d3.symbols[4];
          break;
        case "triangle":
          __type = d3.symbols[5];
          break;
        case "wye":
          __type = d3.symbols[6];
          break;
        default:
          throw new Error(
            "type error !\ncircle cross diamond square star triangle wye"
          );
      }
      return d3
        .symbol()
        .type(__type)
        .size(size)();
      // return this.$d3.symbol().type(this.$d3.symbols[4])();
    }
    // dragged(d) {
    //   d.x0 = d3.event.x;
    //   d.x1 = d3.event.x + this.sankey.nodeWidth();
    //   d.y0 = d3.event.y;
    //   d.y1 = d3.event.y + d.value;
    //   this.sankey.update(this.dataFlow);
    //   this.node.attr("x", d => d.x0).attr("y", d => d.y0);
    // }
  },
  watch: {
    nodesNum: function(newV, oldV) {
      // if (Math.floor(newV / 10) === Math.floor(oldV / 10)) return;
      // k为extent放缩系数
      let k = Math.floor(newV / 10) + 1;
      // console.log("watch", this);
      this.sankey.extent([
        [1, 5],
        [this.width * k - 1, this.height - 5]
      ]);
    }
  }
};
</script>
<style scope>
.DataFlow line {
}

.DataFlow circle {
  pointer-events: all;
  stroke: none;
}
.DataFlow circle.selected {
  /* fill: red; */
  stroke: red;
  stroke-width: 1.5;
}
.DataFlow circle.brushing {
  /* fill: red; */
  stroke: red;
  stroke-width: 1.5;
}

.DataFlow .nodes rect {
  stroke: none;
}
</style>