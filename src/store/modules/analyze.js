import Vue from 'vue'
import { RecordData } from '@/utils/classes'
const analyze = {
    state: {
        currentOperations: [], // dataFlow中，存储source和target中间的操作，view切换后清空
        uuids: new Set(),

        // 存储save的数据,{data(nodes+links):,dom(浅拷贝):} 
        undoList: [], // index: 0,1,2,3,4
        redoList: [], // index: 5,6,7,...

        // PageAnalyze.DataFlow
        pageAnalyzeTooltipData: {
            "nodes": [],
            "links": []
        },

        // interaction
        operations: [], // operation={action:,nodes:,time:}
        operations_: [], // 切换view的操作

        // 已经存储的visualData
        existingViews: {},

        // record
        // recordset是存储recordData的列表
        recordset: [],
    },
    mutations: {
        addRecordData: (state, args) => {
            const d = new RecordData(args);
            state.recordset.push(d);
            if (args.operation === "undo") {
                state.redoList.unshift(args.data);
            }
            else {
                state.undoList.push(args.data);
                if (args.operation !== "redo") {
                    // 若有其他操作，redo清空
                    state.redoList = [];
                }
            }
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
        change_uuids: (state, fn) => {
            fn(state.uuids);
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
        handleExistingViews: (state, fn) => {
            fn(state.existingViews);
        },
        clearExistingViews: (state) => {
            state.existingViews = {};
        },
        resetRecordset: (state) => {
            state.recordset = [];
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
