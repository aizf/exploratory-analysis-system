const getters = {
  // data
  nodes: state => state.data.visualData.nodes,
  links: state => state.data.visualData.links,
  nodesNumber: state => state.data.visualData.nodes.length,
  linksNumber: state => state.data.visualData.links.length,
  dimensions: state => {
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
    state.data.visualData.nodes.forEach(node => {
      dSet = new Set([...dSet, ...Object.keys(node)]);
    });
    return [...dSet].filter(d => privateArr.every(i => i !== d)).sort();
  },
  hierarchical2nodeLink: state => {
    if (!state.data.sourceData) return;

    // nodes
    let nodes = [];

    function recurse(node) {
      if (node.children) node.children.forEach(recurse);
      // if (!node.id) node.id = ++i;
      if (!node.id) node.id = node.name;
      nodes.push(node);
    }
    recurse(state.data.sourceData);

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
  // view
  existingViews: state => {
    // {uuid1:data1,...}
    let map = new Map();
    state.analyze.recordset.forEach(d => {
      map.set(d.data.uuid, d.data);
    });
    return map;
  },
  uniqueViews: (state, getters) => {
    // {uuid1:data1,...}
    let map = new Map(getters.existingViews);
    map.set(state.view.currentUUID, state.data.visualData);
    return map;
  },
  // analyze
  recordFlow: state => {
    // 返回格式化后的记录流
    // 先增加尾节点
    let rs = [...state.analyze.recordset];
    rs.push(state.analyze.recordData({
      data: state.data.visualData,
      deepClone: !((rs.map(d => d.data.uuid)).includes(state.view.currentUUID)),
      uuid: state.view.currentUUID,
      operation: "current",
      time: new Date(),
      marked: state.view.marked
    }));
    // debugger
    // 去除uuid相同的node
    let uuids = new Set();
    let nodes = [];
    let links = [];
    for (let i = 0; i < rs.length; i++) {
      // nodes
      if (!uuids.has(rs[i].uuid)) {
        uuids.add(rs[i].uuid);
        nodes.push({
          data: rs[i].data,
          uuid: rs[i].uuid,
          time: rs[i].time,
          fixedValue: rs[i].data.nodes.length,
          marked: rs[i].data.marked
        });
      }
      // links
      if (i === 0) continue;
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
        source: rs[i - 1].uuid,
        target: rs[i].uuid,
      })
    }

    return { "nodes": nodes, "links": links };
  },
  markedVisualData: (state, getters) => {
    return [...getters.uniqueViews.values()].filter(d => d.marked);
  },
  // function
  viewSlice: state => () => {
    // 返回slice后的nodes和links
    // console.log(this);
    let removedNodes = [];
    let slicedNodes = state.data.visualData.nodes.filter(d => {
      if (d.selected) return true;
      else {
        removedNodes.push(d);
        return false;
      }
    });
    let slicedLinks = state.data.visualData.links.filter(d =>
      removedNodes.every(rd => {
        let id = rd.id ? "id" : "name";
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
  layoutRange: () => (data, args) => {
    // args 上右下左的属性field
    let dict = [];
    for (let i in args) {
      dict[+i] = data[0][args[+i]];
    }

    for (let d of data.slice(1)) {
      for (let i in args) {
        switch (i) {
          case "0": // 上
          case 0:
          case "3": // 左
          case 3:
            dict[+i] = Math.min(d[args[+i]], dict[+i]);
            break;
          case "1": // 右
          case 1:
          case "2": // 下
          case 2:
            dict[+i] = Math.max(d[args[+i]], dict[+i]);
            break;
          default:
            throw new Error(`layoutRange args error`);
        }
      }
    }

    return Object.values(dict);
  },
  generateUUID: () => {
    // 全局产生视图uid的function
    let __uid = 1;
    return function () {
      let uid = __uid;
      __uid += 1;
      return uid;
    };
  },
  // generateUUID: () => () => {
  //   let d = new Date().getTime();
  //   if (window.performance && typeof window.performance.now === "function") {
  //     d += performance.now(); //use high-precision timer if available
  //   }
  //   let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
  //     let r = (d + Math.random() * 16) % 16 | 0;
  //     d = Math.floor(d / 16);
  //     return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  //   });
  //   return uuid;
  // },
  beforeEvent: (state, getters) => (operation, vueComponent) => {
    // vueComponent为调用此函数的组件实例
    let args = {
      data: state.data.visualData,
      deepClone: true,
      uuid: state.view.currentUUID,
      operation: operation,
      time: new Date(),
    };
    vueComponent.$store.commit("addRecordData", args);
    state.data.visualData.marked = false;
    vueComponent.$store.commit("updateParentUUID", state.view.currentUUID);
    vueComponent.$store.commit("updateCurrentUUID", getters.generateUUID());
    state.data.visualData.uuid = state.view.currentUUID;
  }
}

export default getters
