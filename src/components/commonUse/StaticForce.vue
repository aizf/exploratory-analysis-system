<template>
  <div class="StaticForce" style="float: left">
    <svg
      :width="width"
      :height="height"
      :style="{ background: backgroundColor }"
    >
      <defs>
        <filter id="shadow">
          <feDropShadow dx="0" dy="0" stdDeviation="0.3" />
        </filter>
      </defs>
      <g>
        <g class="links">
          <line
            v-for="link in links"
            :x1="link.source.x"
            :y1="link.source.y"
            :x2="link.target.x"
            :y2="link.target.y"
            :key="link.uid"
          />
        </g>
        <g class="nodes">
          <circle
            v-for="node in nodes"
            :r="Math.max(Math.sqrt(!!node.size) / 10, 4.5)"
            :class="{ display: true, selected: node.selected }"
            :fill="classificationPalette[node.group || 0]"
            filter="url(#shadow)"
            :cx="node.x"
            :cy="node.y"
            :key="node.uid"
          />
        </g>
      </g>
    </svg>
  </div>
</template>
<script>
// import { mapState, mapGetters } from "vuex";
import * as d3 from "d3";
import { layoutRange } from "@/utils/methods";
import { backgroundColor, classificationPalette } from "@/config/color";
// import { mapState } from "vuex";
// import * as _ from "lodash";
export default {
  name: "StaticForce",
  props: {
    nodes: {},
    links: {},
    width: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      linkG: d3.selectAll(),
      nodeG: d3.selectAll(),
      vis: d3.selectAll(),
      mousePoint: [], // 相对于原始坐标系
    };
  },
  computed: {},
  created() {
    this.backgroundColor = backgroundColor;
    this.classificationPalette = classificationPalette;
  },
  mounted() {
    const that = this;
    const svg = d3
      .select(this.$el)
      .select("svg")
      .attr("viewBox", [0, 0, this.width, this.height]);

    this.vis = svg.select("g");
    svg.call(d3.zoom().on("zoom", zoomed)).on("dblclick.zoom", null);

    this.linkG = this.vis.select("g.links");
    this.nodeG = this.vis.select("g.nodes");

    function zoomed() {
      const transform = d3.event.transform;
      // console.log(d3.event.transform === that.visTransform());
      that.vis.attr("transform", transform);
    }

    if (this.nodes.length) {
      this.adjustTransform();
    }
  },

  activated() {},

  deactivated() {},

  methods: {
    adjustTransform() {
      const layout = layoutRange(this.nodes, ["y", "x", "y", "x"]);
      // console.log(layout);
      const t = this.visTransform();
      // t 存储在svg的__zoom中，更改t的属性，不能更换对象
      const vw = layout[1] - layout[3]; // vis的宽
      const vh = layout[2] - layout[0]; // vis的高
      const k = Math.min(this.width / vw, this.height / vh) * 0.8; // 放缩系数

      // 计算svg中心坐标和vis中心坐标
      const svgP = [this.width / 2, this.height / 2];
      const visP = [vw / 2 + layout[3], vh / 2 + layout[0]];

      // Xvis*k + x = Xsvg
      const x = svgP[0] - visP[0] * k;
      const y = svgP[1] - visP[1] * k;

      t.x = x;
      t.y = y;
      t.k = k;
      this.vis.attr("transform", t);
    },
    visTransform() {
      return d3.zoomTransform(this.vis.node());
    },
  },
  watch: {
    nodes: function () {
      this.adjustTransform();
    },
  },
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