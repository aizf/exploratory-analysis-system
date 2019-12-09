const view = {
    state: {
        dpiX: 1920,
        dpiY: 1080,
        backgroundColor: "#333",
        contrastColor: "#eee",
        colorPalette: [
            // 11类
            // 分组
            "#dd6b66",
            "#759aa0",
            "#e69d87",
            "#8dc1a9",
            "#ea7e53",
            "#eedd78",
            "#73a373",
            "#73b9bc",
            "#7289ab",
            "#91ca8c",
            "#f49f42"
        ],
        colorPalette2: [
            // 12类
            // 操作种类
            "#8dd3c7", "#ffffb3", "#bebada",
            "#fb8072", "#80b1d3", "#fdb462",
            "#b3de69", "#fccde5", "#d9d9d9",
            "#bc80bd", "#ccebc5", "#ffed6f"
        ],
        operationTypes: ["click", "drag", "mouseover", "brush", "invertBrush", "zoom", "filter", "undo", "redo"],
        operation_Types: ["rollback", "filter", "undo", "redo"],
        // 回溯种类的操作
        backOps: ["undo", "rollback"],
        parentUUID: "none", //当前view的父view的UUID
        currentUUID: "root", //当前view的UUID
        chartsNeedUpdate: {
            "force": false,
            "scatter": false,
            "table": false
        },
        // toolbox
        marked: false,
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
        TableUpdated: ({ chartsNeedUpdate }) => {
            chartsNeedUpdate.table = false;
        },
        ChartsNeedUpdate: ({ chartsNeedUpdate }) => {
            for (let key in chartsNeedUpdate) {
                chartsNeedUpdate[key] = true;
            }
        },
        changeMarked: (state, payload) => {
            state.marked = payload;
        }
    },
    actions: {}
}

export default view
