const data = {
    state: {
        sourceData: "",
        visualData: {},
        nodeFields: {},
        uidMaps: {
            idNodeMap: {},  // id映射对应节点
            uidNodeMap: [],  // id映射对应节点
            uidLinksMap: [], // id映射对应边
            uidLinkedNodesMap: [],// id映射连接的所有节点
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
        updateUidMaps: (state, data) => {
            state.uidMaps = data;
        }
    },
    actions: {}
}

export default data
