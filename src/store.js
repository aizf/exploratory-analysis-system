import Vue from 'vue'
import Vuex from 'vuex'
// import * as d3 from "d3";

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // datasets的键(key)对应<a-menu-item>的key
    datasets: {
      "energy": {
        fileName: "energy.json",
        dataType: "node-link",
      },
      "miserables": {
        fileName: "miserables.json",
        dataType: "node-link",
      },
      "readme": {
        fileName: "readme.json",
        dataType: "hierarchical",
      },
      "test": {
        fileName: "test.json",
        dataType: "hierarchical",
      }
    },
    isNewData: false,
    sourceData: undefined,
    visualData: undefined,
    viewUpdate: {
      force: false,
      scatter: false,
      table: false
    },
    parentUUID: "root",
    currentUUID: "root",
    currentOptions:[],  // dataFlow中，source和target中间的操作
    dataFlow: {
      // nodes:{id:UUID,data:{nodes:,links:},}
      nodes: [],
      // links:{source:,target:,options:[]}
      links: []
    },
    operations: [], // operation={action:,nodes:,time:}
    operationTypes: ["click", "drag", "mouseover", "brush", "invertBrush", "zoom"],
    operations_: [], // 改变visualData的操作
    operation_Types: ["rollback", "slice", "sliceUndo"],
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
    // 存储save的数据,{data(nodes+links):,dom(浅拷贝):} 
    undoStack: [], // index: 0,1,2,3,4
    redoStack: [], // index: 5,6,7,...


    rollbacked: false,

    // 依赖对象属性，不用getter
    viewSlice() {
      let removedNodes = [];
      let slicedNodes = this.visualData.nodes.filter(d => {
        if (d.selected) return true;
        else {
          removedNodes.push(d);
          return false;
        }
      });
      let slicedLinks = this.visualData.links.filter(d =>
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
    getDimensions() {
      // 获得node的属性(维度)有哪些
      let privateArr = [
        "fx", "fy",
        "x", "y",
        "xx", "yy",
        "vx", "vy",
        "x0", "y0",
        "x1", "y1",
        "children"
      ];
      let dSet = new Set();
      this.visualData.nodes.forEach(node => {
        dSet = new Set([...dSet, ...Object.keys(node)]);
      });
      return [...dSet].filter(d => privateArr.every(i => i !== d)).sort();
    },
    generateUUID() {
      let d = new Date().getTime();
      if (window.performance && typeof window.performance.now === "function") {
        d += performance.now(); //use high-precision timer if available
      }
      let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
      return uuid;
    }
  },
  getters: {
    nodes: (state) => {
      return state.visualData.nodes;
    },
    links: (state) => {
      return state.visualData.links;
    },
    nodesNumber: (state) => {
      return state.visualData.nodes.length;
    },
    linksNumber: (state) => {
      return state.visualData.links.length;
    },
    savedViewData: (state) => {
      return [...state.undoStack, ...state.redoStack];
    },
    hierarchical2nodeLink: (state) => {
      if (!state.sourceData) return;

      // nodes
      let nodes = [];

      function recurse(node) {
        if (node.children) node.children.forEach(recurse);
        // if (!node.id) node.id = ++i;
        if (!node.id) node.id = node.name;
        nodes.push(node);
      }
      recurse(state.sourceData);

      // links
      function getLinks(nodes) {
        let links = [];
        nodes.forEach(function (node) {
          if (node.children) { // Don’t include the root’s parent, if any.
            node.children.forEach(function (child) {
              links.push({
                source: node,
                target: child
              });
            })
          }
        });
        return links;
      }

      return {
        "nodes": nodes,
        "links": getLinks(nodes)
      };
    },

  },
  mutations: {
    updateIsNewData: (state, data) => {
      state.isNewData = data;
    },
    updateSourceData: (state, data) => {
      state.sourceData = data;
    },
    updateVisualData: (state, data) => {
      state.visualData = data;
    },
    updateParentUUID: (state, data) => {
      state.parentUUID = data;
    },
    updateCurrentUUID: (state, data) => {
      state.currentUUID = data;
    },
    updateViewUpdate: (state, chart, val) => {
      let charts = ["force", "scatter", "table"];
      chart === "all" ? (charts.forEach(c => {
        state.viewUpdate[c] = true;
      })) : (state.viewUpdate[chart] = val);
    },
    resetOperations: (state) => {
      state.operations = [];
      state.operations_ = [];
      state.dataFlow = {
        nodes: [],
        links: []
      };
      state.parentUUID = "root";
      state.currentUUID = "root";
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
    addCurrentOptions: (state, data) => {
      state.currentOptions.push(data);
    },
    resetCurrentOptions: (state) => {
      state.currentOptions = [];
    },
    changeSavedViewData: (state, fn) => {
      let undo = state.undoStack;
      let redo = state.redoStack;
      // fn为自定义函数
      fn(undo, redo);
    }
  },
  actions: {

  }
})