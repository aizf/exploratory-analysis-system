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
        selectedNodes() {
            let selectedNodes = this.data.visualData.nodes.filter(d =>
                !!d.selected
            );
            return selectedNodes;
        },
        viewSlice() {
            // 返回slice后的nodes和links
            // console.log(this);
            let removedNodes = [];
            let slicedNodes = this.data.visualData.nodes.filter(d => {
                if (d.selected) return true;
                else {
                    removedNodes.push(d);
                    return false;
                }
            });
            let slicedLinks = this.data.visualData.links.filter(d =>
                removedNodes.every(rd => {
                    let id = rd.id ? "id" : "name";
                    return rd[id] !== d.source[id] && rd[id] !== d.target[id];
                })
            );
            // console.log("123", slicedLinks);
            return {
                "nodes": slicedNodes,
                "links": slicedLinks
            };
            // console.log("123", this);
        },
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
