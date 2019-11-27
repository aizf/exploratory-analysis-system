const data = {
    state: {
        datasets: {
            "energy": {
                fileName: "energy.json",
                dataType: "node-link",
            },
            "miserables": {
                fileName: "miserables.json",
                dataType: "node-link",
            },
            "readme": {
                fileName: "readme.json",
                dataType: "hierarchical",
            },
            "test": {
                fileName: "test.json",
                dataType: "hierarchical",
            }
        },
        isNewData: false,
        sourceData: undefined,
        visualData: undefined,
    },
    mutations: {
        updateIsNewData: (state, data) => {
            state.isNewData = data;
        },
        updateSourceData: (state, data) => {
            state.sourceData = data;
        },
        updateVisualData: (state, data) => {
            state.visualData = data;
        },
    },
    actions: {}
}

export default data
