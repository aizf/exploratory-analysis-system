/**
  * @param matrix 邻接矩阵
  * @param start 起点
  * */
const dijkstra = () => (matrix, start = 0) => {
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

const hierarchical2nodeLink = hData => {
    if (!hData) return;

    // nodes
    const nodes = [];

    function recurse(node) {
        if (node.children) node.children.forEach(recurse);
        // if (!node.id) node.id = ++i;
        if (!node.id) node.id = node.name;
        nodes.push(node);
    }
    recurse(hData);

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
}

module.exports = { hierarchical2nodeLink, dijkstra }