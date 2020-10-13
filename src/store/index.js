import Vue from 'vue'
import Vuex from 'vuex'
const { v4: uuidv4 } = require('uuid');

import data from './modules/data'
import view from './modules/view'
import analyze from './modules/analyze'

import getters from './getters'
import { generateUUID } from "@/utils/methods";

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
    resetAll({ getters, commit }) {
      const uuid = uuidv4();
      window.sessionStorage.setItem('user-uuid', uuid);

      commit("updateNodesTotalNum", getters.nodes.length);
      commit("updateParentUUID", "none");
      commit("updateCurrentUUID", "root");
      generateUUID(1);

      commit("changeUndoRedo", (undo, redo) => {
        undo.splice(0, undo.length);
        redo.splice(0, redo.length);
      });
      commit("resetOperations");
      commit("resetRecordset");
      commit("updatePageAnalyzeTooltip", {
        "nodes": [],
        "links": []
      });
    }
  },
  getters
})
