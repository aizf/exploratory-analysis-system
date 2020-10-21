const d3 = require("d3");
self.addEventListener('message', (e) => {
    // console.log("message",d3);
    console.log("self", d3.version);
    postMessage(e.data * e.data);
})
