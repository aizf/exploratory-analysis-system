import Vue from 'vue'
import { dataDeepClone, generateUUID } from "@/utils/methods";
import { RecordData } from '@/utils/classes'

const getters = {
  // data
  nodes: state => state.data.visualData.nodes,
  links: state => state.data.visualData.links,
  nodesNumber: state => state.data.visualData.nodes.length,
  linksNumber: state => state.data.visualData.links.length,

  // view
  tmpExistingViews: (state) => {
    // 带有当前视图状态，当前的状态是可改变的
    const recordset = state.analyze.recordset;
    const uuid = state.view.currentUUID; // 当前view的uuid
    if (uuid in recordset.nodes) {
      return recordset;
    } else {
      return {
        nodes: { ...recordset.nodes, [uuid]: state.data.visualData},
        links: recordset.links
      };
    }
  },

  // analyze
  recordFlow: (state, getters) => {
    // 返回格式化后的记录流
    // 先增加尾节点
    const rs = [...state.analyze.recordset];
    rs.push(new RecordData({
      index: state.analyze.recordset.length,
      data: getters.tmpExistingViews[state.view.currentUUID],
      operation: "current",
      time: new Date(),
    }));
    // debugger
    // 去除uuid相同的node
    const nodes = Object.values(getters.tmpExistingViews).map(d => ({
      data: d,
      // time: rs[i].time,
      fixedValue: d.nodes.length,
    }));

    // links
    const links = [];
    for (let i = 1; i < rs.length; i++) {
      // 防止连通
      switch (rs[i - 1].operation) {
        case "undo":
        case "redo":
        case "rollback":
          continue;
        default:
          break;
      }
      links.push({
        operation: rs[i - 1].operation,
        source: rs[i - 1].data.uuid,
        target: rs[i].data.uuid,
      })
    }

    return Vue.observable({ "nodes": nodes, "links": links });
  },
  markedVisualData: (state, getters) => {
    return Object.values(getters.tmpExistingViews).filter(d => d.marked);
  },
  // function
  viewSlice: state => () => {
    // 返回slice后的nodes和links
    // console.log(this);
    const removedNodes = [];
    const slicedNodes = state.data.visualData.nodes.filter(d => {
      if (d.selected) return true;
      else {
        removedNodes.push(d);
        return false;
      }
    });
    const slicedLinks = state.data.visualData.links.filter(d =>
      removedNodes.every(rd => {
        const id = rd.id ? "id" : "name";
        return rd[id] !== d.source[id] && rd[id] !== d.target[id];
      })
    );
    // console.log("123", slicedLinks);
    return {
      "nodes": slicedNodes,
      "links": slicedLinks,
      uuid: state.view.currentUUID,
      marked: false
    };
    // console.log("123", this);
  },
  beforeEvent: (state, getters) => (operation, vueComponent, backData = {}) => {
    // vueComponent为调用此函数的组件实例
    const backOps = state.view.backOps;
    const uuid = state.view.currentUUID; // 该record对应的view的uuid
    const newUUID = generateUUID();

    const args = {
      source: uuid,
      target:newUUID,
      operation, // view之后的操作
    };
    vueComponent.$store.commit("addRecordData", args);
    vueComponent.$store.commit("updateParentUUID", uuid);

    if (backOps.includes(operation)) {
      vueComponent.$store.commit("updateVisualData", dataDeepClone(backData));
      vueComponent.$store.commit("updateCurrentUUID", backData.uuid);
    } else {
      state.data.visualData.marked = false;
      vueComponent.$store.commit("updateCurrentUUID", newUUID);
    }
  },
  afterEvent: (state, getters) => (operation, subjects, vueComponent) => {
    const args = {
      index: state.analyze.recordset.length - 1,
      visualData: state.analyze.recordset[state.analyze.recordset.length - 2].data,
      subjects: subjects,
      operation: operation,
      time: new Date(),
    }
  }
}

export default getters
