import Vue from 'vue'
import Vuex from 'vuex'
import * as d3 from "d3";

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    sourceData: {},
  },
  getters: {
    hierarchical2nodeLink: (state) => {
      // nodes
      let nodes = [],
        i = 0;

      function recurse(node) {
        if (node.children) node.children.forEach(recurse);
        if (!node.id) node.id = ++i;
        nodes.push(node);
      }
      recurse(state.sourceData);

      // links
      let links = d3.hierarchy(nodes).links();

      return [nodes, links];
    },

  },
  mutations: {
    updateSourceData: (state, data) => {
      state.sourceData = data;
    }
  },
  actions: {

  }
})