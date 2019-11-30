const public_function = {
  state: {

    formattedDataFlow() {
      let {
        nodes,
        links
      } = this.analyze.dataFlow;
      let uniqIds = {}; // id:id's nodes size

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
    },
    layoutRange(data, args) {
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
}

export default public_function
