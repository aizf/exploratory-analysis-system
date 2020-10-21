import * as d3 from "d3"

self.nodes = [];
self.links = [];
self.chartOption = {}
self.width = 0
self.height = 0

const simulation = d3
    .forceSimulation()
    .force(
        "link",
        d3.forceLink().id((d) => d.id || d.name)
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
    simulation.on("tick", ticked).alpha(1).restart();
}
const changeData = ({ nodes, links }) => {
    self.nodes = nodes
    self.links = links
    simulation.nodes(self.nodes);
    simulation
        .force("link")
        .links(self.links)
        .distance(self.chartOption.link.distance);
}
const changeOption = (chartOption) => {
    self.chartOption = chartOption
    simulation.force("charge").strength(self.chartOption.node.chargeForce);
    simulation
        .force("link")
        .links(self.links)
        .distance(self.chartOption.link.distance);
}

const ticked = function () {
    console.log("worker-tick");
    self.postMessage({
        nodes: self.nodes
    })
}

self.addEventListener('message', (e) => {
    const payload = e.data;
    ("init" in payload) && init(payload.init);
    ("changeData" in payload) && changeData(payload.changeData);
    ("changeOption" in payload) && changeOption(payload.changeOption);
})
