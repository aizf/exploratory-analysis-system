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
      <g>
        <g class="links">
          <line
            v-for="link in links"
            :x1="link.source.x"
            :y1="link.source.y"
            :x2="link.target.x"
            :y2="link.target.y"
            :key="link.index"
          />
        </g>
        <g class="nodes">
          <circle
            v-for="node in nodes"
            :r="Math.max(Math.sqrt(!!node.size) / 10, 4.5)"
            :class="{'display':true,'selected':node.selected}"
            :fill="colorPalette[node.group || 0]"
            filter="url(#shadow)"
            :cx="node.x"
            :cy="node.y"
            :key="node.index"
          />
        </g>
      </g>
    </svg>
  </div>
</template>
<script>
import { mapState, mapGetters } from "vuex";
import * as d3 from "d3";
// import { mapState } from "vuex";
// import * as _ from "lodash";
export default {
  name: "StaticForce",
  props: {
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
      mousePoint: [] // 相对于原始坐标系
    };
  },
  computed: {
    ...mapState({
      backgroundColor: state => state.view.backgroundColor,
      colorPalette: state => state.view.colorPalette
    }),
    ...mapGetters(["layoutRange"])
  },
  mounted() {
    // console.log(d3.version);
    // console.log(_.VERSION);
    let that = this;
    let svg = d3
      .select(this.$el)
      .select("svg")
      .attr("viewBox", [0, 0, this.width, this.height]);
    let width = this.width,
      height = this.height;
    // console.log(svg);

    this.vis = svg.select("g");
    svg.call(d3.zoom().on("zoom", zoomed)).on("dblclick.zoom", null);

    this.linkG = this.vis.select("g.links");
    this.nodeG = this.vis.select("g.nodes");

    function zoomed() {
      let transform = d3.event.transform;
      // console.log(d3.event.transform === that.visTransform());
      that.vis.attr("transform", transform);
    }
  },

  activated() {},

  deactivated() {},

  methods: {
    update() {
      // if (this.nodes.length === 0) {
      //   return;
      // }
      // // 更新数据
      // let color = d => {
      //   return d.group ? this.colorPalette[d.group] : this.colorPalette[0]; // FIXME 指定group
      // };
      // // debugger;
      // this.link = this.linkG
      //   .selectAll("line")
      //   .data(this.links)
      //   .join("line");
      // this.link
      //   .attr("x1", d => d.source.x)
      //   .attr("y1", d => d.source.y)
      //   .attr("x2", d => d.target.x)
      //   .attr("y2", d => d.target.y);

      // this.node = this.nodeG
      //   .selectAll("circle")
      //   .data(this.nodes)
      //   .join("circle")
      //   .attr("r", d => {
      //     let size = Math.sqrt(d.size) / 10;
      //     return size > 4.5 ? size : 4.5;
      //   })
      //   .attr("class", "display")
      //   .attr("fill", color)
      //   .attr("filter", "url(#shadow)")
      //   .classed("selected", d => d.selected);
      // this.node.attr("cx", d => d.x).attr("cy", d => d.y);

      // 调整布局，使图显示在画布中间，并调整大小
      let layoutRange = this.layoutRange(this.nodes, ["y", "x", "y", "x"]);
      // console.log(layoutRange);
      let t = this.visTransform();
      // t 存储在svg的__zoom中，更改t的属性，不能更换对象
      let vw = layoutRange[1] - layoutRange[3]; // vis的宽
      let vh = layoutRange[2] - layoutRange[0]; // vis的高
      let k = Math.min(this.width / vw, this.height / vh) * 0.8; // 放缩系数

      // 计算svg中心坐标和vis中心坐标
      let svgP = [this.width / 2, this.height / 2];
      let visP = [vw / 2 + layoutRange[3], vh / 2 + layoutRange[0]];

      // Xvis*k + x = Xsvg
      let x = svgP[0] - visP[0] * k;
      let y = svgP[1] - visP[1] * k;

      t.x = x;
      t.y = y;
      t.k = k;
      this.vis.attr("transform", t);
    },

    visTransform() {
      return d3.zoomTransform(this.vis.node());
    }
  },
  watch: {
    nodes: function() {
      let layoutRange = this.layoutRange(this.nodes, ["y", "x", "y", "x"]);
      // console.log(layoutRange);
      let t = this.visTransform();
      // t 存储在svg的__zoom中，更改t的属性，不能更换对象
      let vw = layoutRange[1] - layoutRange[3]; // vis的宽
      let vh = layoutRange[2] - layoutRange[0]; // vis的高
      let k = Math.min(this.width / vw, this.height / vh) * 0.8; // 放缩系数

      // 计算svg中心坐标和vis中心坐标
      let svgP = [this.width / 2, this.height / 2];
      let visP = [vw / 2 + layoutRange[3], vh / 2 + layoutRange[0]];

      // Xvis*k + x = Xsvg
      let x = svgP[0] - visP[0] * k;
      let y = svgP[1] - visP[1] * k;

      t.x = x;
      t.y = y;
      t.k = k;
      this.vis.attr("transform", t);
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