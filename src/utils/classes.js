// 返回一个类的实例，用来存储节点信息
class RecordNode {
    constructor(...args) {
        // { uuid,nodes,links,marked }
        for (let arg of args) {
            this[arg]=arg
        }
    }
}

class RecordLink {
    constructor(...args) {
        // { source,target operation, time }
        for (let arg of args) {
            this[arg] = arg
        }
    }
}

module.exports = { RecordNode, RecordLink }