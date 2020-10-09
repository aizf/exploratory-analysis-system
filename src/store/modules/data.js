const data = {
    state: {
        sourceData: "",
        visualData: {},
        nodesTotalNum: 0,
        nodeFields: {}
    },
    mutations: {
        updateSourceData: (state, data) => {
            state.sourceData = data;
        },
        updateVisualData: (state, data) => {
            state.visualData = data;
        },
        updateNodesTotalNum: (state, data) => {
            state.nodesTotalNum = data;
        },
        updateNodeFields: (state, data) => {
            state.nodeFields = data;
        },
    },
    actions: {}
}

export default data
