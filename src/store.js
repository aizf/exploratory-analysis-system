import Vue from 'vue'
import Vuex from 'vuex'
// import * as d3 from "d3";

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
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
    ]
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
      }
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
    addOperation: (state, data) => {
      state.operations.push(data);
      // let data = { chart: "", time: "", action: "", nodes: {} };
    },
  },
  actions: {

  }
})