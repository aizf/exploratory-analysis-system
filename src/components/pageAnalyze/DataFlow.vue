<template>
  <div class="DataFlow">
    <svg
      :width="width"
      :height="height"
      :style="{border:'1px solid #305dff',background:backgroundColor}"
    >
      <defs>
        <filter id="shadow">
          <feDropShadow dx="0" dy="0" stdDeviation="0.3" />
        </filter>
      </defs>
    </svg>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import * as d3 from "d3";
import * as d3Sankey from "d3-sankey";

export default {
  name: "DataFlow",
  data() {
    return {
      link: d3.selectAll(),
      node: d3.selectAll(),
      vis: d3.selectAll(),
      linkG: d3.selectAll(),
      nodeG: d3.selectAll(),
      textG: d3.selectAll(),
      sankey: {}
    };
  },
  computed: {
    ...mapState({
      visualData: state => state.data.visualData,

      width: state => state.view.dpiX * 0.7,
      height: state => (state.view.dpiY - 64) * 0.55,
      colorPalette: state => state.view.colorPalette,
      backgroundColor: state => state.view.backgroundColor,
      contrastColor: state => state.view.contrastColor,
      operationTypes: state => state.view.operationTypes,

      operations: state => state.analyze.operations,
      dataFlow: state => state.analyze.dataFlow
    }),
    ...mapGetters(["recordFlow"])
  },
  mounted() {
    console.log("d3", d3);
    console.log("d3Sankey", d3Sankey);
    let svg = d3
      .select(".DataFlow svg")
      .attr("viewBox", [0, 0, this.width, this.height]);
    this.vis = svg.append("g");
    let zoomed = () => {
      let transform = d3.event.transform;
      this.vis.attr("transform", transform);
    };
    svg.call(d3.zoom().on("zoom", zoomed)).on("dblclick.zoom", null);
    this.sankey = d3Sankey
      .sankey()
      .nodeAlign(d3Sankey["sankeyLeft"])
      .nodeId(d => d.uuid)
      .nodeWidth(45)
      .nodePadding(60)
      .extent([[1, 5], [this.width - 1, this.height - 5]]);
    this.nodeG = this.vis
      .append("g")
      .attr("class", "nodeG")
      .attr("stroke", "#000")
      .attr("class", "nodes");
    this.linkG = this.vis
      .append("g")
      .attr("fill", "none")
      .attr("stroke-opacity", 0.5)
      .attr("class", "links");
    this.textG = this.vis
      .append("g")
      .attr("class", "texts")
      .style("font", "10px sans-serif");

    this.update();
  },
  activated() {
    this.update();
  },
  methods: {
    update() {
      let that = this;
      console.log(this);
      console.log("recordFlow:", this.recordFlow);
      // this.$store.state.formattedDataFlow();
      let { nodes, links } = this.sankey(this.recordFlow);
      // console.log(nodes, links);

      this.node = this.nodeG
        .selectAll("g")
        .data(nodes)
        .join("g")
        .each((d, i, p) => {
          // debugger;
          this.createMultipleColorsRect(d, i, p);
        });
      // .attr("fill", "green");
      this.node.append("title").text(d => `${d.uuid}\n${d.value}`);
      // .call(d3.drag().on("drag", this.dragged));

      this.link = this.linkG
        .selectAll("g")
        .data(links)
        .join("g")
        .style("mix-blend-mode", "multiply");

      // this.link.each(d => {
      //   d.width = 5;
      //   d.y0 = (d.source.y0 + d.source.y1) / 2;
      //   d.y1 = (d.target.y0 + d.target.y1) / 2;
      // });

      this.link
        .append("path")
        .attr("d", d =>
          d3
            .linkHorizontal()
            .source(() => [d.source.x1, (d.source.y0 + d.source.y1) / 2])
            .target(() => [d.target.x0, (d.target.y0 + d.target.y1) / 2])()
        )
        .attr("stroke", "#aaa")
        .attr("stroke-width", 5);
      this.link.append("title").text(d => {
        // let operations = d.operations.map(d => d.action).join("→");
        // return `${d.source.id} → ${d.target.id}\n${operations}`;
        return d.operation;
      });

      // text的x，y反向，值为相反数
      this.textG
        .selectAll("text")
        .data(nodes)
        .join("text")
        .attr("y", d => -(d.x1 + 6))
        // .attr("x", d => (d.x0 < this.width / 2 ? d.x1 + 6 : d.x0 - 6))
        .attr("x", d => -d.y0)
        .attr("dx", "-0.35em")
        .attr("text-anchor", "start")
        // .attr("text-anchor", d => (d.x0 < this.width / 2 ? "start" : "end"))
        .text(d => d.uuid)
        .attr("transform", "rotate(90)")
        .attr("transform-origin", "(left,bottom)");

      // this.dataFlowShowOperations(); // 显示视图节点间的操作
    },
    createMultipleColorsRect(d, i, p) {
      let height = d.y1 - d.y0;
      let width = d.x1 - d.x0;
      let nodes = d.data.nodes;
      let totalNum = d.data.nodes.length;
      let eachGroupNum = {};
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
      let groups = Object.keys(eachGroupNum).sort();
      let g = d3.select(p[i]);
      let preDy = 0; // 偏移量
      groups.forEach(group => {
        let h = (height * eachGroupNum[group]) / totalNum;
        g.append("rect")
          .attr("fill", this.colorPalette[group])
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
      const width = 10;
      const height = 50;
      const r = 10;
      // this.link.selectAll("path").remove();
      this.link.each((d, i, p) => {
        // console.log(d);
        let operations = d.operations.map(d => d.action);
        let op_num = operations.length;
        if (!op_num) return;
        d3.select(p[i])
          .select("path")
          .remove();
        let left = [d.source.x1, (d.source.y0 + d.source.y1) / 2];
        let right = [d.target.x0, d.y1];
        let padding = [
          (right[0] - left[0]) / (op_num + 1),
          (right[1] - left[1]) / (op_num + 1)
        ];

        let links = new Array(op_num + 1).fill({});
        let op_link = d3
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
        let op_node = d3
          .select(p[i])
          .attr("class", "linkLink")
          .selectAll("circle")
          .data(operations)
          .join("circle")
          .attr("cx", (d, i) => left[0] + (i + 1) * padding[0])
          .attr("cy", (d, i) => left[1] + (i + 1) * padding[1])
          .attr("r", r)
          .attr("fill", d => this.colorPalette[this.operationTypes.indexOf(d)]);
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
    updateTooltip(data) {
      // debugger;
      this.$store.commit("updatePageAnalyzeTooltip", {
        update: true,
        data: data
      });
    }
    // dragged(d) {
    //   d.x0 = d3.event.x;
    //   d.x1 = d3.event.x + this.sankey.nodeWidth();
    //   d.y0 = d3.event.y;
    //   d.y1 = d3.event.y + d.value;
    //   this.sankey.update(this.dataFlow);
    //   this.node.attr("x", d => d.x0).attr("y", d => d.y0);
    // }
  }
};
</script>
<style>
.DataFlow line {
  stroke: #aaa;
  stroke-opacity: 0.8;
  stroke-width: 0.3;
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

.DataFlow rect {
  stroke: none;
}
</style>