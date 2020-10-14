import Vue from 'vue'
import data from './data.js'
import { dataDeepClone } from "@/utils/methods";
const analyze = {
    state: {
        currentOperations: [], // dataFlow中，存储source和target中间的操作，view切换后清空

        // 存储save的数据,{data(nodes+links):,dom(浅拷贝):} 
        undoList: [], // index: 0,1,2,3,4
        redoList: [], // index: 5,6,7,...

        // PageAnalyze.DataFlow
        pageAnalyzeTooltipData: { "nodes": [], "links": [] },

        // interaction
        operations: [], // operation={action:,nodes:,time:}
        operations_: [], // 切换view的操作

        // record
        // recordset是交互路径与交互视图状态
        recordset: { nodes: {}, links: [] },
    },
    mutations: {
        addRecordNode: (state, args) => {
            const { nodes } = state.recordset;
            const uuid = args.uuid;
            (uuid in nodes) || Vue.set(nodes, uuid, dataDeepClone(data.state.visualData));

            if (args.operation === "undo") {
                state.redoList.unshift(uuid);
            }
            else {
                state.undoList.push(uuid);
                if (args.operation !== "redo") {
                    // 若有其他操作，redo清空
                    state.redoList = [];
                }
            }
        },
        addRecordLink: (state, args) => {
            const { links } = state.recordset;
            links.push({
                ...args,
                time: new Date()
            })
        },
        addOperation: (state, data) => {
            state.operations.push(data);
            // const data = { chart: "", time: "", action: "", nodes: {} };
        },
        addOperation_: (state, data) => {
            state.operations_.push({
                ...data,
                ...{
                    max: "zoom"
                }
            });
            // let data = { chart: "", time: "", action: "", nodes: {} };
        },
        addCurrentOperations: (state, data) => {
            state.currentOperations.push(data);
        },
        resetCurrentOperations: (state) => {
            state.currentOperations = [];
        },
        changeUndoRedo: (state, fn) => {
            // fn为自定义函数
            fn(state.undoList, state.redoList);
        },
        updatePageAnalyzeTooltip: (state, val) => {
            state.pageAnalyzeTooltipData = val;
        },
        resetOperations: (state) => {
            state.operations = [];
            state.operations_ = [];
        },
        resetRecordset: (state) => {
            state.recordset = { nodes: {}, links: [] };
        },
    },
    actions: {
        addOperation(context, data) {
            context.commit('addOperation', data)
            const amark = Vue.prototype.$amark;
            const payload = {
                "user-uuid": window.sessionStorage.getItem("user-uuid"),
                time: +new Date(),
                ...data
            }
            amark.add(payload)
            console.log(payload);
        }
    }
}

export default analyze
