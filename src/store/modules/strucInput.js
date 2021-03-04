// strucInput
export default {
    state: {
        nodes: [],
        links: [],
        isUpdate: false
    },
    mutations: {
        updateG: (state, { nodes, links }) => {
            state.nodes = nodes;
            state.links = links;
            if (nodes.length === 0) return;
            state.isUpdate = true;
        },
        updateGDone: (state) => {
            state.isUpdate = false;
        },
        // strucAdd: (state, { nodes, links }) => {
        //     state.nodes = nodes;
        //     state.links = links;
        // },
    },
    actions: {}
}
