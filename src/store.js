import Vue from 'vue'
import Vuex from 'vuex'
// import * as d3 from "d3";

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    sourceData: {},
    visualData: {},
    viewUpdate: false,
  },
  getters: {
    hierarchical2nodeLink: (state) => {
      // nodes
      let nodes = [],
        i = 0;

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
    updateViewUpdate: (state, data) => {
      state.viewUpdate = data;
    },
  },
  actions: {

  }
})