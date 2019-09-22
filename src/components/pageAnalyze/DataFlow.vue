<template>
    <div class="operations" style="height: 50vh"></div>
</template>

<script>
import * as d3 from "d3";
import G2 from "@antv/g2";
import { View } from "@antv/data-set";

export default {
  name: "TimeOrder",
  data() {
    return {
      chart: {}
    };
  },
  computed: {
    visualData() {
      return this.$store.state.visualData;
    },
    nodes() {
      return this.$store.getters.nodes;
    },
    links() {
      return this.$store.getters.links;
    },
    backgroundColor() {
      return this.$store.state.backgroundColor;
    },
    colorPalette() {
      return this.$store.state.colorPalette;
    },
    operations() {
      return this.$store.state.operations;
    }
  },
  mounted() {
    this.chart = new G2.Chart({
      container: document.getElementsByClassName("operations")[0],
      forceFit: true,
      height: 400,
      theme: "dark"
      // renderer : 'svg'
    });

    const defs = {
      time: {
        type: "time", // 指定 time 类型
        mask: "HH:mm:ss" // 指定时间的输出格式
      },
      action: {
        type: "cat", // 指定 cat 分类类型
        values: this.$store.state.operationTypes // 重新指定 c 属性每一个的值
      }
    };
    this.chart.source(this.operations, defs);
    this.chart.legend({
      title: null // 不展示图例的标题
      // marker: "square" // 设置图例 marker 的显示样式
    });
    this.chart.legend("nodes", false); // 隐藏 nodes 维度对应的图例
    this.chart.tooltip({
      showTitle: false
      // itemTpl: '<li>{color}{name}\t{value}</li>'
    });
    this.chart
      .point()
      .position("time*action")
      .color("action")
      .size("nodes", nodes => {
        let size = Math.sqrt(nodes.length);
        return size > 4.5 ? size : 4.5;
      })
      .opacity(0.8)
      .shape("circle")
      .tooltip("time*action", (time, action, nodes) => {
        return { name: action, value: time + "%" };
        // , { "操作": action }];
      });
    this.chart.render();
  },
  activated() {
    this.chart.changeData(this.operations);
  },
  methods: {}
};
</script>