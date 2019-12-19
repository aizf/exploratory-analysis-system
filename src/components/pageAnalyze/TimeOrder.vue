<template>
  <div class="TimeOrder" :style="{width: '100%',height:(height+50)+'px'}">
    <div class="operations"></div>
    <div>
      <a-select defaultValue="0" style="width: 320px" @change="yAxisChange">
        <a-select-option value="0">按照名称</a-select-option>
        <a-select-option value="1">源数据(个数/field)是否变化</a-select-option>
        <a-select-option value="2">操作点的数量</a-select-option>
        <a-select-option value="3">是否影响布局</a-select-option>
      </a-select>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import * as d3 from "d3";
import G2 from "@antv/g2";

export default {
  name: "TimeOrder",
  data() {
    return {
      chart: {},
      view: {},
      view_: {}
    };
  },
  computed: {
    ...mapState({
      visualData: state => state.data.visualData,

      width: state => state.view.dpiX * 0.7,
      height: state => (state.view.dpiY - 64) * 0.35,
      colorPalette: state => state.view.colorPalette,
      backgroundColor: state => state.view.backgroundColor,
      contrastColor: state => state.view.contrastColor,
      operationTypes: state => state.view.operationTypes,

      operations: state => state.analyze.operations,
      operations_: state => state.analyze.operations_,
      dataFlow: state => state.analyze.dataFlow
    }),
    ...mapGetters(["nodes", "links", "recordFlow", "generateUUID"])
  },
  mounted() {
    this.chart = new G2.Chart({
      container: document.getElementsByClassName("operations")[0],
      forceFit: true,
      height: this.height,
      theme: "dark"
      // renderer : 'svg'
    });

    this.chart.legend({
      title: null // 不展示图例的标题
      // marker: "square" // 设置图例 marker 的显示样式
    });
    this.chart.legend("nodes", false); // 隐藏 nodes 维度对应的图例
    this.chart.tooltip({
      showTitle: false
      // itemTpl: '<li>{color}{name}\t{value}</li>'
    });
    this.chart.scale("time", {
      type: "time", // 指定 time 类型
      mask: "HH:mm:ss", // 指定时间的输出格式
      sync: true
    });

    const defs = {
      time: {
        type: "time", // 指定 time 类型
        mask: "HH:mm:ss", // 指定时间的输出格式
        sync: true
      },
      action: {
        type: "cat", // 指定 cat 分类类型
        values: this.$store.state.operationTypes // 重新指定 c 属性每一个的值
      },
      isChangeSource: {
        type: "cat",
        values: [false, true]
      },
      nodesNum: {
        type: "linear"
      },
      isChangeLayout: {
        type: "cat",
        values: [false, true]
      }
    };
    this.view = this.chart.view();
    this.view.source(this.operations, defs);
    this.view
      .point()
      .position("time*action")
      .color("action")
      .size("nodes", nodes => {
        const size = Math.sqrt(nodes.length);
        return size > 4.5 ? size : 4.5;
      })
      .opacity(0.8)
      .shape("circle")
      .tooltip("time*action", (time, action, nodes) => {
        return {
          name: action,
          value: `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`
        };
        // , { "操作": action }];
      });

    const defs_ = {
      time: {
        type: "time", // 指定 time 类型
        mask: "HH:mm:ss", // 指定时间的输出格式
        sync: true
      },
      action: {
        type: "cat", // 指定 cat 分类类型
        values: this.$store.state.operation_Types // 重新指定 c 属性每一个的值
      },
      max: {
        type: "cat", // 指定 cat 分类类型
        values: this.$store.state.operationTypes
      }
    };
    this.view_ = this.chart.view();
    this.view_.source(this.operations_, defs_);
    this.view_.axis("action", {
      label: null
    });
    this.view_
      .interval()
      .position("time*max")
      .shape("line")
      .color("action", ["#F04864", "#B381E6", "#ea7e53"])
      .size(2)
      .opacity(0.3)
      .tooltip("time*action", (time, action, nodes) => {
        return {
          name: action,
          value: `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`
        };
        // , { "操作": action }];
      });

    this.chart.render();
  },
  activated() {
    this.view.changeData(this.operations);
    this.view_.changeData(this.operations_);
  },
  methods: {
    update() {},
    yAxisChange(value) {
      switch (value) {
        case "0":
          this.yAxis0();
          break;
        case "1":
          this.yAxis1();
          break;
        case "2":
          this.yAxis2();
          break;
        case "3":
          this.yAxis3();
          break;
        default:
          break;
      }
    },
    // ["click", "drag", "mouseover", "brush", "invertBrush", "zoom"]
    yAxis0() {
      console.log(this.view);
      this.view.changeData(this.operations);
      this.view.position("time*action");
      this.chart.render();
    },
    yAxis1() {
      const defs = {
        time: {
          type: "time", // 指定 time 类型
          mask: "HH:mm:ss", // 指定时间的输出格式
          sync: true
        },
        action: {
          type: "cat", // 指定 cat 分类类型
          values: this.$store.state.operationTypes // 重新指定 c 属性每一个的值
        },
        isChangeSource: {
          type: "cat",
          values: [false, true]
        },
        nodesNum: {
          type: "linear"
        },
        isChangeLayout: {
          type: "cat",
          values: [false, true]
        }
      };
      const ops = this.operations.forEach(d => {
        switch (d.action) {
          case "drag":
          case "mouseover":
          case "zoom":
            d.isChangeSource = false;
            break;
          case "click":
          case "brush":
          case "invertBrush":
            d.isChangeSource = true;
            break;
          default:
            console.log("TimeOder > yAxis1 > bug");
        }
      });
      this.view.clear();
      this.view.source(ops, defs);
      this.view
        .point()
        .position("time*isChangeSource")
        .color("action")
        .size("nodes", nodes => {
          const size = Math.sqrt(nodes.length);
          return size > 4.5 ? size : 4.5;
        })
        .opacity(0.8)
        .shape("circle")
        .tooltip("time*action", (time, action, nodes) => {
          return {
            name: action,
            value: `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`
          };
        });
      // this.view.changeData(ops);
      // this.view.position("time*isChangeSource");
      this.chart.render();
    },
    yAxis2() {
      const ops = this.operations.forEach(d => {
        d.nodesNum = d.nodes.length;
      });
      this.view.changeData(ops);
      this.view.position("time*nodesNum");
      this.chart.render();
    },
    yAxis3() {
      let ops = this.operations.forEach(d => {
        switch (d.action) {
          case "drag":
          case "mouseover":
          case "zoom":
            d.isChangeLayout = true;
            break;
          case "click":
          case "brush":
          case "invertBrush":
            d.isChangeLayout = false;
            break;
          default:
            console.log("TimeOder > yAxis3 > bug");
        }
      });
      this.view.changeData(ops);
      this.view.position("time*isChangeLayout");
      this.chart.render();
    }
  }
};
</script>