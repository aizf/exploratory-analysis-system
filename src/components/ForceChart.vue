<template>
  <svg :width="this.chartWidth" :height="this.chartHeight" :style="{border:'1px solid #305dff'}" />
</template>
<script>
import * as d3 from "d3";
// import * as _ from "lodash";
export default {
  name: "ForceChart",
  props: {
    visClick: Boolean,
    visBrush: Boolean,
    visDrag: Boolean,
    visMouseover: Boolean,
    visShowIds: Boolean
  },
  data() {
    return {
      chartWidth: "960",
      chartHeight: "600",
      link: d3.selectAll(),
      node: d3.selectAll(),
      linkData: [],
      nodeData: [],
      vis: d3.selectAll(),
      simulation: {},
      brushG: d3.selectAll(),
      opacityNodes: d3.selectAll(),
      opacityLinks: d3.selectAll(),
      opacityTexts: d3.selectAll(),
      text: d3.selectAll()
    };
  },

  mounted() {
    // console.log(d3.version);
    // console.log(_.VERSION);
    console.log(this);
    let svg = d3.select(this.$el),
      width = +this.chartWidth,
      height = +this.chartHeight;
    // console.log(svg);

    this.vis = svg.append("g");
    this.vis
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .style("fill", "none")
      .style("pointer-events", "all");
    // console.log(this.vis);

    this.simulation = d3
      .forceSimulation()
      .force("link", d3.forceLink().id(d => d.id))
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(width / 2, height / 2));
    // console.log(this.simulation);

    // brush
    let brush = d3
      .brush()
      .extent([[0, 0], [width, height]])
      .on("start brush", this.brushed);
    this.brushG = this.vis
      .append("g")
      .call(brush)
      .attr("class", "brush")
      .call(brush.move, [[0, 0], [1, 1]]);
    // console.log(this.brushG);
    this.visBrush
      ? this.brushG.style("display", "inline")
      : this.brushG.style("display", "none");

    // 初始化为<g>，再指向selectAll()，防止update()产生多个<g>
    this.link = this.vis.append("g").attr("class", "links");
    this.node = this.vis.append("g").attr("class", "nodes");
    this.text = this.vis.append("g").attr("class", "texts");

    this.test();
  },

  methods: {
    load(nodeData, linkData) {
      // 加载数据,后期拓展
      this.nodeData = nodeData;
      this.linkData = linkData;
    },
    update() {
      // 更新数据
      let color = d => {
        const scale = d3.schemeSet2;
        return scale[d.group]; // FIXME 指定group
      };
      // this.load(nodeData, linkData);
      this.link = this.link
        .selectAll("line")
        .data(this.linkData)
        .enter()
        .append("line");

      this.node = this.node
        .selectAll("circle")
        .data(this.nodeData)
        .enter()
        .append("circle")
        .attr("r", 4)
        .attr("class", "display")
        .attr("fill", color);
      // this.node.append("title").text(d => d.id);

      this.text = this.text
        .selectAll("text")
        .data(this.node.data())
        .enter()
        .append("text")
        .attr("text-anchor", "middle")
        .attr("font-family", "Avenir")
        .attr("font-size", "10")
        .attr("dy", "-0.5em")
        .text(d => d.id)
        .attr("fill", color)
        .style("-webkit-user-select", "none") // 字体不被选中
        .style("-moz-user-select", "none")
        .style("-ms-user-select", "none")
        .style("user-select", "none");

      this.simulation.nodes(this.node.data()).on("tick", this.ticked);
      this.simulation.force("link").links(this.link.data());
    },
    bindEvents() {
      // 更新后绑定事件
      this.node.call(
        d3
          .drag()
          .on("start", this.dragstarted)
          .on("drag", this.dragged)
          .on("end", this.dragended)
      );
      this.node.on("click", this.clickSelect);
      this.node.on("mouseover", this.mouseover);
      this.node.on("mouseout", this.mouseout);
      let node = this.node;

      this.text.call(
        d3
          .drag()
          .on("start", this.dragstarted)
          .on("drag", this.dragged)
          .on("end", this.dragended)
      );
      this.text.on("click", textEvent2Node);
      this.text.on("mouseover", textEvent2Node);
      this.text.on("mouseout", textEvent2Node);

      function textEvent2Node(d) {
        let theIndex = d.index;
        let theNode = node.filter(d => d.index === theIndex);
        theNode.dispatch(d3.event.type);
      }
    },
    ticked() {
      this.link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      this.node.attr("cx", d => d.x).attr("cy", d => d.y);

      if (this.visShowIds) {
        this.text.attr("x", d => d.x).attr("y", d => d.y);
      }
    },
    brushed() {
      let extent = d3.event.selection;
      this.node.classed("selected", d => {
        return (
          extent[0][0] <= d.x &&
          extent[0][1] <= d.y &&
          d.x <= extent[1][0] &&
          d.y <= extent[1][1]
        );
      });
    },
    dragstarted(d) {
      if (!this.visDrag) return;
      if (!d3.event.active) this.simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    },
    dragged(d) {
      if (!this.visDrag) return;
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    },
    dragended(d) {
      if (!this.visDrag) return;
      if (!d3.event.active) this.simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    },
    clickSelect(d, i, p) {
      if (this.visClick) {
        let t = d3.select(p[i]);
        if (t.classed("selected")) {
          t.classed("selected", false);
        } else {
          t.classed("selected", true);
        }
      }
    },
    mouseover(d) {
      if (!this.visMouseover) return;
      let displayNodes = null;
      // let opacityNodes = null;
      let displayLinks = null;
      // let opacityLinks = null;
      let thisId = d.id;
      // console.log(thisId);
      this.opacityLinks = this.link.filter(d => {
        return d.source.id !== thisId && d.target.id !== thisId;
      });
      displayLinks = this.link.filter(d => {
        return d.source.id === thisId || d.target.id === thisId;
      });
      this.opacityNodes = this.node.filter(d => {
        // console.log("d",d);
        let displayLinksData = displayLinks.data();
        for (let i in displayLinksData) {
          // console.log(i);
          if (
            d.id === displayLinksData[i].source.id ||
            d.id === displayLinksData[i].target.id
          ) {
            return false;
          }
        }
        return true;
      });
      displayNodes = this.node.filter(d => {
        let displayLinksData = displayLinks.data();
        for (let i in displayLinksData) {
          // console.log(i);
          if (
            d.id === displayLinksData[i].source.id ||
            d.id === displayLinksData[i].target.id
          ) {
            return true;
          }
        }
        return false;
      });

      let opacityIndex = this.opacityNodes.data().map(val => val.index);
      // console.log(opacityIndex);
      this.opacityTexts = this.text.filter(d =>
        opacityIndex.find(val => val === d.index)!==undefined   //!==undefined 防止返回0误认为false
      );
      // console.log(this.opacityTexts.data());

      this.opacityNodes
        .transition()
        .style("fill-opacity", 0.2)
        .style("stroke-opacity", 0.2);
      this.opacityLinks.transition().style("stroke-opacity", 0);
      this.opacityTexts.transition().style("fill-opacity", 0);
    },
    mouseout() {
      if (!this.visMouseover) return;
      this.opacityNodes
        .transition()
        .delay(200)
        .style("fill-opacity", null)
        .style("stroke-opacity", null);
      this.opacityLinks
        .transition()
        .delay(200)
        .style("stroke-opacity", null);
      this.opacityTexts
        .transition()
        .delay(200)
        .style("fill-opacity", null);
    },
    test() {
      d3.json("./static/miserables.json")
        .then(res => {
          // console.log(res);
          // this.originalLinkData = res.links;
          this.load(res.nodes, res.links);
          this.update();
          this.bindEvents();
          console.log(this.$store.state.aaa);
        })
        .catch(err => {
          console.log(err);
        });
    }
  },
  computed: {},
  watch: {
    visBrush: function(val) {
      val
        ? this.brushG.style("display", "inline")
        : this.brushG.style("display", "none");
    },
    visShowIds: function(val) {
      val
        ? this.text.attr("display", "inline")
        : this.text.attr("display", "none");
    }
  }
};
</script>
<style>
line {
  stroke: #aaa;
  /*fill-opacity: 0.9;*/
}

circle {
  pointer-events: all;
  stroke: none;
  /*描边*/
  /*fill-opacity: 0.6;*/
}

circle.display {
  /**/
}

circle.selected {
  /* fill: red; */
  stroke: red;
  stroke-width: 1.5;
}

circle.saved {
  display: none;
}

circle.thumb {
}
</style>