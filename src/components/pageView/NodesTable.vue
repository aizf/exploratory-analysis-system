<template>
  <a-table :columns="columns" :dataSource="data" size="small"></a-table>
</template>
<script>
import Vue from 'vue'
import {Table} from 'ant-design-vue'
Vue.use(Table);
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
    ...mapGetters(["nodes", "links", "nodesNumber", "nodeFields"]),

    degreeArray() {
      // 返回一个包含各个节点出入度的数组
      const nodes = this.simulation.nodes(),
        links = this.simulation.force("link").links();
      const n = nodes.length,
        m = links.length;
      // console.log(n, m);
      const degree = new Array(n);
      // links包含source，target，nodes没有
      for (const link of links) {
        // console.log(link);
        degree[link.source.index] = (degree[link.source.index] || 0) + 1;
        degree[link.target.index] = (degree[link.target.index] || 0) + 1;
      }
      return degree;
    },

    columns() {
      return this.nodeFields.map(d => ({
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
        const datum = { key: i };
        for (const field of this.nodeFields) {
          datum[field] =
            node[field] === undefined || node[field] === null
              ? "-"
              : node[field].toString();
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

  methods: {},
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