const view = {
    state: {
        dpiX: 1920,
        dpiY: 1080,
        backgroundColor: "#333",
        contrastColor: "#eee",
        colorPalette: [
            // 11类
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
        viewUpdate: {
            force: false,
            scatter: false,
            table: false
        },
        operationTypes: ["click", "drag", "mouseover", "brush", "invertBrush", "zoom"],
        operation_Types: ["rollback", "slice", "sliceUndo"],
        parentUUID: "root", //当前view的父view的UUID
        currentUUID: "root", //当前view的UUID
    },
    mutations: {
        updateParentUUID: (state, data) => {
            state.parentUUID = data;
        },
        updateCurrentUUID: (state, data) => {
            state.currentUUID = data;
        }, updateViewUpdate: (state, chart, val) => {
            let charts = ["force", "scatter", "table"];
            chart === "all" ? (charts.forEach(c => {
                state.viewUpdate[c] = true;
            })) : (state.viewUpdate[chart] = val);
        },
    },
    actions: {}
}

export default view
