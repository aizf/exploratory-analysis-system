<template>
  <div>
    <div class="operations" style="height: 50vh"></div>
  </div>
</template>

<script>
import G2 from "@antv/g2";
import { View } from "@antv/data-set";
// language js
import { codemirror } from "vue-codemirror";
// theme css
import "codemirror/lib/codemirror.css";
// more codemirror resources
// import 'codemirror/some-resource...'
export default {
  name: "PageAnalyze",
  components: { codemirror },
  data() {
    return {
      operationsVis: {},
      operationsChart: {}
    };
  },
  computed: {
    codemirror() {
      return this.$refs.myCm.codemirror;
    },
    operations() {
      return this.$store.state.operations;
    }
  },
  mounted() {
    // data: ["click", "brush", "drag", "mouseover", "invertBrush", "zoom"]

    const chart = new G2.Chart({
      container: document.getElementsByClassName("operations")[0],
      forceFit: true,
      height: 400,
      data: this.operations,
      theme: "dark"
    });
    const data = [
      { year: "Year 1800", region: "Africa", population: 107 },
      { year: "Year 1900", region: "Africa", population: 133 },
      { year: "Year 2012", region: "Africa", population: 1052 },
      { year: "Year 1800", region: "America", population: 31 },
      { year: "Year 1900", region: "America", population: 156 },
      { year: "Year 2012", region: "America", population: 954 },
      { year: "Year 1800", region: "Asia", population: 635 },
      { year: "Year 1900", region: "Asia", population: 947 },
      { year: "Year 2012", region: "Asia", population: 4250 },
      { year: "Year 1800", region: "Europe", population: 203 },
      { year: "Year 1900", region: "Europe", population: 408 },
      { year: "Year 2012", region: "Europe", population: 740 },
      { year: "Year 1800", region: "Oceania", population: 2 },
      { year: "Year 1900", region: "Oceania", population: 6 },
      { year: "Year 2012", region: "Oceania", population: 38 }
    ];

    chart.source(data);
    chart.coord().transpose();
    chart.legend({
      title: null, // 不展示图例的标题
      marker: "square" // 设置图例 marker 的显示样式
    });
    chart
      .intervalDodge()
      .position("region*population")
      .color("year")
      .label("population");
    chart.render();
  },
  activated() {},
  methods: {}
};
</script>