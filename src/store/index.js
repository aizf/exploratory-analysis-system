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
        resetOperations: (state) => {
            state.operations = [];
            state.operations_ = [];
            state.dataFlow = {
              nodes: [],
              links: []
            };
            state.parentUUID = "root";
            state.currentUUID = "root";
          },
    },
    actions: {

    },
    getters
})
