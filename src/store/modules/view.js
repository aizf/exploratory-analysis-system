const view = {
    state: {
        dpiX: 1920,
        dpiY: 1080,
        operationTypes: ["click", "drag", "mouseover", "brush", "classification", "invertBrush", "zoom", "filter", "undo", "redo", "rollback"],
        // 回溯种类的操作
        backOps: ["undo", "redo", "rollback"],
        parentUUID: "none", //当前view的父view的UUID
        currentUUID: "root", //当前view的UUID
        chartsNeedUpdate: {
            "force": false,
            "scatter": false,
        },
        // toolbox
    },
    mutations: {
        updateParentUUID: (state, payload) => {
            state.parentUUID = payload;
        },
        updateCurrentUUID: (state, payload) => {
            state.currentUUID = payload;
        },
        ForceUpdated: ({ chartsNeedUpdate }) => {
            chartsNeedUpdate.force = false;
        },
        ScatterUpdated: ({ chartsNeedUpdate }) => {
            chartsNeedUpdate.scatter = false;
        },
        ChartsNeedUpdate: ({ chartsNeedUpdate }) => {
            for (const key in chartsNeedUpdate) {
                chartsNeedUpdate[key] = true;
            }
        }
    },
    actions: {}
}

export default view
