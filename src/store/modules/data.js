const data = {
    state: {
        sourceData: "",
        visualData: {},
        nodeFields: {},
        idMaps: {
            idNodeMap: {},  // id映射对应节点
            idLinksMap: {}, // id映射对应边
            idLinkedNodesMap: {},// id映射连接的所有节点
        }
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
        updateIdMaps: (state, data) => {
            state.idMaps = data;
        }
    },
    actions: {}
}

export default data
