const data = {
    state: {
        datasets: {
            // Node-Link
            "energy": {
                fileName: "energy.json",
                dataType: "node-link",
                nodeFields: {
                    "id": { alias: "id", type: "cat" }
                }
            },
            "miserables": {
                fileName: "miserables.json",
                dataType: "node-link",
                nodeFields: {
                    "id": { alias: "id", type: "cat" },
                    "group": { alias: "group", type: "cat" }
                }
            },
            // Hierarchical
            "readme": {
                fileName: "readme.json",
                dataType: "hierarchical",
                nodeFields: {
                    "id": { alias: "id", type: "cat" },
                    "size": { alias: "size", type: "linear" }
                }
            },
            "test": {
                fileName: "test.json",
                dataType: "hierarchical",
                nodeFields: {
                    "id": { alias: "id", type: "cat" },
                    "size": { alias: "size", type: "linear" }
                }
            },
            // Only Node
            "cars": {
                fileName: "cars.json",
                dataType: "node",
                nodeFields: {
                    "Name": { alias: "Name", type: "cat" },
                    "Miles_per_Gallon": { alias: "Miles per Gallon", type: "linear" },
                    "Cylinders": { alias: "Cylinders", type: "linear" },
                    "Displacement": { alias: "Displacement", type: "linear" },
                    "Horsepower": { alias: "Horsepower", type: "linear" },
                    "Weight_in_lbs": { alias: "Weight in lbs", type: "linear" },
                    "Acceleration": { alias: "Acceleration", type: "linear" },
                    "Year": { alias: "Year", type: "time" },
                    "Origin": { alias: "Origin", type: "cat" },
                }
            },
            "jobs": {
                fileName: "jobs.json",
                dataType: "node",
                nodeFields: {
                    "job": { alias: "job", type: "cat" },
                    "sex": { alias: "sex", type: "cat" },
                    "year": { alias: "year", type: "cat" },
                    "count": { alias: "count", type: "linear" },
                    "perc": { alias: "perc", type: "linear" },
                }
            },
            "barley": {
                fileName: "barley.json",
                dataType: "node",
                nodeFields: {
                    "yield": { alias: "job", type: "linear" },
                    "variety": { alias: "job", type: "cat" },
                    "year": { alias: "job", type: "cat" },
                    "site": { alias: "job", type: "cat" },
                }
            },
        },
        selectedDataset: "",
        sourceData: {},
        visualData: {}
    },
    mutations: {
        changeSelectedDataset: (state, payload) => {
            state.selectedDataset = payload;
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
