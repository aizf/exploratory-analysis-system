const d3 = require('d3')

function marks(type, size) {
    const types = {
        circle: d3.symbols[0],
        cross: d3.symbols[1],
        diamond: d3.symbols[2],
        square: d3.symbols[3],
        star: d3.symbols[4],
        triangle: d3.symbols[5],
        wye: d3.symbols[6],
    };
    return d3.symbol().type(types[type]).size(size)();
}

module.exports = { marks }