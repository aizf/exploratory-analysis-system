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
    state.view.visualData.nodes.forEach(node => {
      dSet = new Set([...dSet, ...Object.keys(node)]);
    });
    return [...dSet].filter(d => privateArr.every(i => i !== d)).sort();
  },
  selectedNodes: state => () => {
    let selectedNodes = state.data.visualData.nodes.filter(d =>
      !!d.selected
    );
    return selectedNodes;
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
  // analyze
  savedViewData: state => [...state.analyze.undoStack, ...state.analyze.redoStack],
  recordFlow: state => {
    // 返回格式化后的记录流
    // 先增加尾节点
    let nodes = [...state.analyze.recordset];
    nodes.push(state.analyze.recordData({
      data: state.data.visualData,
      uuid: state.view.currentUUID,
      operation: "current",
      time: new Date()
    }));
    nodes.forEach(node => {
      node.fixedValue = node.data.nodes.length;
    })
    // links
    let links = [];
    for (let i in nodes) {
      if (+i === 0) continue;
      links.push({
        source: nodes[+i - 1].uuid,
        target: nodes[+i].uuid,
        operation: nodes[+i - 1].operation
      })
    }

    return { "nodes": nodes, "links": links };
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
      "links": slicedLinks
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
  }
}

export default getters
