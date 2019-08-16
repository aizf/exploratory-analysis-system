import Vue from 'vue'
import Vuex from 'vuex'
import {
  hierarchy
}
from "d3-hierarchy"

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
      let links = hierarchy(nodes).links();

      return [nodes, links];
    }
  },
  mutations: {
    // changeSwitch(state, eventSwitch) {
    //   state[eventSwitch] = !state[eventSwitch];
    //   console.log(eventSwitch);
    //   console.log(state[eventSwitch]);
    // }
  },
  actions: {

  }
})