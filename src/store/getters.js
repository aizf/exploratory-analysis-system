import Vue from 'vue'

const getters = {
  // data
  nodes: state => state.data.visualData.nodes,
  links: state => state.data.visualData.links,
  nodesNumber: state => state.data.visualData.nodes.length,
  linksNumber: state => state.data.visualData.links.length,
  nodeFields__: state => {
    return state.data.datasets[state.data.selectedDataset].nodeFields;
  },
  nodeFields: (state, getters) => {
    return Object.keys(getters.nodeFields__).sort();
  },
  hierarchical2nodeLink: state => {
    if (!state.data.sourceData) return;

    // nodes
    const nodes = [];

    function recurse(node) {
      if (node.children) node.children.forEach(recurse);
      // if (!node.id) node.id = ++i;
      if (!node.id) node.id = node.name;
      nodes.push(node);
    }
    recurse(state.data.sourceData);

    // links
    function getLinks(nodes) {
      const links = [];
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
  tmpExistingViews: (state) => {
    const uuid = state.view.currentUUID; // 该record对应的view的uuid
    if (Object.keys(state.analyze.existingViews).includes(uuid + "")) {
      return state.analyze.existingViews;
    } else {
      state.data.visualData.uuid = uuid;
      return {
        ...state.analyze.existingViews,
        [uuid]: state.data.visualData
      };
    }
  },

  // analyze
  recordFlow: (state, getters) => {
    // 返回格式化后的记录流
    // 先增加尾节点
    const rs = [...state.analyze.recordset];
    rs.push(state.analyze.recordData({
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

    return { "nodes": nodes, "links": links };
  },
  markedVisualData: (state, getters) => {
    return Object.values(getters.tmpExistingViews).filter(d => d.marked);
  },
  operations: (state, getters) => {
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
  layoutRange: () => (data, args) => {
    // args 上右下左的属性field
    const dict = [];
    for (const i in args) {
      dict[+i] = data[0][args[+i]];
    }

    for (const d of data.slice(1)) {
      for (const i in args) {
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
    let uid = 1;
    return function (_) {
      return arguments.length ? (uid = +_) : uid++;
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
  dataDeepClone: () => (oldData, uuid = oldData.uuid) => {
    // 深拷贝数据集，格式data={nodes:[],links:[]}
    const oldNodes = oldData.nodes;
    const oldLinks = oldData.links;
    const newNodes = [];
    const newLinks = [];
    const tempDict = {};  // 查找字典
    for (const oldNode of oldNodes) {
      const newNode = Object.assign({}, oldNode);
      newNodes.push(newNode);
      tempDict[newNode.id] = newNode;
    }
    for (const oldLink of oldLinks) {
      const newLink = Object.assign({}, oldLink);
      // 更改 source 和 target 指向的 node
      newLink.source = tempDict[newLink.source.id];
      newLink.target = tempDict[newLink.target.id];
      newLinks.push(newLink);
    }
    return {
      uuid: uuid,
      nodes: newNodes,
      links: newLinks,
      marked: oldData.marked
    }
  },
  beforeEvent: (state, getters) => (operation, vueComponent, backData = {}) => {
    // vueComponent为调用此函数的组件实例
    const backOps = state.view.backOps;
    const index = state.analyze.recordset.length;  // record的index
    const uuid = state.view.currentUUID; // 该record对应的view的uuid
    const time = new Date(); //

    if (!Object.keys(state.analyze.existingViews).includes(uuid + "")) {
      vueComponent.$store.commit("handleExistingViews", (views) => {
        Vue.set(views, uuid, getters.dataDeepClone(state.data.visualData, uuid));
      });
    }
    const data = state.analyze.existingViews[uuid];

    const args = {
      index,  // record的index
      data, // 该record对应的view的uuid
      operation, // view之后的操作
      time, //
    };
    vueComponent.$store.commit("addRecordData", args);
    vueComponent.$store.commit("updateParentUUID", uuid);

    if (backOps.includes(operation)) {
      vueComponent.$store.commit("updateVisualData", getters.dataDeepClone(backData));
      vueComponent.$store.commit("updateCurrentUUID", backData.uuid);
    } else {
      state.data.visualData.marked = false;
      vueComponent.$store.commit("updateCurrentUUID", getters.generateUUID());
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
  },
  /**
   * @param matrix 邻接矩阵
   * @param start 起点
   * */
  dijkstra: () => (matrix, start = 0) => {
    const rows = matrix.length,
      cols = matrix[0].length;
    // 剩余的indexes
    const remaining = new Array(rows).fill(0).map((d, i) => i);

    if (rows !== cols || start >= rows) throw new Error("邻接矩阵错误或者源点错误");

    // 初始化distance,book
    // distance存储最短距离,book存储已经遍历的点
    const distance = new Array(rows);
    for (let index = 0; index < rows; index++) {
      distance[index] = { value: Infinity, path: [] };
      // value为路径长度，path路径
    }
    distance[start].value = 0;

    while (remaining.length > 1) {
      const minVal = Math.min(...distance.filter((d, index) => remaining.includes(index)).map(d => d.value));
      if (minVal >= Infinity) break;

      const i = distance
        .findIndex((d, index) => remaining.includes(index) && d.value === minVal); // 最小数的index

      remaining.splice(remaining.indexOf(i), 1);

      for (let j = 0; j < cols; j++) {
        // 如果已经是最短路径的节点，则continue
        if (!remaining.includes(j)) continue;
        // 通过比较distance[i].value + matrix[i][j]和distance[j].value的大小来决定是否更新distance[j]
        if (distance[i].value + matrix[i][j] < distance[j].value) {
          distance[j].path = [...distance[i].path, i];
          distance[j].value = matrix[i][j] + distance[i].value;
        }
      }

    }
    return distance;
  }

}

export default getters
