# exploratory-analysis-system

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

## TODO（数据驱动）

调节尺寸，长宽外部绑定  done !

y轴映射啥(待定)  ing

ant 时间轴+表格（nodes）ing

分析社交网络

!! 预览图 树状图节点大小为数据大小，线段长度为分析时间，线段颜色代表操作

克里化，先选类型再有属性
各个属性在store中存储，如node-link，层级，nodes，links等，再大分类(关系型，非关系型)

饼图，各种操作的比例，等

迷你图  done !

流程图增加分组之后的图节点

time图纵轴可变，根据不同分组 !!!!!!!!!!!
分组依据： 1.单点或多点 2.是否影响布局，查看信息或操作视图  3.是否影响源数据    4.

深拷贝  done !

task: 一个完整的视图到视图的变化过程,自己mark
纵坐标，横坐标在中间的
加聚类等
dataflow的path增加箭头

TODO: 记录交互的影响，而不是交互

merge 操作

无links数据=>links:[]   done !

redo undo               done !

d3的数据绑定 和 vue的     done !

recordset中重复的nodes    done

1.箭头加浮框显示数据流向
2.多余的缩成环
3.dataflow方框变pie图   done !
4.加社交网络dataset
5.view能够分析出信息
6.多个相同操作合一  idea：遍历links，再根据links的source和target，filter nodes idea2:最短路径 TODO:
7.dataflow增加辅助视图

issue: undo 再操作，两个会同时marked
pie图留空值(filter)

数据结构类型 层次数据  网络数据(网络和图)

增加各种力，

无边节点单独放开
