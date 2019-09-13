<template>
  <div>
    <div class="operations" style="height: 50vh"></div>
  </div>
</template>

<script>
import * as d3 from "d3";
import G2 from "@antv/g2";
import { View } from "@antv/data-set";

export default {
  name: "PageAnalyze",
  data() {
    return {
      operationsVis: {},
      operationsChart: {},
      chart: {}
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

    this.chart = new G2.Chart({
      container: document.getElementsByClassName("operations")[0],
      forceFit: true,
      height: 400,
      theme: "dark"
    });
    const defs = {
      time: {
        type: "time", // 指定 time 类型
        mask: "HH:mm:ss" // 指定时间的输出格式
      },
      action: {
        type: "cat", // 指定 cat 分类类型
        values: ["click", "drag", "mouseover", "brush", "invertBrush", "zoom"] // 重新指定 c 属性每一个的值
      },
      nodes: {}
    };
    this.chart.source(this.operations, defs);
    this.chart.legend({
      title: null, // 不展示图例的标题
      marker: "square" // 设置图例 marker 的显示样式
    });
    this.chart
      .point()
      .position("time*action")
      .color("action")
      .size("nodes", nodes => {
        !!!!!!!!!!!!!!!!!!!!!!!!!!!!!// console.log(d3.select().merge(nodes));
        console.log(nodes); // 可能由于不同的d3命名空间，试将t改为d和p[i]
        // return d3.selection(nodes).size();
      })
      .label(".");
    this.chart.render();
  },
  activated() {
    this.chart.changeData(this.operations);
  },
  methods: {}
};
</script>