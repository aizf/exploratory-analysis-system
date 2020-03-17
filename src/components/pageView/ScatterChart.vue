<template>
  <div
    class="ScatterChart"
    :style="{margin:'5px',height:chartHeight+5+'px',width:chartWidth+5+2*200+'px'}"
  >
    <div style="float:left;">
      <svg
        :width="chartWidth"
        :height="chartHeight"
        :style="{border:'1px solid #305dff',background:backgroundColor}"
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
        placeholder="Select X Field"
        optionFilterProp="children"
        style="width: 160px"
        @change="xDimensionChange"
        :filterOption="filterOption"
      >
        <a-select-option v-for="i in nodeFields" :key="i">{{i}}</a-select-option>
      </a-select>
      <a-select
        showSearch
        placeholder="Select Y Field"
        optionFilterProp="children"
        style="width: 160px"
        @change="yDimensionChange"
        :filterOption="filterOption"
      >
        <a-select-option v-for="i in nodeFields" :key="i">{{i}}</a-select-option>
      </a-select>
    </div>
  </div>
</template>
<script>
import Vue from "vue";
import { Select } from "ant-design-vue";
Vue.use(Select);
import store from "@/store/";
import { mapState, mapGetters } from "vuex";
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
    visZoom: Boolean,
    visShowIds: Boolean
  },
  data() {
    return {
      axisMargin: 50,
      xDimension: "", // x轴选择的维度,key,字符串,数据在computed中
      yDimension: "",
      node: d3.selectAll(),
      nodeG: d3.selectAll(),
      vis: d3.selectAll(),
      xAxis: d3.selectAll(),
      yAxis: d3.selectAll(),
      xScale: {},
      yScale: {},
      brush: {},
      invertBrush: {},
      brushG: d3.selectAll(),
      invertBrushG: d3.selectAll(),
      brushedNodes: d3.selectAll(),
      invertBrushedNodes: d3.selectAll(),
      opacityNodes: d3.selectAll(),
      opacityLinks: d3.selectAll(),
      opacityTexts: d3.selectAll(),
      text: d3.selectAll(),
      textG: d3.selectAll(),
      isDraging: false, // 区分click和drag等
      mousePoint: [] // 相对于原始坐标系
    };
  },
  computed: {
    ...mapState({
      sourceData: state => state.data.sourceData,
      visualData: state => state.data.visualData,
      // datasets: state => state.data.datasets,

      chartWidth: state => state.view.dpiX * 0.7,
      chartHeight: state => state.view.dpiY * 0.7,
      colorPalette: state => state.view.colorPalette,
      backgroundColor: state => state.view.backgroundColor,
      parentUUID: state => state.view.parentUUID,
      currentUUID: state => state.view.currentUUID,
      needUpdate: state => state.view.chartsNeedUpdate.scatter,

      currentOperations: state => state.analyze.currentOperations
    }),
    ...mapGetters([
      "nodes",
      "links",
      "nodesNumber",
      "nodeFields",
      "generateUUID"
    ]),

    xDimensionData() {
      // 断绝了数据与节点的关联性，仅当作坐标刻度用
      return this.nodes
        .map(i => i[this.xDimension])
        .sort((a, b) => {
          // 该比较函数需要返回数值
          // a全为数字则相减，否则比较大小
          return isNaN(a) || isNaN(b) ? (a > b ? 1 : -1) : a - b;
        });
    },
    yDimensionData() {
      //
      return this.nodes
        .map(i => i[this.yDimension])
        .sort((a, b) => {
          // 该比较函数需要返回数值
          // a全为数字则相减，否则比较大小
          return isNaN(a) || isNaN(b) ? (a > b ? 1 : -1) : a - b;
        });
    }
  },
  mounted() {
    // console.log(d3.version);
    // console.log(_.VERSION);
    const that = this;
    console.log(this);
    console.log(d3);
    const svg = d3
      .select(this.$el)
      .select("svg")
      .attr("viewBox", [0, 0, this.chartWidth, this.chartHeight]);
    // console.log(svg);

    this.vis = svg
      .append("g")
      .attr(
        "transform",
        "translate(" + this.axisMargin + "," + this.axisMargin + ")"
      );
    svg
      .call(
        d3
          .zoom()
          .translateExtent([
            [-this.axisMargin, -this.axisMargin],
            [Infinity, Infinity]
          ])
          .on("zoom", zoomed)
          .on("end", zoomEnd)
      )
      .on("dblclick.zoom", null);

    //axis
    this.xAxis = this.vis.append("g");
    this.yAxis = this.vis.append("g");

    // brush
    this.brush = d3
      .brush()
      .extent([
        [0, 0],
        [this.chartWidth, this.chartHeight]
      ])
      .on("start brush", this.brushed)
      .on("end", this.brushEnd);
    this.brushG = svg
      .append("g")
      .call(this.brush)
      .attr("class", "brush");
    // console.log(this.brushG);
    this.visBrush
      ? this.brushG.style("display", "inline")
      : this.brushG.style("display", "none");
    // invertBrush
    this.invertBrush = d3
      .brush()
      .extent([
        [0, 0],
        [this.chartWidth, this.chartHeight]
      ])
      .on("start brush", this.brushed)
      .on("end", this.invertBrushEnd);
    this.invertBrushG = svg
      .append("g")
      .call(this.invertBrush)
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

    function zoomed() {
      if (!that.visZoom) return;
      const transform = d3.event.transform.translate(
        that.axisMargin,
        that.axisMargin
      );
      that.vis.attr("transform", transform);
    }
    function zoomEnd() {
      if (!that.visZoom) return;
      const transform = d3.event.transform.translate(
        that.axisMargin,
        that.axisMargin
      );
      const extentStart = transform.invert([0, 0]); // 视口的开始坐标
      const extentEnd = transform.invert([that.chartWidth, that.chartHeight]); // 视口的结束坐标
      const t = that.node.filter(d => {
        return (
          extentStart[0] <= d.xx &&
          extentStart[1] <= d.yy &&
          d.xx <= extentEnd[0] &&
          d.yy <= extentEnd[1]
        );
      });
      t.each(d => {
        d.attentionTimes += 1;
      });
      const operation = {
        action: "zoom",
        nodes: t.nodes(),
        time: new Date()
      };
      that.$store.commit("addOperation", operation);
      that.$store.commit("addCurrentOperations", operation);
      console.log("zoom", t.nodes());
    }
  },

  activated() {
    if (this.needUpdate) {
      this.update();
      store.commit("ScatterUpdated");
    }
  },

  methods: {
    update() {
      // 更新数据
      const that = this;
      const color = d => {
        return d.group ? this.colorPalette[d.group] : this.colorPalette[8];
      };
      const xTicksNum = this.xDimensionData.length || 0;
      this.xScale = d3
        .scaleOrdinal()
        .domain(this.xDimensionData)
        .range(
          // ticks
          d3.range(xTicksNum).map(function(d) {
            return (d * that.chartWidth) / xTicksNum;
          })
        );
      // let xAxisCreator = g => g.call(d3.axisTop(x));
      this.xAxis.call(d3.axisTop(this.xScale));

      const yTicksNum = this.yDimensionData.length || 0;
      this.yScale = d3
        .scaleOrdinal()
        .domain(this.yDimensionData)
        .range(
          // ticks
          d3.range(yTicksNum).map(d => (d * +this.chartHeight) / yTicksNum)
        );
      // let yAxisCreator = g => g.call(d3.axisLeft(y));
      this.yAxis.call(d3.axisLeft(this.yScale));

      this.link = this.linkG
        .selectAll("line")
        .data(this.links)
        .join("line");

      this.node = this.nodeG
        .selectAll("circle")
        .data(this.nodes)
        .join("circle")
        .attr("r", d => {
          return Math.sqrt(d.size) / 10 || 4.5;
        })
        .attr("class", "display")
        .attr("fill", color)
        .attr("filter", "url(#shadow)")
        .attr("cx", d => {
          d.xx = this.xScale(d[this.xDimension]);
          return d.xx;
        })
        .attr("cy", d => {
          d.yy = this.yScale(d[this.yDimension]);
          return d.yy;
        })
        .classed("selected", d => d.selected);
      // this.node.append("title").text(d => d.id);

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
        .attr("x", d => d.xx)
        .attr("y", d => d.yy)
        .style("-webkit-user-select", "none") // 字体不被选中
        .style("-moz-user-select", "none")
        .style("-ms-user-select", "none")
        .style("user-select", "none");

      this.bindEvents(); // 给显示的dom绑定元素
    },
    bindEvents() {
      // 更新后绑定事件
      // this.node.call(
      //   d3
      //     .drag()
      //     .on("start", this.dragstarted)
      //     .on("drag", this.dragged)
      //     .on("end", this.dragended)
      // );
      this.node.on("click", this.clickSelect);
      this.node.on("mouseover", this.mouseover);
      this.node.on("mouseout", this.mouseout);
      const node = this.node;

      // this.text.call(
      //   d3
      //     .drag()
      //     .on("start", this.dragstarted)
      //     .on("drag", this.dragged)
      //     .on("end", this.dragended)
      // );
      this.text.on("click", textEvent2Node);
      this.text.on("mouseover", textEvent2Node);
      this.text.on("mouseout", textEvent2Node);

      function textEvent2Node(d) {
        // 将text接受的事件分发给node
        const theIndex = d.index;
        const theNode = node.filter(d => d.index === theIndex);
        theNode.dispatch(d3.event.type);
        // console.log(d3.event.type);
      }
    },
    brushed() {
      if (d3.event.selection === null) return;
      const transform = this.visTransform().translate(
        this.axisMargin,
        this.axisMargin
      );
      const extent = d3.event.selection; // brush的一个事件
      const extentStart = transform.invert(extent[0]); // brush的开始坐标
      const extentEnd = transform.invert(extent[1]); // brush的结束坐标
      // console.log(extent);
      // console.log(this.vis.node());
      // console.log(d3.zoomTransform(this.vis.node()));
      // if (d3.event.type === "start") {
      //   null;
      // }

      const className = this.visBrush ? "brushing" : "invertBrushing";
      this.node.classed(className, d => {
        return (
          extentStart[0] <= d.xx &&
          extentStart[1] <= d.yy &&
          d.xx <= extentEnd[0] &&
          d.yy <= extentEnd[1]
        );
      });
    },
    brushEnd() {
      if (d3.event.selection === null) return;
      this.brushedNodes = this.nodeG.selectAll(".brushing");
      // console.log(this.brushedNodes);
      this.brushedNodes
        .classed("brushing", false)
        .classed("selected", true)
        .each(d => {
          d.selected = true;
        });
      this.brushedNodes.each(d => {
        d.attentionTimes += 1;
      });
      const operation = {
        action: "brush",
        nodes: this.brushedNodes.nodes(),
        time: new Date()
      };
      this.$store.commit("addOperation", operation);
      this.$store.commit("addCurrentOperations", operation);
      console.log("brushEnd", this.brushedNodes.nodes());
    },
    invertBrushEnd() {
      this.invertBrushedNodes = this.nodeG.selectAll(".invertBrushing");
      this.invertBrushedNodes
        .classed("invertBrushing", false)
        .classed("selected", false)
        .each(d => {
          d.selected = false;
        });
      const operation = {
        action: "invertBrush",
        nodes: this.invertBrushedNodes.nodes(),
        time: new Date()
      };
      this.$store.commit("addOperation", operation);
      this.$store.commit("addCurrentOperations", operation);
      console.log("invertBrushEnd", this.invertBrushedNodes.nodes());
    },
    dragstarted(d) {
      if (!this.visDrag) return;
      this.mousePoint = [d3.event.x, d3.event.y];
    },
    dragged(d, i, p) {
      if (!this.visDrag) return;
      // console.log(d3.event.x);
      // console.log(d.xx);
      d.xx = d3.event.x;
      d.yy = d3.event.y;
      // console.log(d.xx,d.yy);
      d3.select(p[i])
        .attr("cx", d.xx)
        .attr("cy", d.yy);
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
        const t = d3.select(p[i]);
        const operation = {
          action: "drag",
          nodes: t.nodes(),
          time: new Date()
        };
        this.$store.commit("addOperation", operation);
        this.$store.commit("addCurrentOperations", operation);
        this.isDraging = false;
        console.log("drag", t.nodes());
      }
    },
    clickSelect(d, i, p) {
      if (this.visClick) {
        const t = d3.select(p[i]);
        if (t.classed("selected")) {
          t.classed("selected", false);
          d.selected = false;
        } else {
          t.classed("selected", true);
          d.selected = true;
          d.attentionTimes += 1;
          const operation = {
            action: "click",
            nodes: t.nodes(),
            time: new Date()
          };
          this.$store.commit("addOperation", operation);
          this.$store.commit("addCurrentOperations", operation);
          console.log("click", t.nodes());
        }
      }
    },
    mouseover(d) {
      if (!this.visMouseover) return;
      let displayNodes = null;
      // let opacityNodes = null;
      let displayLinks = null;
      // let opacityLinks = null;
      const thisId = d.id;
      // console.log(thisId);
      this.opacityLinks = this.link.filter(d => {
        return d.source.id !== thisId && d.target.id !== thisId;
      });
      displayLinks = this.link.filter(d => {
        return d.source.id === thisId || d.target.id === thisId;
      });
      this.opacityNodes = this.node.filter(d => {
        // console.log("d",d);
        const displayLinksData = displayLinks.data();
        for (const i in displayLinksData) {
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
        const displayLinksData = displayLinks.data();
        for (const i in displayLinksData) {
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

      const opacityIndex = this.opacityNodes.data().map(val => val.index);
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
        const operation = {
          action: "mouseover",
          nodes: displayNodes.nodes(),
          time: new Date()
        };
        this.$store.commit("addOperation", operation);
        this.$store.commit("addCurrentOperations", operation);
        console.log("mouseover", displayNodes.nodes());
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
    xAxisTransform() {
      // bug???
      return d3.zoomTransform(this.xAxis.node());
    },
    yAxisTransform() {
      // bug???
      return d3.zoomTransform(this.yAxis.node());
    },
    xDimensionChange(option) {
      this.xDimension = option;
      this.update();
      // console.log(this.xDimensionData);
    },
    yDimensionChange(option) {
      this.yDimension = option;
      this.update();
      // console.log(this.yDimensionData);
    },
    test() {
      this.update();
    }
  },
  watch: {
    visBrush: function(val) {
      val
        ? (this.brushG.style("display", "inline"),
          this.brush.clear(this.brushG))
        : this.brushG.style("display", "none");
    },
    visInvertBrush: function(val) {
      val
        ? (this.invertBrushG.style("display", "inline"),
          this.invertBrush.clear(this.invertBrushG))
        : this.invertBrushG.style("display", "none");
    },
    visShowIds: function(val) {
      val
        ? this.textG.style("display", "inline")
        : this.textG.style("display", "none");
    }
  }
};
</script>
<style>
.ScatterChart .tick line {
  stroke: #aaa;
}

.ScatterChart .tick text {
  fill: #aaa;
}

.ScatterChart path {
  stroke: #aaa;
}

.ScatterChart circle.selected {
  /* fill: red; */
  stroke: red;
  stroke-width: 1.5;
}

.ScatterChart circle.brushing {
  /* fill: red; */
  stroke: red;
  stroke-width: 1.5;
}

.ScatterChart circle.invertBrushing {
  stroke: none;
  stroke-width: 0px;
}
</style>