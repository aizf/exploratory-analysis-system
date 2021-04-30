const data = {
    state: {
        sourceData: "",
        sourceNum: 0,
        datasetName:"",
        visualData: {},
        nodeFields: {},
        uidMaps: {
            idNodeMap: {},  // id映射对应节点
            uidNodeMap: [],  // uid映射对应节点
            uidLinksMap: [], // uid映射对应边
            uidLinkedNodesMap: [],// uid映射连接的所有节点
        },
        isDirected: false,
        static: false
    },
    mutations: {
        updateSourceData: (state, data) => {
            state.sourceData = data;
        },
        updateSourceNum: (state, data) => {
            state.sourceNum = data;
        },
        updateDatasetName: (state, data) => {
            state.datasetName = data;
        },
        updateVisualData: (state, data) => {
            state.visualData = data;
        },
        updateNodeFields: (state, data) => {
            state.nodeFields = data;
        },
        updateUidMaps: (state, data) => {
            state.uidMaps = data;
        },
        updateIsDirected: (state, data) => {
            state.isDirected = data;
        },
        updateStatic: (state) => {
            state.static = true;
        }
    },
    actions: {}
}

export default data
