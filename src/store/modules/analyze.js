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
        operations: [], // operation={action:,nodes:,time:}
        operations_: [], // 切换view的操作
        // recordData,
        // 存储save的数据,{data(nodes+links):,dom(浅拷贝):} 
        undoStack: [], // index: 0,1,2,3,4
        redoStack: [], // index: 5,6,7,...


        rollbacked: false,

        // PageAnalyze.DataFlow
        pageAnalyzeTooltipUpdata: false,
        pageAnalyzeTooltipData: {
            "nodes": [],
            "links": []
        },
        // record
        // recordset是存储recordData的列表
        recordset: [],
        recordData(arg) {
            // 返回一个类的实例，用来存储节点信息
            class RecordData {
                constructor({ data, uuid, operation, time, change = null }) {
                    // 存储的数据在操作之前
                    this.data = this.dataDeepClone(data); // 操作之前的数据
                    this.uuid = uuid;
                    this.operation = operation;
                    this.time = time;
                    this.change = change; // 当data变化不大时，data指向上一次的data，用change保存变化
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
                    return { nodes: newNodes, links: newLinks }
                }
            }
            return new RecordData(arg);
        }
    },
    mutations: {
        addRecordData: (state, arg) => {
            // arg 格式: [data, uuid, operation,time]
            state.recordset.push(state.recordData(arg));
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
        changeSavedViewData: (state, fn) => {
            let undo = state.undoStack;
            let redo = state.redoStack;
            // fn为自定义函数
            fn(undo, redo);
        },
        updatePageAnalyzeTooltip: (state, val) => {
            // debugger
            state.pageAnalyzeTooltipData = val.data;
            // state.pageAnalyzeTooltipUpdata = val.update; // true or false
            // 改变状态，触发watch
            state.pageAnalyzeTooltipUpdata = !state.pageAnalyzeTooltipUpdata;
        }
    },
    actions: {}
}

export default analyze
