<template>
  <a-table :columns="columns" :dataSource="data" size="small"></a-table>
</template>
<script>
import store from "@/store/";
import { mapState, mapGetters } from "vuex";
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
    visShowIds: Boolean
  },
  data() {
    return {
      chartWidth: "960",
      chartHeight: "600"
    };
  },
  computed: {
    ...mapState({
      sourceData: state => state.data.sourceData,
      visualData: state => state.data.visualData,

      colorPalette: state => state.view.colorPalette,
      backgroundColor: state => state.view.backgroundColor,
      needUpdate: state => state.view.chartsNeedUpdate.table
    }),
    ...mapGetters(["nodes", "links", "nodesNumber", "dimensions"]),

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
        sorter: (a, b) => {
          //   console.log(a, b);
          // 该比较函数需要返回数值
          // a[d]全为数字则相减，否则比较大小
          return isNaN(a[d]) || isNaN(b[d])
            ? a[d] > b[d]
              ? 1
              : -1
            : a[d] - b[d];
        }
        // width: 150
      }));
    },
    data() {
      return this.nodes.map((node, i) => {
        let datum = { key: i };
        // console.log(this.dimensions);
        for (let dimension of this.dimensions) {
          // console.log(node[dimension]);
          datum[dimension] =
            node[dimension] === undefined || node[dimension] === null
              ? "-"
              : node[dimension].toString();
        }
        // console.log(datum);
        return datum;
      });
    }
  },
  mounted() {},

  activated() {
    // getDimensions() 内的this.nodes为object，因此为methods而非computed
  },

  deactivated() {},

  methods: {
    update() {
      // 更新数据
      let color = d => {
        return d.group ? this.colorPalette[d.group] : this.colorPalette[3]; // FIXME 指定group
      };
      // this.load(nodeData, linkData);
    },
    test() {
      this.update();
    }
  },
  watch: {
    needUpdate: function(val) {
      if (val) {
        //
        store.commit("TableUpdated"); // TODO:
      }
    }
  }
};
</script>
<style>
</style>