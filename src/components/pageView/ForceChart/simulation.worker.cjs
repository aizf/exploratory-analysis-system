self.importScripts("//cdn.jsdelivr.net/npm/d3@6/dist/d3.min.js");
const d3 = self.d3;

self.nodes = [];
self.links = [];
self.nodesMap = {};
self.chartOption = {}
self.width = 0
self.height = 0

const simulation = d3
    .forceSimulation()
    .force(
        "link",
        d3.forceLink().id((d) => d.uid || d.id || d.name)
    )
    .force("charge", d3.forceManyBody())
    .stop()

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
}
const changeData = ({ nodes, links }) => {
    self.nodes = nodes
    self.links = links
    const nodesMap = {};
    self.nodes.forEach(d => {
        nodesMap[d.uid] = d;
    })
    self.nodesMap = nodesMap;

    simulation.nodes(self.nodes);
    simulation
        .force("link")
        .links(self.links)
        .distance(self.chartOption.link.distance);
}
const alterData = ({ nodes, links }) => {
    nodes.forEach(d => {
        const localNode = self.nodesMap[d.uid];
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
    simulation.alphaTarget(self.chartOption.simulation.alphaTarget)
    const { run } = self.chartOption.simulation
    if (run) {
        simulation.restart()
    } else {
        simulation.stop();
    }
}

const ticked = function () {
    // console.log("worker-tick");
    self.postMessage({
        nodes: self.nodes
    })
}
const tickEnd = function () {
    // console.log("worker-tick");
    self.postMessage("tickEnd")
}

self.addEventListener('message', (e) => {
    const payload = e.data;
    ("init" in payload) && init(payload.init);
    ("changeData" in payload) && changeData(payload.changeData);
    ("changeOption" in payload) && changeOption(payload.changeOption);
    ("alterData" in payload) && alterData(payload.alterData);
})
