const data = {
    state: {
        datasets: {
            // Node-Link
            "energy": {
                fileName: "energy.json",
                dataType: "node-link",
            },
            "miserables": {
                fileName: "miserables.json",
                dataType: "node-link",
            },
            // Hierarchical
            "readme": {
                fileName: "readme.json",
                dataType: "hierarchical",
            },
            "test": {
                fileName: "test.json",
                dataType: "hierarchical",
            },
            // Only Node
            "cars": {
                fileName: "cars.json",
                dataType: "node",
            },
            "jobs": {
                fileName: "jobs.json",
                dataType: "node",
            },
            "barley": {
                fileName: "barley.json",
                dataType: "node",
            },
        },
        isNewData: false,
        sourceData: {},
        visualData: {},
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
