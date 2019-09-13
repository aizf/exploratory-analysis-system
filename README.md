# test-antd

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run your tests
```
npm run test
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## 随笔

层级结构数据和Node-Link结构数据相互转化

实现了几种经典的对层次结构数据的可视化技术：

- Node-link diagrams(节点-链接图) 对节点和边使用离散的标记来展示拓扑结构，比如节点展示为圆并且父子节点之间使用线连接。“tidy” tree 结构更紧密，而 dendrogram(系统树) 则将所有的叶节点放置在同一水平线上。(它们都有极坐标系和笛卡尔坐标系两种形式。) Indented trees(缩进树) 对交互式展示很有用。
- Adjacency diagrams(邻接图) 使用节点的相对位置展示拓扑结构。这种展示方式将每个节点编码为定量的区域，比如使用区域大小表示收入或文件大小。“icicle” diagram 使用矩形表示区域，而 “sunburst” 则使用分段环形图来表示。
- Enclosure diagrams(包裹图) 也是一种区域编码，但是通过相互包含的形式来展示拓扑结构。treemap 递归的将一个区域划分为更小的矩形区域。Circle-packing 则通过相互紧凑嵌套的圆来表示, 虽然空间利用率不高，但是能更明显的展示拓扑结构。
- 一个好的层次结构可视化能促进快速的促进多尺度推理: 对单个单元的微观观察和对整体的宏观观察.

## TODO

调节尺寸，长宽外部绑定

y轴映射nodes数量，颜色映射操作
