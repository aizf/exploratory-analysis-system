const getters = {
  // data
  nodes: state => state.data.visualData.nodes,
  links: state => state.data.visualData.links,
  nodesNumber: state => state.data.visualData.nodes.length,
  linksNumber: state => state.data.visualData.links.length,
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
    nodes.push(state.recordData({
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
  }
}

export default getters
