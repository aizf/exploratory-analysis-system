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
    width() {
      return this.$store.state.dpiX * 0.7;
    },
    height() {
      return (this.$store.state.dpiY - 64) * 0.55;
    },
    visualData() {
      return this.$store.state.visualData;
    },
    backgroundColor() {
      return this.$store.state.backgroundColor;
    },
    contrastColor() {
      return this.$store.state.contrastColor;
    },
    colorPalette() {
      return this.$store.state.colorPalette;
    },
    operations() {
      return this.$store.state.operations;
    },
    operationTypes() {
      return this.$store.state.operationTypes;
    },
    dataFlow() {
      return this.$store.state.dataFlow;
    }
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
      .nodeId(d => d.id || d.name)
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
      console.log("dataFlow:", this.dataFlow);
      this.$store.state.formattedDataFlow();
      let { nodes, links } = this.sankey(this.dataFlow);
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
      this.node.append("title").text(d => `${d.id}\n${d.value}`);
      // .call(d3.drag().on("drag", this.dragged));

      this.link = this.linkG
        .selectAll("g")
        .data(links)
        .join("g")
        .style("mix-blend-mode", "multiply");

      this.link
        .append("path")
        .attr("d", (d, i) =>
          d3
            .linkHorizontal()
            .source(dd => [d.source.x1, (d.source.y0 + d.source.y1) / 2])
            .target(dd => [d.target.x0, d.y1])()
        )
        .attr("stroke", "#aaa")
        .attr("stroke-width", 5)
        // .attr("stroke-width", d => Math.max(1, d.width))
        .append("title")
        .text(d => {
          let operations = d.operations.map(d => d.action).join("→");
          return `${d.source.id} → ${d.target.id}\n${operations}`;
        });
      // console.log("sankeylink", d3Sankey.sankeyLinkHorizontal()(links[0]));
      // console.log(
      //   "slink",
      //   d3
      //     .linkHorizontal()
      //     .source(d => [0, 0])
      //     .target(d => [1, 1])(links[0])
      // );
      this.textG
        .selectAll("text")
        .data(nodes)
        .join("text")
        .attr("x", d => (d.x0 < this.width / 2 ? d.x1 + 6 : d.x0 - 6))
        .attr("y", d => (d.y1 + d.y0) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", d => (d.x0 < this.width / 2 ? "start" : "end"))
        .text(d => d.id || d.name);

      this.dataFlowShowOperations(); // 显示视图节点间的操作
    },
    createMultipleColorsRect(d, i, p) {
      let height = d.y1 - d.y0;
      let width = d.x1 - d.x0;
      let nodes = d.data.nodes;
      let totalNum = d.fixedValue;
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
      const r = 15;
      // this.link.selectAll("path").remove();
      this.link.each((d, i, p) => {
        // console.log(d);
        let operations = d.operations.map(d => d.action);
        let op_num = operations.length;
        if (!op_num) return; // TODO: 0个操作时，直接加曲线
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