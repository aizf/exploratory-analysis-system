const public_function = {
  state: {

    formattedDataFlow() {
      const {
        nodes,
        links
      } = this.analyze.dataFlow;
      const uniqIds = {}; // id:id's nodes size

      // removeRepetitiveNodes
      nodes.filter(node => {
        if (uniqIds[node.id] === undefined) {
          node.fixedValue = node.data.nodes.length;
          uniqIds[node.id] = node.data.nodes.length;
          return true;
        } else {
          return false;
        }
      });

      // function addLinksValue(links) {
      links.forEach(link => {
        link.value = uniqIds[link.target] || uniqIds[link.target.id];
      })
    },
    dataDeepClone(oldData) {
      // 不适用与所有的Object !!!
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
      return { nodes: newNodes, links: newLinks }
    }
  }
}

export default public_function
