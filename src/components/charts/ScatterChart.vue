<template>
  <div
    class="ScatterChart"
    :style="{margin:'5px',height:+this.chartHeight+5+'px',width:+this.chartWidth+5+2*200+'px'}"
  >
    <div style="float:left;">
      <svg
        :width="this.chartWidth"
        :height="this.chartHeight"
        :style="{border:'1px solid #305dff',background:this.backgroundColor}"
      >
        <defs>
          <filter id="shadow">
            <feDropShadow dx="0" dy="0" stdDeviation="0.3" />
          </filter>
        </defs>
      </svg>
    </div>
    <div :style="{float:'left',height:chartHeight+'px',margin:'0 5px',padding:'0 0 40px 0'}">
      <a-select
        showSearch
        placeholder="Select X Dimension"
        optionFilterProp="children"
        style="width: 160px"
        @focus="2"
        @blur="2"
        @change="2"
        :filterOption="filterOption"
      >
        <a-select-option
          v-for="i in 25"
          :key="(i + 9).toString(36) + i"
        >{{(i + 9).toString(36) + i}}</a-select-option>
      </a-select>
      <a-select
        showSearch
        placeholder="Select Y Dimension"
        optionFilterProp="children"
        style="width: 160px"
        @focus="2"
        @blur="2"
        @change="2"
        :filterOption="filterOption"
      >
        <a-select-option
          v-for="i in 25"
          :key="(i + 9).toString(36) + i"
        >{{(i + 9).toString(36) + i}}</a-select-option>
      </a-select>
    </div>
  </div>
</template>
<script>
import * as d3 from "d3";
// import { mapState } from "vuex";
// import * as _ from "lodash";
export default {
  name: "ScatterChart",
  props: {
    visClick: Boolean,
    visBrush: Boolean,
    visInvertBrush: Boolean,
    visDrag: Boolean,
    visMouseover: Boolean,
    visShowIds: Boolean,
    viewUpdate: false
  },
  data() {
    return {
      chartWidth: "960",
      chartHeight: "600",

      node: d3.selectAll(),
      nodeG: d3.selectAll(),
      linkData: [],
      nodeData: [],
      vis: d3.selectAll(),
      brushG: d3.selectAll(),
      opacityNodes: d3.selectAll(),
      opacityLinks: d3.selectAll(),
      opacityTexts: d3.selectAll(),
      text: d3.selectAll(),
      textG: d3.selectAll(),
      nodesNumber: 0,
      isDraging: false, // 区分click和drag等
      mousePoint: [], // 相对于原始坐标系
      // isBrushing:false,
      brushedNodes: d3.selectAll(),
      invertBrushedNodes: d3.selectAll()
    };
  },
  computed: {
    sourceData() {
      return this.$store.state.sourceData;
    },
    visualData() {
      return this.$store.state.visualData;
    },
    backgroundColor() {
      return this.$store.state.backgroundColor;
    },
    colorPalette() {
      return this.$store.state.colorPalette;
    },
    xDimension() {},
    yDimension() {}
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
    // console.log(svg);

    this.vis = svg.append("g");
    svg.call(d3.zoom().on("zoom", zoomed)).on("dblclick.zoom", null);

    //axis
    let x = d3.scaleOrdinal().domain([..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"]);
    let xAxisCreator = g =>
      g
        .attr("transform", "translate(0,650)")
        .call(d3.axisBottom(x));
    // .tickValues([..."AEIOUY"]);
    let xAxis = svg.append("g").call(xAxisCreator);
    // brush
    let brush = d3
      .brush()
      .extent([[0, 0], [+this.chartWidth, +this.chartHeight]])
      .on("start brush", this.brushed)
      .on("end", this.brushEnd);
    this.brushG = svg
      .append("g")
      .call(brush)
      .attr("class", "brush");
    // console.log(this.brushG);
    this.visBrush
      ? this.brushG.style("display", "inline")
      : this.brushG.style("display", "none");
    // invertBrush
    let invertBrush = d3
      .brush()
      .extent([[0, 0], [+this.chartWidth, +this.chartHeight]])
      .on("start brush", this.brushed)
      .on("end", this.invertBrushEnd);
    this.invertBrushG = svg
      .append("g")
      .call(invertBrush)
      .attr("class", "invertBrush");
    this.visInvertBrush
      ? this.invertBrushG.style("display", "inline")
      : this.invertBrushG.style("display", "none");

    // 初始化<g>，防止update()产生多个<g>
    this.linkG = this.vis.append("g").attr("class", "links");
    this.nodeG = this.vis.append("g").attr("class", "nodes");
    this.textG = this.vis.append("g").attr("class", "texts");
    this.visShowIds
      ? this.textG.style("display", "inline")
      : this.textG.style("display", "none");

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
        return !!d.group ? this.colorPalette[d.group] : this.colorPalette[3]; // FIXME 指定group
      };
      // this.load(nodeData, linkData);
      this.link = this.linkG
        .selectAll("line")
        .data(this.linkData)
        .join("line");

      this.node = this.nodeG
        .selectAll("circle")
        .data(this.nodeData)
        .join("circle")
        .attr("r", d => {
          return Math.sqrt(d.size) / 10 || 4.5;
        })
        .attr("class", "display")
        .attr("fill", color)
        .attr("filter", "url(#shadow)")
        .each(d => (d.attentionTimes = 0));
      // this.node.append("title").text(d => d.id);
      this.nodesNumber = this.node.size();

      this.text = this.textG
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

      this.bindEvents(); // 给显示的dom绑定元素
      this.$store.commit("updateViewUpdate", false);
      console.log("update!");
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
        // console.log(d3.event.type);
      }
    },
    brushed() {
      let transform = this.visTransform();
      let extent = d3.event.selection; // brush的一个事件
      let extentStart = transform.invert(extent[0]); // brush的开始坐标
      let extentEnd = transform.invert(extent[1]); // brush的结束坐标
      // console.log(extent);
      // console.log(this.vis.node());
      // console.log(d3.zoomTransform(this.vis.node()));
      if (d3.event.type === "start") {
      }

      let className = this.visBrush ? "brushing" : "invertBrushing";
      this.node.classed(className, d => {
        return (
          extentStart[0] <= d.x &&
          extentStart[1] <= d.y &&
          d.x <= extentEnd[0] &&
          d.y <= extentEnd[1]
        );
      });
    },
    brushEnd() {
      this.brushedNodes = this.nodeG.selectAll(".brushing");
      // console.log(this.brushedNodes);
      this.brushedNodes.classed("brushing", false).classed("selected", true);
      this.$store.commit("addOperation", {
        action: "brush",
        nodes: this.brushedNodes
      });
      console.log("brushEnd", this.brushedNodes);
    },
    invertBrushEnd() {
      this.invertBrushedNodes = this.nodeG.selectAll(".invertBrushing");
      this.invertBrushedNodes
        .classed("invertBrushing", false)
        .classed("selected", false);
      this.$store.commit("addOperation", {
        action: "invertBrush",
        nodes: this.invertBrushedNodes
      });
      console.log("invertBrushEnd", this.invertBrushedNodes);
    },
    dragstarted(d) {
      if (!this.visDrag) return;
      this.mousePoint = [d3.event.x, d3.event.y];
    },
    dragged(d, i, p) {
      if (!this.visDrag) return;
      d.x = d3.event.x;
      d.y = d3.event.y;
      d3.select(p[i])
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
      // console.log([d3.event.x,d3.event.y]);
      if (
        // 如果mousePoint没变过，则没有发生drag,当this.isDraging==false时判断
        !this.isDraging &&
        (this.mousePoint[0] !== d3.event.x || this.mousePoint[1] !== d3.event.y)
      ) {
        // console.log("computing !!");
        this.isDraging = true;
      }
    },
    dragended(d, i, p) {
      if (!this.visDrag) return;
      if (this.isDraging) {
        d.attentionTimes += 1;
        let t = d3.select(p[i]);
        this.$store.commit("addOperation", { action: "drag", nodes: t });
        this.isDraging = false;
        console.log("drag", t);
      }
    },
    clickSelect(d, i, p) {
      if (this.visClick) {
        let t = d3.select(p[i]);
        if (t.classed("selected")) {
          t.classed("selected", false);
        } else {
          t.classed("selected", true);
          d.attentionTimes += 1;
          this.$store.commit("addOperation", { action: "click", nodes: t });
          console.log("click", t);
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
      if (!this.isDraging) {
        d.attentionTimes += 1;
        this.$store.commit("addOperation", {
          action: "mouseover",
          nodes: displayNodes
        });
        console.log("mouseover", displayNodes);
      }
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
    filterOption(input, option) {
      return (
        option.componentOptions.children[0].text
          .toLowerCase()
          .indexOf(input.toLowerCase()) >= 0
      );
    },
    visTransform() {
      return d3.zoomTransform(this.vis.node());
    },
    test() {
      this.load(this.visualData);
      this.update();
    }
  },
  watch: {
    visBrush: function(val) {
      val
        ? this.brushG.style("display", "inline")
        : this.brushG.style("display", "none");
    },
    visInvertBrush: function(val) {
      val
        ? this.invertBrushG.style("display", "inline")
        : this.invertBrushG.style("display", "none");
    },
    visShowIds: function(val) {
      val
        ? this.textG.style("display", "inline")
        : this.textG.style("display", "none");
    },
    viewUpdate: function(val) {
      if (val) {
        this.test();
      }
    }
  }
};
</script>
<style>
.ScatterChart line {
  stroke: #aaa;
}
</style>