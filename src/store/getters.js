import Vue from 'vue'
import {  generateUUID } from "@/utils/methods";

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
        nodes: { ...recordset.nodes, [uuid]: state.data.visualData },
        links: recordset.links
      };
    }
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
      nodes: slicedNodes,
      links: slicedLinks,
      uuid: state.view.currentUUID,
      marked: false
    };
    // console.log("123", this);
  },
  beforeEvent: (state, getters) => (operation, vueComponent, backUUID = null) => {
    // vueComponent为调用此函数的组件实例
    const backOps = state.view.backOps;
    const uuid = state.view.currentUUID; // 该record对应的view的uuid

    vueComponent.$store.commit("addRecordNode", { uuid, operation });
    vueComponent.$store.commit("updateParentUUID", uuid);

    const args = { operation, source: uuid }
    if (backOps.includes(operation)) {
      vueComponent.$store.commit("updateVisualData", state.analyze.recordset.nodes[backUUID]);
      vueComponent.$store.commit("updateCurrentUUID", backUUID);
      vueComponent.$store.commit("addRecordLink", { ...args, target: backUUID });
    } else {
      const newUUID = generateUUID();
      state.data.visualData.marked = false;
      vueComponent.$store.commit("updateCurrentUUID", newUUID);
      vueComponent.$store.commit("addRecordLink", { ...args, target: newUUID });
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
