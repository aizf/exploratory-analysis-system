<template>
  <a-table :columns="columns" :dataSource="data" :scroll="{ x: 1500, y: 300 }"></a-table>
</template>
<script>
// import * as _ from "lodash";
export default {
  name: "NodesTable",
  props: {
    visClick: Boolean,
    visBrush: Boolean,
    visInvertBrush: Boolean,
    visDrag: Boolean,
    visMouseover: Boolean,
    visZoom: Boolean,
    visShowIds: Boolean,
    viewUpdate: false
  },
  data() {
    return {
      chartWidth: "960",
      chartHeight: "600",
      dimensions: []
    };
  },
  computed: {
    sourceData() {
      return this.$store.state.sourceData;
    },
    visualData() {
      return this.$store.state.visualData;
    },
    nodes() {
      return this.visualData.nodes;
    },
    links() {
      return this.visualData.links;
    },
    backgroundColor() {
      return this.$store.state.backgroundColor;
    },
    colorPalette() {
      return this.$store.state.colorPalette;
    },
    nodesNumber() {
      // 节点的数量
      //   return this.node.size();
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
        degree[link.source.index] = (degree[link.source.index] || 0) + 1;
        degree[link.target.index] = (degree[link.target.index] || 0) + 1;
      }
      return degree;
    },

    columns() {
      return this.dimensions.map(d => ({
        title: d,
        dataIndex: d,
        key: d,
        width: 150
      }));
    },
    data() {
      return this.nodes.map((node, i) => {
        let datum = { key: i };
        // console.log(this.dimensions);
        for (let dimension of this.dimensions) {
          datum[dimension] = node[dimension].toString();
        }
        // console.log(datum);
        return datum;
      });
    }
  },
  mounted() {},

  activated() {
    // getDimensions() 内的this.nodes为object，因此为methods而非computed
    this.dimensions = this.getDimensions();
  },

  deactivated() {},

  methods: {
    load(obj) {
      // 加载数据,后期拓展
      this.nodeData = obj.nodes;
      this.linkData = obj.links;
    },
    update() {
      // 更新数据
      let color = d => {
        return !!d.group ? this.colorPalette[d.group] : this.colorPalette[3]; // FIXME 指定group
      };
      // this.load(nodeData, linkData);
      this.link = this.linkG
        .selectAll("line")
        .data(this.linkData)
        .join("line");

      this.node = this.nodeG
        .selectAll("circle")
        .data(this.nodeData)
        .join("circle")
        .attr("r", d => {
          let size = Math.sqrt(d.size) / 10;
          return size > 4.5 ? size : 4.5;
        })
        .attr("class", "display")
        .attr("fill", color)
        .attr("filter", "url(#shadow)")
        .each(d => {
          d.attentionTimes = 0;
          d.selected = false;
        });
    },
    getDimensions() {
      // 获得node的属性(维度)有哪些
      let privateArr = ["fx", "fy", "x", "y", "xx", "yy", "vx", "vy"];
      let dSet = new Set();
      this.nodes.forEach(node => {
        dSet = new Set([...dSet, ...Object.keys(node)]);
      });
      return [...dSet].filter(d => privateArr.every(i => i !== d)).sort();
    },
    test() {
      this.load(this.visualData);
      this.update();
    }
  },
  watch: {
    viewUpdate: function(val) {
      if (val) {
      }
    }
  }
};
</script>
<style>
</style>