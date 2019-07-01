<template>
  <svg :width="this.chartWidth" :height="this.chartHeight" :style="{border:'1px solid #305dff'}"></svg>
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
    visMouseover: Boolean
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
      opacityLinks: d3.selectAll()
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
      .force(
        "link",
        d3.forceLink().id(function(d) {
          return d.id;
        })
      )
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

    this.test();
  },

  methods: {
    load(nodeData, linkData) {
      this.nodeData = nodeData;
      this.linkData = linkData;
    },
    update(nodeData, linkData) {
      let color = function(d) {
        const scale = d3.schemeSet2;
        return scale[d.group]; // FIXME 指定group
      };
      this.load(nodeData, linkData);
      this.link = this.vis
        .append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(this.linkData)
        .enter()
        .append("line");

      // this.originalNode =
      this.node = this.vis
        .append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(this.nodeData)
        .enter()
        .append("circle")
        .attr("r", 4)
        .attr("class", "display")
        .attr("fill", color);
      // this.node.append("title").text(d => d.id);
      this.node.append("text")
      .attr("dy", "0.31em")
      .attr("dx", "0.31em")
      .attr("text-anchor", "end")
      .text(d => d.id);
      // .text(d => d.data.name);
      // this.node.append("title").text(function(d) {
      //   return d.id; // FIXME 指定id
      // });

      this.simulation.nodes(this.node.data()).on("tick", this.ticked);
      this.simulation.force("link").links(this.link.data());
    },
    ticked() {
      this.link
        .attr("x1", function(d) {
          return d.source.x;
        })
        .attr("y1", function(d) {
          return d.source.y;
        })
        .attr("x2", function(d) {
          return d.target.x;
        })
        .attr("y2", function(d) {
          return d.target.y;
        });

      this.node
        .attr("cx", function(d) {
          return d.x;
        })
        .attr("cy", function(d) {
          return d.y;
        });
    },
    brushed() {
      var extent = d3.event.selection;
      this.node.classed("selected", function(d) {
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
      var thisId = d.id;
      // console.log(thisId);
      this.opacityLinks = this.link.filter(function(d) {
        return d.source.id !== thisId && d.target.id !== thisId;
      });
      displayLinks = this.link.filter(function(d) {
        return d.source.id === thisId || d.target.id === thisId;
      });
      this.opacityNodes = this.node.filter(function(d) {
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
      displayNodes = this.node.filter(function(d) {
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

      this.opacityNodes
        .transition()
        .style("fill-opacity", 0)
        .style("stroke-opacity", 0);
      this.opacityLinks.transition().style("stroke-opacity", 0);
      // displayNodes
      //   .append("text")
      //   .attr("x", 6)
      //   .attr("dy", "0.31em")
      //   .text(d => d.id)
      //   .clone(true)
      //   .lower()
      //   .attr("text-anchor", "end")
      //   .attr("stroke", "white");
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
      // displayNodes.selectAll("text").remove();
    },
    test() {
      d3.json("./static/miserables.json")
        .then(res => {
          // console.log(res);
          // this.originalLinkData = res.links;
          this.update(res.nodes, res.links);

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