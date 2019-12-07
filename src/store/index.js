import Vue from 'vue'
import Vuex from 'vuex'

import data from './modules/data'
import view from './modules/view'
import analyze from './modules/analyze'
import public_function from './modules/public_function'

import getters from './getters'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    public_function,
    data,
    view,
    analyze
  },
  state: {

  },
  mutations: {

  },
  actions: {
    resetAll({ commit }) {
      commit("updateParentUUID", "none");
      commit("updateCurrentUUID", "root");
      commit("changeMarked", false);

      commit("changeUndoRedo", (undo, redo) => {
        undo.splice(0, undo.length);
        redo.splice(0, redo.length);
      });
      commit("resetOperations");
      commit("resetDataFlow");
      commit("resetRecordset");
      commit("updatePageAnalyzeTooltip", {
        "nodes": [],
        "links": []
      });
    }
  },
  getters
})
