const public_function = {
  state: {
    generateUUID() {
      // 产生UUID，全局唯一，目前只有slice后调用
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
    },
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
