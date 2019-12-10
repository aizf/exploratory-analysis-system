const analyze = {
    state: {
        currentOperations: [], // dataFlow中，存储source和target中间的操作，view切换后清空
        dataFlow: {
            // 记录view切换过程及其view中的操作，nodes为view的信息，links为view的切换顺序及之间的操作
            // nodes:{id:UUID,data:{nodes:,links:},}
            nodes: [],
            // links:{source:,target:,options:[]}
            links: []
        },
        uuids: new Set(),
        operations: [], // operation={action:,nodes:,time:}
        operations_: [], // 切换view的操作
        // recordData,
        // 存储save的数据,{data(nodes+links):,dom(浅拷贝):} 
        undoList: [], // index: 0,1,2,3,4
        redoList: [], // index: 5,6,7,...

        // PageAnalyze.DataFlow
        pageAnalyzeTooltipData: {
            "nodes": [],
            "links": []
        },
        // record
        // recordset是存储recordData的列表
        recordset: [],
        recordData(args) {
            // 返回一个类的实例，用来存储节点信息
            class RecordData {
                constructor({ data, deepClone, uuid, operation, time, change = null }) {
                    // 存储的数据在操作之前
                    this.uuid = uuid;   // data的uuid
                    this.data = this.handleData(data, deepClone); // 操作之前的数据
                    this.operation = operation;
                    this.time = time;
                    this.change = change; // 当data变化不大时，data指向上一次的data，用change保存变化
                }
                handleData(data, deepClone) {
                    if (deepClone) {
                        return this.dataDeepClone(data);
                    } else {
                        return data;
                    }
                }
                dataDeepClone(oldData) {
                    // 深拷贝数据集，格式data={nodes:[],links:[]}
                    let oldNodes = oldData.nodes;
                    let oldLinks = oldData.links;
                    let newNodes = [];
                    let newLinks = [];
                    let tempDict = {};  // 查找字典
                    for (let oldNode of oldNodes) {
                        let newNode = Object.assign({}, oldNode);
                        newNodes.push(newNode);
                        tempDict[newNode.id] = newNode;
                    }
                    for (let oldLink of oldLinks) {
                        let newLink = Object.assign({}, oldLink);
                        // 更改 source 和 target 指向的 node
                        newLink.source = tempDict[newLink.source.id];
                        newLink.target = tempDict[newLink.target.id];
                        newLinks.push(newLink);
                    }
                    return {
                        nodes: newNodes,
                        links: newLinks,
                        uuid: oldData.uuid,
                        marked: oldData.marked
                    }
                }
            }
            return new RecordData(args);
        }
    },
    mutations: {
        addRecordData: (state, args) => {
            // args 格式: [data, uuid, operation,time]
            let d = state.recordData(args);
            state.recordset.push(d);
            if (args.operation === "undo") {
                state.redoList.push(d);
            }
            else {
                state.undoList.push(d);
                if (args.operation !== "redo") {
                    // 若有其他操作，redo清空
                    state.redoList = [];
                }
            }
        },
        addOperation: (state, data) => {
            state.operations.push(data);
            // let data = { chart: "", time: "", action: "", nodes: {} };
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
        addDataFlow: (state, item) => {
            // 数据流图数据
            // item={type:["nodes","links"],data:data}
            if (item.type !== "nodes" && item.type !== "links") {
                throw ("addDataFlow() 'item.type' error !");
            }
            // nodes:{id:UUID,data:{nodes:,links:},}
            // links:{source:,target:,options:[]}
            state.dataFlow[item.type].push(item.data);
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
        resetDataFlow: (state) => {
            state.dataFlow = {
                nodes: [],
                links: []
            };
        },
        resetRecordset: (state) => {
            state.recordset = [];
        },
    },
    actions: {}
}

export default analyze
