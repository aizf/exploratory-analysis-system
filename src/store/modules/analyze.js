import Vue from 'vue'
import data from './data.js'
import { dataDeepClone } from "@/utils/methods";
const analyze = {
    state: {
        // 存储save的数据,{data(nodes+links):,dom(浅拷贝):} 
        undoList: [], // index: 0,1,2,3,4
        redoList: [], // index: 5,6,7,...

        // interaction
        operations: [], // operation={action:,nodes:,time:}

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
        changeUndoRedo: (state, fn) => {
            // fn为自定义函数
            fn(state.undoList, state.redoList);
        },
        resetOperations: (state) => {
            state.operations = [];
        },
        resetRecordset: (state) => {
            state.recordset = { nodes: {}, links: [] };
        },
    },
    actions: {
        addOperation(context, data) {
            // data.nodes.forEach(d => d.attentionTimes++)
            // context.commit('addOperation', data)
            // const payload = {
            //     "user-uuid": window.sessionStorage.getItem("user-uuid"),
            //     time: +new Date(),
            //     ...data
            // }
            // const amark = Vue.prototype.$amark;
            // amark && amark.add(payload)
            // console.log(payload);
        }
    }
}

export default analyze
