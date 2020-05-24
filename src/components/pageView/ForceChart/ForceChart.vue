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
        <text
          :x="0"
          :y="0"
          dx="0.5em"
          dy="1.5em"
          :fill="contrastColor"
          text-anchor="start"
          font-family="Avenir"
          font-size="10"
          style="user-select: none;"
        >UUID : {{currentUUID}}</text>
        <text
          :x="0"
          :y="0"
          dx="0.5em"
          dy="3.0em"
          :fill="contrastColor"
          text-anchor="start"
          font-family="Avenir"
          font-size="10"
          style="user-select: none;"
        >Nodes : {{nodesNumber}}</text>
        <text
          :x="0"
          :y="0"
          dx="0.5em"
          dy="4.5em"
          :fill="contrastColor"
          text-anchor="start"
          font-family="Avenir"
          font-size="10"
          style="user-select: none;"
        >Edges : {{linksNumber}}</text>
        <g>
          <g class="links">
            <line
              v-for="link in links"
              :class="{link:true,'mouseover_opacity':!link.mouseover_show}"
              :x1="link.source.x"
              :y1="link.source.y"
              :x2="link.target.x"
              :y2="link.target.y"
              :style="{stroke:chartOption.link.color,'stroke-width':fixedLinkWidth}"
              :key="link.uid"
            />
          </g>
          <g class="nodes">
            <circle
              v-for="node in nodes"
              :class="{node:true, 'display':true,'selected':node.selected,'mouseover_opacity':!node.mouseover_show,'brushing':node.brushing,'invertBrushing':node.invertBrushing}"
              filter="url(#shadow)"
              @click="clickSelect(node)"
              @mouseover="mouseover(node)"
              @mouseout="mouseout"
              :style="{r:fixedNodeSize,cx:node.x,cy:node.y,fill:classificationPalette[node.group || 0]}"
              :key="node.uid"
            />
          </g>
          <g class="texts" v-show="visShowIds">
            <text
              v-for="node in nodes"
              :class="{text:true,'mouseover_opacity':!node.mouseover_show}"
              :x="node.x"
              :y="node.y"
              dy="-0.8em"
              @click="clickSelect(node)"
              @mouseover="mouseover(node)"
              @mouseout="mouseout"
              :style="{'font-size':10,fill:classificationPalette[node.group || 0]}"
              :key="node.uid"
            >{{node.id}}</text>
          </g>
        </g>
      </svg>
    </div>
  </div>
</template>
<script>
import Vue from "vue";
import { InputNumber, Slider } from "ant-design-vue";
Vue.use(InputNumber);
Vue.use(Slider);
import store from "@/store/";
import { mapState, mapGetters } from "vuex";
import * as d3 from "d3";
import throttle from "lodash/throttle";
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
    visShowIds: Boolean,
    chartOption: Object
  },
  data() {
    return {
      linkG: d3.selectAll(),
      nodeG: d3.selectAll(),
      textG: d3.selectAll(),
      vis: d3.selectAll(),
      simulation__: {},
      drag__: {},
      brush: {},
      invertBrush: {},
      brushG: d3.selectAll(),
      invertBrushG: d3.selectAll(),
      opacityNodes: d3.selectAll(),
      opacityLinks: d3.selectAll(),
      opacityTexts: d3.selectAll(),
      isDraging: false, // 区分click和drag等
      mousePoint: [], // 相对于原始坐标系
      transform: { k: 1, x: 0, y: 0 }
    };
  },
  computed: {
    ...mapState({
      sourceData: state => state.data.sourceData,
      visualData: state => state.data.visualData,
      // datasets: state => state.data.datasets,

      chartWidth: state => state.view.dpiX * 0.6,
      chartHeight: state => state.view.dpiY * 0.7,
      classificationPalette: state => state.view.classificationPalette,
      backgroundColor: state => state.view.backgroundColor,
      contrastColor: state => state.view.contrastColor,
      parentUUID: state => state.view.parentUUID,
      currentUUID: state => state.view.currentUUID,
      needUpdate: state => state.view.chartsNeedUpdate.force,

      currentOperations: state => state.analyze.currentOperations,
      rollbacked: state => state.analyze.rollbacked
    }),
    ...mapGetters([
      "nodes",
      "links",
      "nodesNumber",
      "linksNumber",
      "generateUUID",
      "beforeEvent"
    ]),

    link() {
      let link = this.linkG.selectAll("line");
      link.data(this.links);
      return link;
    },
    node() {
      let node = this.nodeG.selectAll("circle");
      node.data(this.nodes);
      return node;
    },
    text() {
      let text = this.textG.selectAll("text");
      text.data(this.nodes);
      return text;
    },
    simulation() {
      let simulation = this.simulation__;
      simulation.nodes(this.nodes);
      simulation
        .force("link")
        .links(this.links)
        .distance(this.chartOption.link.distance);
      simulation.force("charge").strength(this.chartOption.node.chargeForce);
      return simulation;
    },
    fixedNodeSize() {
      return this.chartOption.node.nodeSize / this.transform.k;
    },
    fixedLinkWidth() {
      return this.chartOption.link.width / this.transform.k;
    },

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
        degree[link.source.uid] = (degree[link.source.uid] || 0) + 1;
        degree[link.target.uid] = (degree[link.target.uid] || 0) + 1;
      }
      return degree;
    }
  },
  created() {
    this.simulation__ = d3
      .forceSimulation()
      .force(
        "link",
        d3.forceLink().id(d => d.id || d.name)
      )
      .force("charge", d3.forceManyBody())
      .force(
        "center",
        d3.forceCenter(this.chartWidth / 2, this.chartHeight / 2)
      );
    this.drag__ = d3
      .drag()
      .on("start", this.dragstarted)
      .on("drag", this.dragged())
      .on("end", this.dragended);
  },
  mounted() {
    // console.log(d3.version);
    // console.log(_.VERSION);
    const that = this;
    console.log("ForceChart", this);
    console.log(d3);
    const svg = d3
      .select(this.$el)
      .select("svg")
      .attr("viewBox", [0, 0, this.chartWidth, this.chartHeight]);
    const width = this.chartWidth,
      height = this.chartHeight;
    // console.log("svg", svg);

    this.vis = svg.select("g");
    svg
      .call(
        d3
          .zoom()
          .on("start", zoomStart)
          .on("zoom", zoomed)
          .on("end", zoomEnd)
      )
      .on("dblclick.zoom", null);

    // brush
    this.brush = d3
      .brush()
      .extent([
        [0, 0],
        [width, height]
      ])
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
      .extent([
        [0, 0],
        [width, height]
      ])
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

    function zoomStart() {
      that.beforeEvent("zoom", that);
    }
    function zoomed() {
      if (!that.visZoom) return;
      let transform = d3.event.transform;
      that.vis.attr("transform", transform);
      that.transform.k = transform.k;
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
      console.log("zoom");
    }

    // mounted---nextTick
    this.$nextTick(function() {
      // 初始化<g>，防止update()产生多个<g>
      this.linkG = this.vis.select("g.links");
      this.nodeG = this.vis.select("g.nodes");
      this.textG = this.vis.select("g.texts");

      this.node.call(this.drag__);
      this.text.call(this.drag__);
    });
  },
  updated() {
    this.node.call(this.drag__);
    this.text.call(this.drag__);
  },
  activated() {
    if (this.needUpdate) {
      this.render();
      store.commit("ForceUpdated");
    }
  },

  deactivated() {
    // this.simulation.stop();
  },

  methods: {
    render() {
      // 重新渲染图标
      if (this.nodes.length === 0) {
        return;
      }
      // debugger;
      this.transform.k = 1;
      this.transform.x = 0;
      this.transform.y = 0;
      let t = this.visTransform();
      t.x = 0;
      t.y = 0;
      t.k = 1;
      this.vis.attr("transform", t);

      // .join("text")
      // .attr("text-anchor", "middle")
      // .attr("font-family", "Avenir")
      // .attr("font-size", "10")
      // .attr("dy", "-0.5em")
      // .text(d => d.id || d.name)
      // .attr("fill", color)
      // .style("-webkit-user-select", "none") // 字体不被选中
      // .style("-moz-user-select", "none")
      // .style("-ms-user-select", "none")
      // .style("user-select", "none");
      // console.log("before simulation");
      // console.log(this.node);
      // console.log(this.simulation.nodes());
      // this.simulation.nodes(this.nodes);
      // this.simulation.on("tick", this.ticked).on("end", this.tickEnd);
      // this.simulation.force("link").links(this.links);
      // console.log("after simulation");
      // console.log(this.node);
      // console.log(this.simulation.nodes());
      this.bindEvents(); // 给显示的dom绑定元素
      this.simulation.alpha(1).restart(); // 更新数据后重新开始仿真
      console.log("render");
    },
    bindEvents() {
      // 更新后绑定事件
      // let nodeDrag = d3
      //   .drag()
      //   .on("start", this.dragstarted)
      //   .on("drag", this.dragged())
      //   .on("end", this.dragended);
      this.node.call(
        d3
          .drag()
          .on("start", this.dragstarted)
          .on("drag", this.dragged())
          .on("end", this.dragended)
      );
      // this.node.on("click", this.clickSelect);
      // this.node.on("mouseover", this.mouseover);
      // this.node.on("mouseout", this.mouseout);
      let node = this.node;

      this.text.call(
        d3
          .drag()
          .on("start", this.dragstarted)
          .on("drag", this.dragged())
          .on("end", this.dragended)
      );
      // this.text.on("click", textEvent2Node);
      // this.text.on("mouseover", textEvent2Node);
      // this.text.on("mouseout", textEvent2Node);

      function textEvent2Node(d) {
        // 将text接受的事件分发给node
        let theUid = d.uid;
        let theNode = node.filter(d => d.uid === theUid);
        theNode.dispatch(d3.event.type);
        // console.log(d3.event.type);
      }
    },
    ticked() {
      // this.link
      //   .attr("x1", d => d.source.x)
      //   .attr("y1", d => d.source.y)
      //   .attr("x2", d => d.target.x)
      //   .attr("y2", d => d.target.y);
      // this.node.attr("cx", d => d.x).attr("cy", d => d.y);
      // if (this.visShowIds) {
      //   this.text.attr("x", d => d.x).attr("y", d => d.y);
      // }
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
        this.nodes.forEach(d => {
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

      let type = this.visBrush ? "brushing" : "invertBrushing";
      this.nodes.forEach(node => {
        extentStart[0] <= node.x &&
        extentStart[1] <= node.y &&
        node.x <= extentEnd[0] &&
        node.y <= extentEnd[1]
          ? (node[type] = true)
          : (node[type] = false);
      });
      // this.node.classed(className, d => {
      //   return (
      //     extentStart[0] <= d.x &&
      //     extentStart[1] <= d.y &&
      //     d.x <= extentEnd[0] &&
      //     d.y <= extentEnd[1]
      //   );
      // });
    },
    brushEnd() {
      if (d3.event.selection === null) return;
      console.log("brushed");
      let brushedNodes = this.nodes.filter(d => d.brushing);
      brushedNodes.forEach(node => {
        node.brushing = false;
        node.selected = true;
        node.attentionTimes += 1;
      });

      let operation = {
        action: "brush",
        nodes: brushedNodes,
        time: new Date()
      };
      this.$store.commit("addOperation", operation);
      console.log("brush");
    },
    invertBrushEnd() {
      if (d3.event.selection === null) return;
      let invertBrushedNodes = this.nodes.filter(d => d.invertBrushing);
      invertBrushedNodes.forEach(node => {
        node.invertBrushing = false;
        node.selected = false;
      });

      let operation = {
        action: "invertBrush",
        nodes: invertBrushedNodes,
        time: new Date()
      };
      this.$store.commit("addOperation", operation);
      console.log("invertBrush");
    },
    // drag
    dragstarted(d) {
      if (!this.visDrag) return;
      this.beforeEvent("drag", this);
      // if (!d3.event.active) this.simulation.alphaTarget(0.1).restart();
      if (this.chartOption.simulation.run) {
        d.fx = d.x;
        d.fy = d.y;
      }
      this.mousePoint = [d3.event.x, d3.event.y];
    },
    dragging(d) {
      // dragging
      if (!this.visDrag) return;
      if (this.chartOption.simulation.run) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
      } else {
        d.x = d3.event.x;
        d.y = d3.event.y;
      }
      // console.log([d3.event.x, d3.event.y]);
      if (
        // 如果mousePoint没变过，则没有发生drag,当this.isDraging==false时判断
        !this.isDraging &&
        (this.mousePoint[0] !== d3.event.x || this.mousePoint[1] !== d3.event.y)
      ) {
        // console.log("computing !!");
        this.isDraging = true;
      }
    },
    dragged() {
      // 节流，防止运算阻塞dom渲染
      return throttle(this.dragging, 16, { leading: true, trailing: false });
    },
    dragended(d) {
      if (!this.visDrag) return;
      // if (!d3.event.active) this.simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
      if (this.isDraging) {
        d.attentionTimes += 1;
        // drag <text>时，通过以下返回node
        let t = this.node.filter(dd => dd.uid === d.uid);
        let operation = {
          action: "drag",
          nodes: t.nodes(),
          time: new Date()
        };
        this.$store.commit("addOperation", operation);
        this.isDraging = false;
        console.log("drag");
        t.dispatch("mouseout");
      }
    },
    d3_clickSelect(d, i, p) {
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
          console.log("click");
        }
      }
    },
    clickSelect(d) {
      if (this.visClick) {
        this.beforeEvent("click", this);
        if (d.selected) {
          d.selected = false;
        } else {
          d.selected = true;
          d.attentionTimes += 1;
          let operation = {
            action: "click",
            nodes: [d],
            time: new Date()
          };
          this.$store.commit("addOperation", operation);
          console.log("click");
        }
      }
    },
    mouseover(d) {
      if (!this.visMouseover || this.isDraging) return;
      this.beforeEvent("mouseover", this);
      let displayNodes = {};
      let displayLinks = {};
      if (!(d.id || d.name)) {
        throw new Error(`object do not has "id" or "name"`);
      }
      let id = d.id ? "id" : "name";
      let thisId = d[id];

      this.nodes.forEach(d => {
        d.mouseover_show = false;
      });
      this.links.forEach(d => {
        d.mouseover_show = d.source[id] === thisId || d.target[id] === thisId;
        if (d.mouseover_show) {
          // 如果link显示，则它两头的node也会显示
          d.source.mouseover_show = true;
          d.target.mouseover_show = true;
        }
      });

      // link
      this.opacityLinks = this.link.filter(d => !d.mouseover_show);
      displayLinks = this.link.filter(d => d.mouseover_show);
      // node
      this.opacityNodes = this.node.filter(d => !d.mouseover_show);
      displayNodes = this.node.filter(d => d.mouseover_show);
      // text
      this.opacityTexts = this.text.filter(d => !d.mouseover_show);

      // this.opacityNodes
      //   .transition()
      //   .style("fill-opacity", 0.2)
      //   .style("stroke-opacity", 0.2);
      // this.opacityLinks.transition().style("stroke-opacity", 0);
      // this.opacityTexts.transition().style("fill-opacity", 0);

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
        console.log("mouseover");
      }
    },
    mouseout() {
      if (!this.visMouseover || this.isDraging) return;
      // this.opacityNodes
      //   .transition()
      //   .delay(200)
      //   .style("fill-opacity", null)
      //   .style("stroke-opacity", null);
      // this.opacityLinks
      //   .transition()
      //   .delay(200)
      //   .style("stroke-opacity", null);
      // this.opacityTexts
      //   .transition()
      //   .delay(200)
      //   .style("fill-opacity", null);
      this.links.forEach(d => {
        d.mouseover_show = true;
      });
      this.nodes.forEach(d => {
        d.mouseover_show = true;
      });
    },
    visTransform() {
      return d3.zoomTransform(this.vis.node());
    },
    test() {}
  },
  watch: {
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
    "chartOption.link.distance": function() {
      if (this.chartOption.simulation.run) return;
      this.simulation.alphaTarget(0.5).restart();
      setTimeout(() => {
        if (this.chartOption.simulation.run) return;
        this.simulation.alphaTarget(0).stop();
      }, 400);
    },
    "chartOption.node.chargeForce": function() {
      if (this.chartOption.simulation.run) return;
      this.simulation.alphaTarget(0.5).restart();
      setTimeout(() => {
        if (this.chartOption.simulation.run) return;
        this.simulation.alphaTarget(0).stop();
      }, 400);
    },
    "chartOption.simulation.run": function(val) {
      val
        ? this.simulation
            .alphaTarget(this.chartOption.simulation.alphaTarget)
            .restart()
        : this.simulation.alphaTarget(0).stop();
    },
    "chartOption.simulation.alphaTarget": function(val) {
      if (this.chartOption.simulation.run) {
        if (val < 0.01) {
          this.chartOption.simulation.run = false;
        }
        this.simulation
          .alphaTarget(this.chartOption.simulation.alphaTarget)
          .restart();
      }
    }
  }
};
</script>
<style scope>
.node {
  pointer-events: all;
  stroke: transparent;

  transition: fill 0.6s ease, fill-opacity 0.3s ease, stroke-opacity 0.3s ease;
  /* cx 0.016s linear, cy 0.016s linear; */
}
.node.selected {
  /* fill: red; */
  stroke: red;
  stroke-width: 0.8;
}
.node.brushing {
  animation: stroke-blink 1s ease 0s infinite;
}
.node.invertBrushing {
  animation: stroke-blink 1s ease 0s infinite;
}
.node.mouseover_opacity {
  fill-opacity: 0.2;
  stroke-opacity: 0.2;
}

@keyframes stroke-blink {
  0% {
    stroke: transparent;
    stroke-width: 0;
  }
  50% {
    stroke: red;
    stroke-width: 1.8;
  }
  100% {
    stroke: transparent;
    stroke-width: 0;
  }
}

.link {
  transition: stroke 0.6s ease, stroke-width 0.3s ease, stroke-opacity 0.3s ease;
  stroke-opacity: 0.8;
}
.link.mouseover_opacity {
  stroke-opacity: 0;
}

.text {
  user-select: none;
  text-anchor: middle;
  font-family: Avenir;
  transition: fill 0.6s ease, fill-opacity 0.3s ease;
}
.text.mouseover_opacity {
  fill-opacity: 0;
}

/* .linksOverOut-enter,
.linksOverOut-leave {
  opacity: 0;
}
.linksOverOut-enter-to,
.linksOverOut-leave {
  opacity: 1;
}
.linksOverOut-enter-active {
  transition: all 1s ease;
}

.nodesOverOut-enter,
.nodesOverOut-leave {
  fill-opacity: 0.2;
  stroke-opacity: 0.2;
}
.nodesOverOut-enter-to,
.nodesOverOut-leave {
  fill-opacity: 1;
  stroke-opacity: 1;
}
.nodesOverOut-enter-active {
  transition: all 1.5s ease;
} */
</style>