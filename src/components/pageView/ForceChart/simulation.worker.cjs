self.importScripts("//cdn.jsdelivr.net/npm/d3@6/dist/d3.min.js");
const d3 = self.d3;

self.nodes = [];
self.links = [];
self.uidMap = {};
self.chartOption = {}
self.width = 0
self.height = 0
self.subSimulations = [];
// "communities"
self.simulationType = "globel";
let typeMax = 0;

const simulation = d3
    .forceSimulation()
    .force(
        "link",
        d3.forceLink().id((d) => d.uid || d.id || d.name)
    )
    .force("charge", d3.forceManyBody())
    .stop();

/**
* 获取环形坐标
* @param {Number} x 圆心x坐标
* @param {Number} y 圆心y坐标
* @param {Number} r 圆半径
* @param {Number} nodeNum 节点总的数量
* @param {Number} nodeIndex 当前节点下标
* @param {Number} changeAngle 改变初始角度，初始角度：x轴正方向为圆的起始角度0°，以顺时针旋转计算
* @return {Array} [x_,y_] 目标点的坐标x_,y_
*/
const getCirclePosition = ({ x, y, r, nodeNum, nodeIndex, changeAngle }) => {
    // 获取平分的角度
    let angle = 360 / nodeNum;
    // 获取当前角度值
    let currentAngle = angle * nodeIndex;
    // 调整这个角度，即可变换初始角度
    if (changeAngle) {
        currentAngle = currentAngle + changeAngle;
    }
    // 圆上点的x_
    let x_ = x + r * Math.cos((currentAngle * Math.PI) / 180);
    // 圆上点的y_
    let y_ = y + r * Math.sin((currentAngle * Math.PI) / 180);

    return [x_, y_]
}

const genSubSimulation = (nodes, links, type) => {
    const pos = getCirclePosition(
        {
            x: self.width / 2,
            y: self.height / 2,
            r: self.width / 2,
            nodeNum: typeMax,   // +1 for others
            nodeIndex: type
        }
    );
    // console.log(pos);
    const simulation = d3
        .forceSimulation(nodes)
        .force("link", d3.forceLink(links).id((d) => d.uid || d.id || d.name))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(...pos))
        .on("tick", () => {
            nodes.forEach(({ uid, x, y }) => {
                const node = self.uidMap[uid];
                // console.log(x, y);
                node.x = x;
                node.y = y;
            })
        })
        .stop();
    return simulation;
}

const init = ({ width, height, chartOption, nodes, links }) => {
    self.width = width
    self.height = height
    self.chartOption = chartOption
    simulation.force("center", d3.forceCenter(self.width / 2, self.height / 2));
    simulation.force("charge").strength(self.chartOption.node.chargeForce);
    changeData({ nodes, links });
    simulation
        .on("tick", ticked)
        .on("end", tickEnd)
        .alpha(1)
        .alphaTarget(0)
        .restart();
    self.subSimulations.forEach(s => {
        s.alpha(1)
            .alphaTarget(0)
            .restart();
    })
}
const changeData = ({ nodes, links }) => {
    nodes.forEach((node, i) => typeMax = Math.max(typeMax, node.group + 1))
    self.nodes = nodes
    self.links = links
    const uidMap = {};
    self.nodes.forEach(d => uidMap[d.uid] = d)
    self.uidMap = uidMap;
    self.subSimulations.forEach(s => s.stop())
    self.subSimulations = [];

    simulation.nodes(self.nodes);
    simulation
        .force("link")
        .links(self.links)
        .distance(self.chartOption.link.distance);

    // console.log(nodes);

    /* const args = [];
    for (let type = 0; type < typeMax; type++) {
        const nodes = self.nodes
            .filter((node) => {
                return node.group === type;
            })
            .map((node) => ({ ...node }))
        const links = self.links.filter((link) => {
            return uidMap[link.source].group === type && uidMap[link.target].group === type;
        })
        args.push([nodes, links, type])
    }
    const othersNodes = self.nodes
        .filter((node) => {
            return node.group >= typeMax;
        })
        .map((node) => ({ ...node }))
    const othersLinks = self.links.filter((link) => {
        return uidMap[link.source].group >= typeMax && uidMap[link.target].group >= typeMax;
    })
    args.push([othersNodes, othersLinks, typeMax]) */
    // args.forEach(arg => self.subSimulations.push(genSubSimulation(...arg)))
}
const alterData = ({ nodes, links }) => {
    nodes.forEach(d => {
        const localNode = self.uidMap[d.uid];
        Object.assign(localNode, d)
        if (!("fx" in d)) {
            delete localNode.fx
            delete localNode.fy
        }
    })
    // TODO self.links = links
}
const changeOption = (chartOption) => {
    self.chartOption = chartOption
    simulation.force("charge").strength(self.chartOption.node.chargeForce);
    simulation
        .force("link")
        .distance(self.chartOption.link.distance);
    simulation.alphaTarget(self.chartOption.simulation.alphaTarget);
    self.subSimulations.forEach(s => s.alphaTarget(self.chartOption.simulation.alphaTarget));

    const { run } = self.chartOption.simulation;
    if (run) {
        simulation.restart();
        self.subSimulations.forEach(s => s.restart());
    } else {
        simulation.stop();
        self.subSimulations.forEach(s => s.stop());
    }
}

const ticked = function () {
    // console.log("worker-tick");
    // console.log(self.nodes);

    self.postMessage({
        nodes: self.nodes
    })
}
const tickEnd = function () {
    // console.log("worker-tick");

    // 静态布局
    // self.postMessage({
    //     nodes: self.nodes
    // })

    self.postMessage("tickEnd")
}

self.addEventListener('message', (e) => {
    const payload = e.data;
    ("init" in payload) && init(payload.init);
    ("changeData" in payload) && changeData(payload.changeData);
    ("changeOption" in payload) && changeOption(payload.changeOption);
    ("alterData" in payload) && alterData(payload.alterData);
})
