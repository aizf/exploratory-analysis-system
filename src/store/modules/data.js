const data = {
    state: {
        sourceData: "",
        visualData: {},
        nodeFields: {}
    },
    mutations: {
        updateSourceData: (state, data) => {
            state.sourceData = data;
        },
        updateVisualData: (state, data) => {
            state.visualData = data;
        },
        updateNodeFields: (state, data) => {
            state.nodeFields = data;
        },
    },
    actions: {}
}

export default data
