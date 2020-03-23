<template>
  <svg :width="this.radius*2" :height="this.radius*2">
    <g :transform="`translate(${this.radius},${this.radius})`">
      <path
        v-for="arc in arcs"
        :d="generateArc(arc.startAngle,arc.endAngle)"
        :fill="fillColor(arc.data.group)"
        stroke-width="0"
        :opacity="arc.data.group==='null' ? 0 : 1"
        :key="arc.index"
      >
        <title>{{arc.data.id}}</title>
      </path>
    </g>
  </svg>
</template>
<script>
import { mapState, mapGetters } from "vuex";
import * as d3 from "d3";

export default {
  name: "ChartPie",
  props: {
    nodes: Array,
    radius: Number,
    valueFn: Function
  },
  data() {
    return {
      // nodes: [1, 3, 2, 1, 4, 10,1,1,1,1,5,6,78,1],
      arcs: [],
      arcGenerator: {},
      pieGenerator: {}
    };
  },
  computed: {
    ...mapState({
      classificationPalette: state => state.view.classificationPalette
    })
  },
  created() {
    this.arcGenerator = d3
      .arc()
      .innerRadius(this.radius * 0.67)
      .outerRadius(this.radius);
    this.pieGenerator = d3
      .pie()
      .padAngle(0.05)
      .value(this.valueFn);
    this.arcs = this.pieGenerator(this.nodes);
  },
  mounted() {},
  methods: {
    generateArc(startAngle, endAngle) {
      return this.arcGenerator({
        startAngle: startAngle,
        endAngle: endAngle
      });
    },
    fillColor(group) {
      if (group === "null") {
        return "null";
      } else {
        return this.classificationPalette[group];
      }
    },
    // color() {
    //   d3.scaleOrdinal()
    //     .domain(data.map(d => d.name))
    //     .range(
    //       d3
    //         .quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), data.length)
    //         .reverse()
    //     );
    // },
    testFn() {}
  }
};
</script>
