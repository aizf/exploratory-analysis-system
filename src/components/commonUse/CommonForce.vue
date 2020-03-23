<template>
  <div class="StaticForce" style="float:left;">
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
// import { mapState } from "vuex";
// import * as _ from "lodash";
export default {
  name: "StaticForce",
  props: {
    viewUpdate: Boolean,
    nodes: {},
    links: {},
    width: {
      type: Number,
      required: true
    },
    height: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      link: d3.selectAll(),
      node: d3.selectAll(),
      linkG: d3.selectAll(),
      nodeG: d3.selectAll(),
      vis: d3.selectAll(),
      simulation: {},
      linkStrength: 1,
      linkLength: 0,
      mousePoint: [] // 相对于原始坐标系
    };
  },
  computed: {
    backgroundColor() {
      return this.$store.state.view.backgroundColor;
    },
    classificationPalette() {
      return this.$store.state.view.classificationPalette;
    }
  },
  mounted() {
    // console.log(d3.version);
    // console.log(_.VERSION);
    const that = this;
    const svg = d3
      .select(this.$el)
      .select("svg")
      .attr("viewBox", [0, 0, this.width, this.height]);
    const width = this.width,
      height = this.height;
    // console.log(svg);

    this.vis = svg.append("g");
    svg
      .call(
        d3
          .zoom()
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

    // 初始化<g>，防止update()产生多个<g>
    this.linkG = this.vis.append("g").attr("class", "links");
    this.nodeG = this.vis.append("g").attr("class", "nodes");

    this.update();

    function zoomed() {
      const transform = d3.event.transform;
      that.vis.attr("transform", transform);
    }
    function zoomEnd() {
      const transform = d3.event.transform;
      const extentStart = transform.invert([0, 0]); // 视口的开始坐标
      const extentEnd = transform.invert([that.chartWidth, that.chartHeight]); // 视口的结束坐标
      const t = that.node.filter(d => {
        return (
          extentStart[0] <= d.x &&
          extentStart[1] <= d.y &&
          d.x <= extentEnd[0] &&
          d.y <= extentEnd[1]
        );
      });
    }
  },

  activated() {
    // this.node
    //   .classed("selected", d => d.selected)
    //   .attr("fill", d => this.classificationPalette[d.group || 0]);
    this.simulation.tick();
  },

  deactivated() {
    this.simulation.stop();
  },

  methods: {
    update() {
      if (this.nodes.length === 0) {
        return;
      }
      // 更新数据
      const color = d => {
        return d.group ? this.classificationPalette[d.group] : this.classificationPalette[0]; // FIXME 指定group
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
          const size = Math.sqrt(d.size) / 10;
          return size > 4.5 ? size : 4.5;
        })
        .attr("class", "display")
        .attr("fill", color)
        .attr("filter", "url(#shadow)")
        .classed("selected", d => d.selected);

      this.simulation
        .nodes(this.nodes)
        .on("tick", this.ticked)
        .on("end", this.tickEnd);
      this.simulation.force("link").links(this.links);

      this.simulation.alpha(1).restart(); // 更新数据后重新开始仿真
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
    },

    visTransform() {
      return d3.zoomTransform(this.vis.node());
    }
  },
  watch: {
    viewUpdate: function(val) {
      this.update();
    }
  }
};
</script>
<style>
.StaticForce line {
  stroke: #aaa;
  stroke-opacity: 0.8;
  stroke-width: 0.3;
}

.StaticForce circle {
  pointer-events: all;
  stroke: none;
  /*描边*/
  /* fill-opacity: 0.85; */
  /* filter:drop-shadow(-25px 25px 25px rgba(0, 243, 53, 0.7)); */
}

.StaticForce circle.display {
  /**/
}

.StaticForce circle.selected {
  /* fill: red; */
  stroke: red;
  stroke-width: 0.8;
}

.StaticForce circle.brushing {
  /* fill: red; */
  stroke: red;
  stroke-width: 0.8;
}

.StaticForce circle.invertBrushing {
  stroke: none;
  stroke-width: 0px;
}
</style>