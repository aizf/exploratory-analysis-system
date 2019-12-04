<template>
  <div class="ForceChart">
    <div style>
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
    <div
      v-if="false"
      :style="{float:'left',height:chartHeight+'px',margin:'0 5px',padding:'0 0 40px 0'}"
    >
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
    <div
      v-if="false"
      :style="{float:'left',height:chartHeight+'px',margin:'0 5px',padding:'0 0 40px 0'}"
    >
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
import { mapState, mapGetters } from "vuex";
import * as d3 from "d3";
// import { mapState } from "vuex";
// import * as _ from "lodash";
export default {
  name: "ForceChart",
  props: {
    visClick: Boolean,
    visBrush: Boolean,
    brushKeep: Boolean,
    visInvertBrush: Boolean,
    visDrag: Boolean,
    visMouseover: Boolean,
    visZoom: Boolean,
    visShowIds: Boolean
  },
  data() {
    return {
      link: d3.selectAll(),
      node: d3.selectAll(),
      linkG: d3.selectAll(),
      nodeG: d3.selectAll(),
      vis: d3.selectAll(),
      simulation: {},
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
      linkStrength: 1,
      linkLength: 0,
      isDraging: false, // 区分click和drag等
      mousePoint: [] // 相对于原始坐标系
    };
  },
  computed: {
    ...mapState({
      sourceData: state => state.data.sourceData,
      visualData: state => state.data.visualData,
      datasets: state => state.data.datasets,
      isNewData: state => state.data.isNewData,

      chartWidth: state => state.view.dpiX * 0.7,
      chartHeight: state => state.view.dpiY * 0.7,
      colorPalette: state => state.view.colorPalette,
      backgroundColor: state => state.view.backgroundColor,
      parentUUID: state => state.view.parentUUID,
      currentUUID: state => state.view.currentUUID,

      currentOperations: state => state.analyze.currentOperations,
      undoStack: state => state.analyze.undoStack,
      redoStack: state => state.analyze.redoStack,
      rollbacked: state => state.analyze.rollbacked
    }),
    ...mapGetters([
      "nodes",
      "links",
      "nodesNumber",
      "generateUUID",
      "beforeEvent"
    ]),

    degreeArray() {
      // 返回一个包含各个节点出入度的数组
      let nodes = this.simulation.nodes(),
        links = this.simulation.force("link").links();
      let n = nodes.length,
        m = links.length;
      // console.log(n, m);
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
  mounted() {
    // console.log(d3.version);
    // console.log(_.VERSION);
    let that = this;
    console.log(this);
    console.log(d3);
    let svg = d3
      .select(this.$el)
      .select("svg")
      .attr("viewBox", [0, 0, this.chartWidth, this.chartHeight]);
    let width = this.chartWidth,
      height = this.chartHeight;
    // console.log(svg);

    this.vis = svg.append("g");
    svg
      .call(
        d3
          .zoom()
          .on("start", zoomStart)
          .on("zoom", zoomed)
          .on("end", zoomEnd)
      )
      .on("dblclick.zoom", null);

    this.simulation = d3
      .forceSimulation()
      .force("link", d3.forceLink().id(d => d.id || d.name))
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(width / 2, height / 2));
    // console.log();

    // brush
    this.brush = d3
      .brush()
      .extent([[0, 0], [width, height]])
      .on("start", this.brushStart)
      .on("brush", this.brushed)
      .on("end", this.brushEnd);
    this.brushG = svg
      .append("g")
      .call(this.brush)
      .attr("class", "brush");
    // console.log(this.brushG);

    // 使鼠标不能触发
    this.visBrush
      ? this.brushG.style("display", "inline")
      : this.brushG.style("display", "none");

    // invertBrush
    this.invertBrush = d3
      .brush()
      .extent([[0, 0], [width, height]])
      .on("start", this.brushStart)
      .on("brush", this.brushed)
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
    this.render();

    function zoomStart() {
      that.beforeEvent("zoom", that);
    }
    function zoomed() {
      if (!that.visZoom) return;
      let transform = d3.event.transform;
      that.vis.attr("transform", transform);
    }
    function zoomEnd() {
      if (!that.visZoom) return;
      let transform = d3.event.transform;
      let extentStart = transform.invert([0, 0]); // 视口的开始坐标
      let extentEnd = transform.invert([that.chartWidth, that.chartHeight]); // 视口的结束坐标
      let t = that.node.filter(d => {
        return (
          extentStart[0] <= d.x &&
          extentStart[1] <= d.y &&
          d.x <= extentEnd[0] &&
          d.y <= extentEnd[1]
        );
      });
      t.each(d => {
        d.attentionTimes += 1;
      });
      let operation = {
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
    this.node
      .classed("selected", d => d.selected)
      .attr("fill", d => this.colorPalette[d.group || 0]);
    this.simulation.tick();
  },

  deactivated() {
    this.simulation.stop();
  },

  methods: {
    changeData() {
      if (this.nodes.length === 0) {
        return;
      }
      // 更新数据
      let color = d => {
        return d.group ? this.colorPalette[d.group] : this.colorPalette[0]; // FIXME 指定group
      };
      // debugger;
      this.link = this.linkG
        .selectAll("line")
        .data(this.links)
        .join("line");
      this.link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      this.node = this.nodeG
        .selectAll("circle")
        .data(this.nodes)
        .join("circle")
        .attr("r", d => {
          let size = Math.sqrt(d.size) / 10;
          return size > 4.5 ? size : 4.5;
        })
        .attr("class", "display")
        .attr("fill", color)
        .attr("filter", "url(#shadow)")
        .classed("selected", d => d.selected);
      this.node.attr("cx", d => d.x).attr("cy", d => d.y);
    },
    render() {
      // 更新数据
      let color = d => {
        return d.group ? this.colorPalette[d.group] : this.colorPalette[0]; // FIXME 指定group
      };
      // debugger;
      this.link = this.linkG
        .selectAll("line")
        .data(this.links)
        .join("line");

      this.node = this.nodeG
        .selectAll("circle")
        .data(this.nodes)
        .join("circle")
        .attr("r", d => {
          let size = Math.sqrt(d.size) / 10;
          return size > 4.5 ? size : 4.5;
        })
        .attr("class", "display")
        .attr("fill", color)
        .attr("filter", "url(#shadow)")
        .classed("selected", d => d.selected);

      this.text = this.textG
        .selectAll("text")
        .data(this.nodes)
        .join("text")
        .attr("text-anchor", "middle")
        .attr("font-family", "Avenir")
        .attr("font-size", "10")
        .attr("dy", "-0.5em")
        .text(d => d.id || d.name)
        .attr("fill", color)
        .style("-webkit-user-select", "none") // 字体不被选中
        .style("-moz-user-select", "none")
        .style("-ms-user-select", "none")
        .style("user-select", "none");
      // console.log("before simulation");
      // console.log(this.node);
      // console.log(this.simulation.nodes());
      this.simulation
        .nodes(this.nodes)
        .on("tick", this.ticked)
        .on("end", this.tickEnd);
      this.simulation.force("link").links(this.links);
      // console.log("after simulation");
      // console.log(this.node);
      // console.log(this.simulation.nodes());
      this.bindEvents(); // 给显示的dom绑定元素
      this.simulation.alpha(1).restart(); // 更新数据后重新开始仿真
      console.log("render");
    },
    bindEvents() {
      // 更新后绑定事件
      let nodeDrag = d3
        .drag()
        .on("start", this.dragstarted)
        .on("drag", this.dragged)
        .on("end", this.dragended);
      this.node.call(nodeDrag);
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
    tickEnd() {
      // 静态布局
      // this.link
      //   .attr("x1", d => d.source.x)
      //   .attr("y1", d => d.source.y)
      //   .attr("x2", d => d.target.x)
      //   .attr("y2", d => d.target.y);
      // this.node.attr("cx", d => d.x).attr("cy", d => d.y);

      if (!this.visShowIds) {
        this.text.attr("x", d => d.x).attr("y", d => d.y);
      }
    },
    brushStart() {
      // 记录之前的状态
      // console.log(d3.event);
      // debugger
      if (d3.event.selection === null) return;
      this.beforeEvent(this.visBrush ? "brush" : "invertBrush", this);

      if (!this.brushKeep && this.visBrush) {
        this.node
          .classed("selected", false)
          .classed("brushing", false)
          .each(d => {
            d.selected = false;
          });
      }
    },
    brushed() {
      if (d3.event.selection === null) return;
      console.log("brushing");
      let extent = d3.event.selection; // brush的一个事件
      let transform = this.visTransform();
      let extentStart = transform.invert(extent[0]); // brush的开始坐标
      let extentEnd = transform.invert(extent[1]); // brush的结束坐标
      // console.log(transform);
      // console.log(extent);
      // console.log(this.vis.node());
      // console.log(d3.zoomTransform(this.vis.node()));

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
      if (d3.event.selection === null) return;
      console.log("brushed");
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
      let operation = {
        action: "brush",
        nodes: this.brushedNodes.nodes(),
        time: new Date()
      };
      this.$store.commit("addOperation", operation);
      this.$store.commit("addCurrentOperations", operation);
      console.log("brush", this.brushedNodes.nodes());
    },
    invertBrushEnd() {
      if (d3.event.selection === null) return;
      this.invertBrushedNodes = this.nodeG.selectAll(".invertBrushing");
      this.invertBrushedNodes
        .classed("invertBrushing", false)
        .classed("selected", false)
        .each(d => {
          d.selected = false;
        });
      let operation = {
        action: "invertBrush",
        nodes: this.invertBrushedNodes.nodes(),
        time: new Date()
      };
      this.$store.commit("addOperation", operation);
      this.$store.commit("addCurrentOperations", operation);
      console.log("invertBrush", this.invertBrushedNodes.nodes());
    },
    // drag
    dragstarted(d) {
      if (!this.visDrag) return;
      this.beforeEvent("drag", this);
      if (!d3.event.active) this.simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
      this.mousePoint = [d3.event.x, d3.event.y];
    },
    dragged(d) {
      if (!this.visDrag) return;
      d.fx = d3.event.x;
      d.fy = d3.event.y;
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
      if (!d3.event.active) this.simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
      if (this.isDraging) {
        d.attentionTimes += 1;
        // drag <text>时，通过以下返回node
        let t = this.node.filter(dd => dd.index === d.index);
        let operation = {
          action: "drag",
          nodes: t.nodes(),
          time: new Date()
        };
        this.$store.commit("addOperation", operation);
        this.$store.commit("addCurrentOperations", operation);
        this.isDraging = false;
        console.log("drag", t.nodes());
        t.dispatch("mouseout");
      }
    },
    clickSelect(d, i, p) {
      if (this.visClick) {
        this.beforeEvent("click", this);
        let t = d3.select(p[i]);
        if (t.classed("selected")) {
          t.classed("selected", false);
          d.selected = false;
        } else {
          t.classed("selected", true);
          d.selected = true;
          d.attentionTimes += 1;
          let operation = {
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
      if (!this.visMouseover || this.isDraging) return;
      this.beforeEvent("mouseover", this);
      let displayNodes = null;
      // let opacityNodes = null;
      let displayLinks = null;
      // let opacityLinks = null;
      if (!(d.id || d.name)) {
        throw new Error(`object do not has "id" or "name"`);
      }
      let id = d.id ? "id" : "name";
      let thisId = d[id];
      // console.log(thisId);
      this.opacityLinks = this.link.filter(d => {
        return d.source[id] !== thisId && d.target[id] !== thisId;
      });
      displayLinks = this.link.filter(d => {
        return d.source[id] === thisId || d.target[id] === thisId;
      });
      this.opacityNodes = this.node.filter(d => {
        // console.log("d",d);
        let displayLinksData = displayLinks.data();
        for (let i in displayLinksData) {
          // console.log(i);
          if (
            d[id] === displayLinksData[i].source[id] ||
            d[id] === displayLinksData[i].target[id]
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
            d[id] === displayLinksData[i].source[id] ||
            d[id] === displayLinksData[i].target[id]
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
        displayNodes.each(d => {
          d.attentionTimes += 1;
        });
        let operation = {
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
      if (!this.visMouseover || this.isDraging) return;
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
      // 调整Link力的布局函数
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
    visTransform() {
      return d3.zoomTransform(this.vis.node());
    },
    test() {}
  },
  watch: {
    isNewData: function(val) {
      console.log("watch1", this.isNewData);
      if (val) {
        console.log("isNewData", this.isNewData);
        console.log("visualData",this.visualData);
        this.render();
        this.$store.commit("updateIsNewData", false);
      }
    },
    visualData: function(val) {
      console.log("watch2", this.isNewData);
      this.changeData();
    },
    visBrush: function(val) {
      val
        ? this.brushG.style("display", "inline")
        : (this.brushG.style("display", "none"), this.brush.clear(this.brushG));
    },
    visInvertBrush: function(val) {
      val
        ? this.invertBrushG.style("display", "inline")
        : (this.invertBrushG.style("display", "none"),
          this.invertBrush.clear(this.invertBrushG));
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
.ForceChart line {
  stroke: #aaa;
  stroke-opacity: 0.8;
  stroke-width: 0.3;
}

.ForceChart circle {
  pointer-events: all;
  stroke: none;
  /*描边*/
  /* fill-opacity: 0.85; */
  /* filter:drop-shadow(-25px 25px 25px rgba(0, 243, 53, 0.7)); */
}

.ForceChart circle.display {
  /**/
}

.ForceChart circle.selected {
  /* fill: red; */
  stroke: red;
  stroke-width: 0.8;
}

.ForceChart circle.brushing {
  /* fill: red; */
  stroke: red;
  stroke-width: 0.8;
}

.ForceChart circle.invertBrushing {
  stroke: none;
  stroke-width: 0px;
}
</style>