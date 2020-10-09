// 返回一个类的实例，用来存储节点信息
class RecordData {
    constructor({ index, data, operation, time }) {
        // 存储的数据在操作之前
        this.index = index;
        this.data = data; // 操作之前的数据
        this.operation = operation;
        this.time = time;
    }
}

module.exports = { RecordData }