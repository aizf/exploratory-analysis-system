import Vue from 'vue'
import Vuex from 'vuex'
// import * as d3 from "d3";

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // datasets的键(key)对应<a-menu-item>的key
    datasets: {
      "energy": {
        fileName: "energy.json",
        dataType: "node-link",
      },
      "miserables": {
        fileName: "miserables.json",
        dataType: "node-link",
      },
      "readme": {
        fileName: "readme.json",
        dataType: "hierarchical",
      },
      "test": {
        fileName: "test.json",
        dataType: "hierarchical",
      }
    },
    sourceData: undefined,
    visualData: undefined,
    viewUpdate: {
      force: false,
      scatter: false,
      table: false
    },
    operations: [], // operation={action:["click","brush","drag","mouseover","invertBrush","zoom"],nodes:[]}
    backgroundColor: "#333",
    contrastColor: "#eee",
    colorPalette: [
      "#dd6b66",
      "#759aa0",
      "#e69d87",
      "#8dc1a9",
      "#ea7e53",
      "#eedd78",
      "#73a373",
      "#73b9bc",
      "#7289ab",
      "#91ca8c",
      "#f49f42"
    ],
    savedViewData:[],
    viewSlice() {
      let removedNodes = [];
      let slicedNodes = this.visualData.nodes.filter(d => {
        if (d.selected) return true;
        else {
          removedNodes.push(d);
          return false;
        }
      });
      let slicedLinks = this.visualData.links.filter(d =>
        removedNodes.every(rd => {
          let id = rd.id ? "id" : "name";
          return rd[id] !== d.source[id] && rd[id] !== d.target[id];
        })
      );
      // console.log("123", slicedLinks);
      return {
        "nodes": slicedNodes,
        "links": slicedLinks
      };
      // console.log("123", this);
    }
  },
  getters: {
    hierarchical2nodeLink: (state) => {
      if (!state.sourceData) return;

      // nodes
      let nodes = [];

      function recurse(node) {
        if (node.children) node.children.forEach(recurse);
        // if (!node.id) node.id = ++i;
        if (!node.id) node.id = node.name;
        nodes.push(node);
      }
      recurse(state.sourceData);

      // links
      function getLinks(nodes) {
        let links = [];
        nodes.forEach(function (node) {
          if (node.children) { // Don’t include the root’s parent, if any.
            node.children.forEach(function (child) {
              links.push({
                source: node,
                target: child
              });
            })
          }
        });
        return links;
      }

      return {
        "nodes": nodes,
        "links": getLinks(nodes)
      };
    },

  },
  mutations: {
    updateSourceData: (state, data) => {
      state.sourceData = data;
    },
    updateVisualData: (state, data) => {
      state.visualData = data;
    },
    updateViewUpdate: (state, chart, val) => {
      let charts = ["force", "scatter", "table"];
      chart === "all" ? (charts.forEach(c => {
        state.viewUpdate[c] = true;
      })) : (state.viewUpdate[chart] = val);
    },
    resetOperations: (state) => {
      state.operations = [];
    },
    addOperation: (state, data) => {
      state.operations.push(data);
      // let data = { chart: "", time: "", action: "", nodes: {} };
    },
    changeSavedViewData: (state, fn) => {
      let data = state.savedViewData;
      // fn为自定义函数
      return fn(data);
    }
  },
  actions: {

  }
})