const data = {
    state: {
        datasetsTypes: [
            "node-link",
            "hierarchical",
            // "node"
        ],
        
        sourceData: "",
        visualData: {},
        nodesTotalNum: 0,
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
    },
    actions: {}
}

export default data
