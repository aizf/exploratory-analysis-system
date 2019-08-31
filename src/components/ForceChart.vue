<template>
  <div class="ForceChart">
    <div style="float:left; margin:5px">
      <svg
        :width="this.chartWidth"
        :height="this.chartHeight"
        :style="{border:'1px solid #305dff'}"
      >
        <defs>
          <filter id="gaussian" width="2">
            <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur" />
            <feOffset in="blur" result="offsetBlur" />
            <feMerge>
              <feMergeNode in="offsetBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>
    </div>
    <div :style="{float:'left',height:chartHeight+'px',margin:'0 5px',padding:'0 0 40px 0'}">
      <a-slider
        vertical
        :min="0.01"
        :max="4.5"
        :step="0.01"
        v-model="linkStrength"
        :style="{margin:'0 0 10px 38px'}"
        @change="forceLinkChange"
      />
      <a-input-number
        :min="0.01"
        :max="4.5"
        :step="0.01"
        style="margin:0 0 0 0"
        v-model="linkStrength"
        :defaultValue="linkStrength"
        @change="forceLinkChange"
      />
    </div>
    <div :style="{float:'left',height:chartHeight+'px',margin:'0 5px',padding:'0 0 40px 0'}">
      <a-slider
        vertical
        :min="0"
        :max="3"
        :step="0.01"
        v-model="linkLength"
        :style="{margin:'0 0 10px 38px'}"
        @change="forceLinkChange"
      />
      <a-input-number
        :min="0"
        :max="3"
        :step="0.01"
        style="margin:0 0 0 0"
        v-model="linkLength"
        :defaultValue="linkLength"
        @change="forceLinkChange"
      />
    </div>
  </div>
</template>
<script>
import * as d3 from "d3";
// import { mapState } from "vuex";
// import * as _ from "lodash";
export default {
  name: "ForceChart",
  props: {
    visClick: Boolean,
    visBrush: Boolean,
    visDrag: Boolean,
    visMouseover: Boolean,
    visShowIds: Boolean,
    viewUpdate: false
  },
  data() {
    return {
      chartWidth: "960",
      chartHeight: "600",
      link: d3.selectAll(),
      node: d3.selectAll(),
      gLink: d3.selectAll(),
      gNode: d3.selectAll(),
      linkData: [],
      nodeData: [],
      vis: d3.selectAll(),
      simulation: {},
      brushG: d3.selectAll(),
      opacityNodes: d3.selectAll(),
      opacityLinks: d3.selectAll(),
      opacityTexts: d3.selectAll(),
      text: d3.selectAll(),
      gText: d3.selectAll(),
      linkStrength: 1,
      linkLength: 0
    };
  },

  mounted() {
    // console.log(d3.version);
    // console.log(_.VERSION);
    let that = this;
    console.log(this);
    console.log(d3);
    let svg = d3
      .select(this.$el)
      .select("svg")
      .attr("viewBox", [0, 0, +this.chartWidth, +this.chartHeight]);
    let width = +this.chartWidth,
      height = +this.chartHeight;
    // console.log(svg);

    this.vis = svg.append("g");
    svg.call(d3.zoom().on("zoom", zoomed));
    // this.vis
    //   .append("rect")
    //   .attr("width", width)
    //   .attr("height", height)
    //   .style("fill", "none")
    //   .style("pointer-events", "all");
    // console.log(this.vis);

    this.simulation = d3
      .forceSimulation()
      .force("link", d3.forceLink().id(d => d.id))
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(width / 2, height / 2));
    // console.log();

    // brush
    let brush = d3
      .brush()
      .extent([[0, 0], [width, height]])
      .on("start brush", this.brushed);
    this.brushG = svg
      .append("g")
      .call(brush)
      .attr("class", "brush")
      .call(brush.move, [[0, 0], [1, 1]]);
    // console.log(this.brushG);
    this.visBrush
      ? this.brushG.style("display", "inline")
      : this.brushG.style("display", "none");

    // 初始化为<g>，再指向selectAll()，防止update()产生多个<g>
    this.gLink = this.vis.append("g").attr("class", "links");
    this.gNode = this.vis.append("g").attr("class", "nodes");
    this.gText = this.vis.append("g").attr("class", "texts");
    this.visShowIds
      ? this.gText.attr("display", "inline")
      : this.gText.attr("display", "none");

    this.test();

    function zoomed() {
      that.vis.attr("transform", d3.event.transform);
      // console.log(this.vis);
    }
  },

  methods: {
    load(obj) {
      // 加载数据,后期拓展
      this.nodeData = obj.nodes;
      this.linkData = obj.links;
    },
    update() {
      // 更新数据
      let color = d => {
        const scale = d3.schemeSet2;
        return d.group ? scale[d.group] : scale[1]; // FIXME 指定group
      };
      // this.load(nodeData, linkData);
      this.link = this.gLink
        .selectAll("line")
        .data(this.linkData)
        .join("line");

      this.node = this.gNode
        .selectAll("circle")
        .data(this.nodeData)
        .join("circle")
        .attr("r", d => {
          return Math.sqrt(d.size) / 10 || 4.5;
        })
        .attr("class", "display")
        .attr("fill", color)
        .attr("filter", "url(#gaussian)");
      // this.node.append("title").text(d => d.id);

      this.text = this.gText
        .selectAll("text")
        .data(this.node.data())
        .join("text")
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
      // console.log("before simulation");
      // console.log(this.node);
      // console.log(this.simulation.nodes());
      this.simulation.nodes(this.node.data()).on("tick", this.ticked);
      this.simulation.force("link").links(this.link.data());
      // console.log("after simulation");
      // console.log(this.node);
      // console.log(this.simulation.nodes());
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
        // 将text接受的事件分发给node
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
      this.text.attr("x", d => d.x).attr("y", d => d.y);
      // if (this.visShowIds) {
      //   this.text.attr("x", d => d.x).attr("y", d => d.y);
      // }
    },
    brushed() {
      let transform = d3.zoomTransform(this.vis.node());
      let extent = d3.event.selection;
      let extentStart = transform.invert(extent[0]);
      let extentEnd = transform.invert(extent[1]);
      // console.log(extent);
      // console.log(this.vis.node());
      // console.log(d3.zoomTransform(this.vis.node()));
      this.node.classed("selected", d => {
        return (
          extentStart[0] <= d.x &&
          extentStart[1] <= d.y &&
          d.x <= extentEnd[0] &&
          d.y <= extentEnd[1]
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
      this.opacityTexts = this.text.filter(
        d => opacityIndex.find(val => val === d.index) !== undefined //!==undefined 防止返回0误认为false
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
    forceLinkChange() {
      // console.log(this.simulation.force("link").strength());
      // console.log(this.degreeArray);
      this.simulation.force("link").strength(link => {
        // console.log(link);
        return (
          // d3原生的函数乘上一个系数val
          this.linkStrength /
            Math.min(
              this.degreeArray[link.source.index],
              this.degreeArray[link.target.index]
            ) +
          this.linkLength
        );
      });
      this.simulation.alpha(0.15).restart();
    },
    test() {
      this.load(this.visualData);
      this.update();
      this.bindEvents();
      this.simulation.alpha(1).restart();
      this.$store.commit("updateViewUpdate", false);
      console.log("update!");
    }
  },
  computed: {
    sourceData() {
      return this.$store.state.sourceData;
    },
    visualData() {
      return this.$store.state.visualData;
    },
    degreeArray() {
      // 返回一个包含各个节点出入度的数组
      let nodes = this.simulation.nodes(),
        links = this.simulation.force("link").links();
      let n = nodes.length,
        m = links.length;

      let degree = new Array(n);
      // links包含source，target，nodes没有
      for (let link of links) {
        // console.log(link);
        degree[link.source.index] = (degree[link.source.index] || 0) + 1;
        degree[link.target.index] = (degree[link.target.index] || 0) + 1;
      }
      return degree;
    }
  },
  watch: {
    visBrush: function(val) {
      val
        ? this.brushG.style("display", "inline")
        : this.brushG.style("display", "none");
    },
    visShowIds: function(val) {
      val
        ? this.gText.attr("display", "inline")
        : this.gText.attr("display", "none");
    },
    viewUpdate: function(val) {
      if (val) {
        this.test(); // this.test();有问题 !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      }
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
  /* fill-opacity: 0.85; */
  /* filter:drop-shadow(-25px 25px 25px rgba(0, 243, 53, 0.7)); */
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