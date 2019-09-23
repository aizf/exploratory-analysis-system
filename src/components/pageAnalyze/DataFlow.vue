<template>
  <div class="DataFlow">
    <svg
      :width="width"
      :height="height"
      :style="{border:'1px solid #305dff',background:backgroundColor}"
    />
  </div>
</template>

<script>
import * as d3 from "d3";
import * as d3Sankey from "d3-sankey";

export default {
  name: "DataFlow",
  data() {
    return {
      width: 1575,
      height: 800,
      link: d3.selectAll(),
      node: d3.selectAll(),
      linkG: d3.selectAll(),
      nodeG: d3.selectAll(),
      textG: d3.selectAll(),
      sankey: {}
    };
  },
  computed: {
    visualData() {
      return this.$store.state.visualData;
    },
    backgroundColor() {
      return this.$store.state.backgroundColor;
    },
    contrastColor(){
return this.$store.state.contrastColor;
    },
    colorPalette() {
      return this.$store.state.colorPalette;
    },
    operations() {
      return this.$store.state.operations;
    }
  },
  mounted() {
    console.log(this);
    // console.log(d3Sankey);
    let svg = d3
      .select(".DataFlow svg")
      .attr("viewBox", [0, 0, this.width, this.height]);
    this.sankey = d3Sankey
      .sankey()
      .nodeId(d => d.id || d.name)
      .nodeWidth(15)
      .nodePadding(10)
      .extent([[1, 5], [this.width - 1, this.height - 5]]);
    this.nodeG = svg.append("g").attr("stroke", "#000");
    this.linkG = svg
      .append("g")
      .attr("fill", "none")
      .attr("stroke-opacity", 0.5);
    this.textG = svg.append("g").style("font", "10px sans-serif");

    this.update();
  },
  activated() {
    this.update();
  },
  methods: {
    update() {
      let { nodes, links } = this.sankey(this.visualData);

      // console.log(nodes, links);
      this.node = this.nodeG
        .selectAll("rect")
        .data(nodes)
        .join("rect")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("height", d => d.y1 - d.y0)
        .attr("width", d => d.x1 - d.x0)
        .attr("fill", "green");

      this.link = this.linkG
        .selectAll("g")
        .data(links)
        .join("g")
        .style("mix-blend-mode", "multiply");

      this.link
        .append("path")
        .attr("d", d3Sankey.sankeyLinkHorizontal())
        .attr("stroke", "#aaa")
        .attr("stroke-width", d => Math.max(1, d.width));

      this.link
        .append("title")
        .text(d => `${d.source.name} → ${d.target.name}\n${d.value}`);

      this.textG
        .selectAll("text")
        .data(nodes)
        .join("text")
        .attr("x", d => (d.x0 < this.width / 2 ? d.x1 + 6 : d.x0 - 6))
        .attr("y", d => (d.y1 + d.y0) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", d => (d.x0 < this.width / 2 ? "start" : "end"))
        .text(d => d.id ||d.name);
    }
  }
};
</script>