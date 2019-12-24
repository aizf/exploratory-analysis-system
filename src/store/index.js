import Vue from 'vue'
import Vuex from 'vuex'

import data from './modules/data'
import view from './modules/view'
import analyze from './modules/analyze'

import getters from './getters'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    data,
    view,
    analyze
  },
  state: {

  },
  mutations: {

  },
  actions: {
    resetAll({ state, getters, commit }) {
      commit("updateParentUUID", "none");
      commit("updateCurrentUUID", "root");
      getters.generateUUID(1);

      commit("changeUndoRedo", (undo, redo) => {
        undo.splice(0, undo.length);
        redo.splice(0, redo.length);
      });
      commit("resetOperations");
      commit("change_uuids", (uuids) => {
        uuids.clear();
        uuids.add("root");
      });
      commit("resetRecordset");
      commit("updatePageAnalyzeTooltip", {
        "nodes": [],
        "links": []
      });
      commit("clearExistingViews")
    }
  },
  getters
})
