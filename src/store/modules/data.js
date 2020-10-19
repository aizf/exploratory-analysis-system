const data = {
    state: {
        sourceData: "",
        visualData: {},
        nodeFields: {},
        idNodeMap: {},
        linkMatrix: []
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
        updateIdNodeMap: (state, data) => {
            state.idNodeMap = data;
        },
        updateLinkMatrix: (state, data) => {
            state.linkMatrix = data;
        },
    },
    actions: {}
}

export default data
