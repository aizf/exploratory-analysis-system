<template>
  <a-layout id="pageView">
    <a-layout-sider
      width="250"
      theme="light"
      style="background: #fff"
    >
      <a-card
        title="Oprations"
        :headStyle="{padding:'0 24px 0 24px'}"
        :bodyStyle="{padding:'5px 20px 5px 15px'}"
      >
        <a-row>
          <a-col :span="12" offset="4">
            <a-tooltip placement="top" title="单点操作，选中或取消选中一个点" :mouseEnterDelay="0.4">
              <span class="vSubMenu">click</span>
            </a-tooltip>
          </a-col>
          <a-col :span="4" offset="2">
            <a-switch v-model="visClick" :disabled="clickDisabled" />
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="12" offset="4">
            <a-tooltip placement="top" title="单点操作，拖动一个点" :mouseEnterDelay="0.4">
              <span class="vSubMenu">drag</span>
            </a-tooltip>
          </a-col>
          <a-col :span="4" offset="2">
            <a-switch v-model="visDrag" :disabled="dragDisabled" />
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="12" offset="4">
            <a-tooltip placement="top" title="单点操作，展示与该点相关联的点" :mouseEnterDelay="0.4">
              <span class="vSubMenu">hover</span>
            </a-tooltip>
          </a-col>
          <a-col :span="4" offset="2">
            <a-switch v-model="visMouseover" :disabled="mouseoverDisabled" />
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="12" offset="4">
            <a-popover placement="top" title="keep last selected nodes ?" :mouseEnterDelay="0.4">
              <template slot="content">
                <a-checkbox :checked="!brushKeep" @change="brushKeep=!brushKeep">no</a-checkbox>
                <a-checkbox :checked="brushKeep" @change="brushKeep=!brushKeep">yes</a-checkbox>
              </template>
              <span class="vSubMenu">brush</span>
            </a-popover>
          </a-col>
          <a-col :span="4" offset="2">
            <a-switch v-model="visBrush" @change="onVisBrush('switch')" :disabled="brushDisabled" />
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="12" offset="4">
            <a-tooltip placement="top" title="多点操作，取消选中多个点" :mouseEnterDelay="0.4">
              <span class="vSubMenu">invert brush</span>
            </a-tooltip>
          </a-col>
          <a-col :span="4" offset="2">
            <a-switch
              v-model="visInvertBrush"
              @change="onVisInvertBrush('switch')"
              :disabled="invertBrushDisabled"
            />
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="12" offset="4">
            <a-tooltip placement="top" title="多点操作，放大、缩小或平移视图" :mouseEnterDelay="0.4">
              <span class="vSubMenu">zoom</span>
            </a-tooltip>
          </a-col>
          <a-col :span="4" offset="2">
            <a-switch v-model="visZoom" :disabled="zoomDisabled" />
          </a-col>
        </a-row>
      </a-card>

      <a-card
        title="Data Fields"
        :headStyle="{padding:'0 24px 0 24px'}"
        :bodyStyle="{padding:'5px 10px 5px 10px'}"
      >
        <a-row>
          <a-col :span="12" offset="4"></a-col>
          <a-col :span="4" offset="2"></a-col>
        </a-row>
      </a-card>

      <a-card
        title="Chart Option"
        :headStyle="{padding:'0 24px 0 24px'}"
        :bodyStyle="{padding:'5px 10px 5px 10px'}"
      >
        <!-- <a-icon type="area-chart" /> -->
        <a-tabs tabPosition="left" :activeKey="currentChartKey" @change="changeChart">
          <a-tab-pane key="force">
            <span slot="tab">
              <a-icon type="deployment-unit" />force
            </span>
            <div class="chartOption">
              <span class="vSubTitle">node</span>
              <div>
                <span class="vSubMenu">size</span>
                <a-input-number
                  class="optionInput"
                  :min="0.1"
                  :max="70"
                  :step="0.2"
                  v-model="chartOption.node.nodeSize"
                />
                <br />
                <span class="vSubMenu">border color</span>
                <a-input class="optionInput" :value="chartOption.node.borderColor" />
                <span class="vSubMenu">border width</span>
                <a-input-number
                  class="optionInput"
                  :min="0.1"
                  :max="70"
                  :step="0.2"
                  v-model="chartOption.node.borderWidth"
                />
              </div>
              <span class="vSubTitle">link</span>
              <div>
                <span class="vSubMenu">color</span>
                <a-input class="optionInput" :value="chartOption.link.color" />
                <span class="vSubMenu">width</span>
                <a-input-number
                  class="optionInput"
                  :min="0.1"
                  :max="10"
                  :step="0.1"
                  v-model="chartOption.link.width"
                />
                <span class="vSubMenu">distance</span>
                <a-input-number
                  class="optionInput"
                  :min="1"
                  :max="200"
                  :step="1"
                  v-model="chartOption.link.distance"
                />
                <span class="vSubMenu">opacity</span>
                <a-input-number
                  class="optionInput"
                  :min="0"
                  :max="1"
                  :step="0.1"
                  v-model="chartOption.link.opacity"
                />
              </div>
            </div>
          </a-tab-pane>
          <a-tab-pane key="scatter">
            <span slot="tab">
              <a-icon type="dot-chart" />scatter
            </span>
          </a-tab-pane>
          <a-tab-pane key="table">
            <span slot="tab">
              <a-icon type="table" />table
            </span>
          </a-tab-pane>
        </a-tabs>
      </a-card>

      <!-- <a-menu
        mode="inline"
        :defaultSelectedKeys="['1']"
        :defaultOpenKeys="['sub1']"
        :openKeys="openKeys"
        @openChange="onOpenChange"
        :style="{ borderRight: 0 }"
        :inlineIndent="24"
      >-->
      <!-- <a-sub-menu key="sub1">
          <span slot="title">
            <a-icon type="user" />
            <span>oprations</span>
          </span>
          <a-menu-item>
            <a-button
              type="primary"
              @click="viewFilter"
              :style="{ marginLeft:'5px',width: '100px' }"
            >filter</a-button>
          </a-menu-item>
          <a-menu-item-group key="g1" title="single point">
            <a-menu-item @click="onVisClick" :disabled="clickDisabled">
              <a-tooltip placement="top" title="单点操作，选中或取消选中一个点" @.stop :mouseEnterDelay="0.4">
                <span>click</span>
              </a-tooltip>
              <span :style="{display:'block',float:'right'}" @click.stop>
                <a-switch v-model="visClick" :disabled="clickDisabled" />
              </span>
            </a-menu-item>
            <a-menu-item key="1" @click="onVisDrag" :disabled="dragDisabled">
              <a-tooltip placement="top" title="单点操作，拖动一个点" :mouseEnterDelay="0.4">
                <span>drag</span>
              </a-tooltip>
              <span :style="{display:'block',float:'right'}" @click.stop>
                <a-switch v-model="visDrag" :disabled="dragDisabled" />
              </span>
            </a-menu-item>
            <a-menu-item @click="onVisMouseover" :disabled="mouseoverDisabled">
              <a-tooltip placement="top" title="单点操作，展示与该点相关联的点" :mouseEnterDelay="0.4">
                <span>mouseover</span>
              </a-tooltip>
              <span :style="{display:'block',float:'right'}" @click.stop>
                <a-switch v-model="visMouseover" :disabled="mouseoverDisabled" />
              </span>
            </a-menu-item>
          </a-menu-item-group>
          <a-menu-item-group key="g2" title="multiple point">
            <a-menu-item @click="onVisBrush" :disabled="brushDisabled">
              <a-popover placement="top" title="keep last selected nodes ?" :mouseEnterDelay="0.4">
                <template slot="content">
                  <a-checkbox :checked="!brushKeep" @change="brushKeep=!brushKeep">no</a-checkbox>
                  <a-checkbox :checked="brushKeep" @change="brushKeep=!brushKeep">yes</a-checkbox>
                </template>
                <span>brush</span>
              </a-popover>
              <span :style="{display:'block',float:'right'}" @click.stop>
                <a-switch
                  v-model="visBrush"
                  @change="onVisBrush('switch')"
                  :disabled="brushDisabled"
                />
              </span>
            </a-menu-item>
            <a-menu-item @click="onVisInvertBrush" :disabled="invertBrushDisabled">
              <a-tooltip placement="top" title="多点操作，取消选中多个点" :mouseEnterDelay="0.4">
                <span>invert brush</span>
              </a-tooltip>
              <span :style="{display:'block',float:'right'}" @click.stop>
                <a-switch
                  v-model="visInvertBrush"
                  @change="onVisInvertBrush('switch')"
                  :disabled="invertBrushDisabled"
                />
              </span>
            </a-menu-item>
            <a-menu-item @click="onVisZoom" :disabled="zoomDisabled">
              <a-tooltip placement="top" title="多点操作，放大、缩小或平移视图" :mouseEnterDelay="0.4">
                <span>zoom</span>
              </a-tooltip>
              <span :style="{display:'block',float:'right'}" @click.stop>
                <a-switch v-model="visZoom" :disabled="zoomDisabled" />
              </span>
            </a-menu-item>
          </a-menu-item-group>
      </a-sub-menu>-->

      <!-- <a-sub-menu key="sub2">
          <span slot="title">
            <a-icon type="laptop" />
            <span>display</span>
          </span>
          <a-menu-item key="showIdsDisabled" @click="onVisShowIds" :disabled="showIdsDisabled">
            <a-icon type="tags" />
            <span>showIds</span>
            <span :style="{display:'block',float:'right'}" @click.stop>
              <a-switch v-model="visShowIds" :disabled="showIdsDisabled" />
            </span>
          </a-menu-item>
          <a-menu-item key="marked-views" @click="markedsVisible=true">
            <a-icon type="database" />Marked Views
          </a-menu-item>
          <a-menu-item key="5">DataFlow</a-menu-item>
          <a-menu-item key="6">OprationFlow</a-menu-item>
      </a-sub-menu>-->

      <!-- <a-sub-menu key="sub3">
          <span slot="title">
            <a-icon type="area-chart" />
            <span>change chart</span>
          </span>
          <a-menu-item key="force" @click="changeChart">
            <a-icon type="deployment-unit" />force
          </a-menu-item>
          <a-menu-item key="scatter" @click="changeChart">
            <a-icon type="dot-chart" />scatter
          </a-menu-item>
          <a-menu-item key="table" @click="changeChart">
            <a-icon type="table" />table
          </a-menu-item>
        </a-sub-menu>
      </a-menu>-->
    </a-layout-sider>

    <a-layout style="padding: 0 0 0 5px">
      <a-layout-content :style="{ background: '#fff', padding: '24px', margin: 0 }">
        <a-row>
          <a-col :span="20">
            <!-- col为工具栏和视图 -->
            <a-row style="padding: 5px 0 5px 0">
              <!-- row工具栏 -->
              <a-col :span="5">
                <a-badge
                  :count="markedVisualData.length"
                  showZero
                  :numberStyle="{backgroundColor: '#1890ff'}"
                >
                  <a-button @click="markedsVisible=true">
                    <a-icon type="database" />Marked Views
                  </a-button>
                </a-badge>
                <a-button @click="marked=!marked">
                  <a-icon type="book" :theme="marked?'filled':'outlined'" />
                </a-button>
              </a-col>
              <a-col :span="2">
                <a-button @click="viewUndo" shape="circle" :disabled="undoDisabled">
                  <a-icon type="undo" />
                </a-button>
                <a-button
                  @click="viewRedo"
                  shape="circle"
                  :disabled="redoDisabled"
                  style="margin:0 0 0 5px"
                >
                  <a-icon type="redo" />
                </a-button>
              </a-col>
              <a-col :span="8">
                <a-tag
                  v-for="(color, index) in colorPalette"
                  :color="color"
                  @click="groupTheSelectedNodes(index)"
                  :key="index"
                >{{index}}</a-tag>
              </a-col>
              <a-col :span="4">
                <a-button
                  type="primary"
                  size="small"
                  @click="viewFilter"
                  :style="{ marginLeft:'0',width: '70px' }"
                >filter</a-button>
              </a-col>
              <a-col :span="5">
                <a-icon type="tags" />
                <span>showIds</span>
                <a-switch v-model="visShowIds" :disabled="showIdsDisabled" />
              </a-col>
            </a-row>
            <keep-alive>
              <!-- 可视化视图 -->
              <component
                ref="theView"
                :is="currentChart"
                :visClick="visClick"
                :visBrush="visBrush"
                :brushKeep="brushKeep"
                :visInvertBrush="visInvertBrush"
                :visDrag="visDrag"
                :visMouseover="visMouseover"
                :visZoom="visZoom"
                :visShowIds="visShowIds"
                :chartOption="chartOption"
              ></component>
            </keep-alive>
          </a-col>
          <a-col :span="4">
            <!-- 右侧暂时空白 -->
            a-col-4
          </a-col>
        </a-row>
      </a-layout-content>
    </a-layout>

    <a-drawer
      title="Marked Views"
      placement="right"
      :width="720"
      :closable="false"
      @close="markedsVisible=false"
      :visible="markedsVisible"
    >
      <MarkedViews />
    </a-drawer>
  </a-layout>
</template>
<script>
import Vue from "vue";
import {
  Badge,
  Button,
  Checkbox,
  Col,
  Drawer,
  Icon,
  Input,
  Popover,
  Row,
  Switch,
  Tabs,
  Tag
} from "ant-design-vue";
Vue.use(Badge);
Vue.use(Button);
Vue.use(Checkbox);
Vue.use(Col);
Vue.use(Drawer);
Vue.use(Icon);
Vue.use(Input);
Vue.use(Popover);
Vue.use(Row);
Vue.use(Switch);
Vue.use(Tabs);
Vue.use(Tag);
import store from "@/store/";
import { mapState, mapGetters } from "vuex";
// import * as d3 from "d3";
import ForceChart from "./pageView/ForceChart.vue";
import ScatterChart from "./pageView/ScatterChart.vue";
import NodesTable from "./pageView/NodesTable.vue";
import MarkedViews from "./pageView/MarkedViews.vue";
export default {
  name: "PageView",
  components: {
    ForceChart,
    ScatterChart,
    NodesTable,
    MarkedViews
  },
  data() {
    return {
      // interface
      collapsed: false, // 侧边栏
      rootSubmenuKeys: ["sub1", "sub2", "sub3"],
      openKeys: ["sub1"],
      // view
      visClick: false,
      visDrag: true,
      visMouseover: false,
      visBrush: false,
      brushKeep: false,
      visInvertBrush: false,
      visZoom: true,
      visShowIds: false,
      markedsVisible: false,
      // option
      chartOption: {
        node: { nodeSize: 4.5, borderColor: "red", borderWidth: 0.8 },
        link: { color: "#aaa", width: 0.3, opacity: 0.8, distance: 30 }
      },
      // switch disabled
      saveDisabled: false,
      clickDisabled: false,
      dragDisabled: false,
      mouseoverDisabled: false,
      brushDisabled: false,
      invertBrushDisabled: false,
      zoomDisabled: false,
      showIdsDisabled: false,

      currentChartKey: "force"
    };
  },
  computed: {
    ...mapState({
      sourceData: state => state.data.sourceData,
      visualData: state => state.data.visualData,
      // datasets: state => state.data.datasets,

      colorPalette: state => state.view.colorPalette,
      parentUUID: state => state.view.parentUUID,
      currentUUID: state => state.view.currentUUID,

      currentOperations: state => state.analyze.currentOperations,
      undoList: state => state.analyze.undoList,
      redoList: state => state.analyze.redoList,
      rollbacked: state => state.analyze.rollbacked
      //toolbox
    }),
    ...mapGetters([
      "nodes",
      "links",
      "viewSlice",
      "generateUUID",
      "beforeEvent",
      "markedVisualData",
      "tmpExistingViews"
    ]),

    marked: {
      get: function() {
        return this.tmpExistingViews[this.currentUUID].marked;
      },
      set: function(val) {
        this.tmpExistingViews[this.currentUUID].marked = val;
      }
    },
    currentChart() {
      let chart;
      switch (this.currentChartKey) {
        case "scatter":
          this.changeDisabledState({ drag: true });
          chart = "ScatterChart";
          break;
        case "force":
          this.changeDisabledState({ save: false });
          chart = "ForceChart";
          break;
        case "table":
          this.changeDisabledState({
            click: true,
            drag: true,
            mouseover: true,
            brush: true,
            invertBrush: true,
            zoom: true,
            showIds: true
          });
          chart = "NodesTable";
          break;
        default:
          this.changeDisabledState();
          break;
      }
      return chart;
    },
    undoDisabled() {
      return !this.undoList.length;
    },
    redoDisabled() {
      return !this.redoList.length;
    }
  },
  mounted() {
    console.log("PageView", this);
  },
  methods: {
    onVisClick() {
      this.visClick = !this.visClick;
    },
    onVisBrush(which) {
      if (which !== "switch") {
        // 判断点击的是<a-menu-item>还是<a-switch>
        this.visBrush = !this.visBrush;
      }

      if (this.visBrush) {
        this.visInvertBrush = false;
      }
    },
    onVisInvertBrush(which) {
      if (which !== "switch") {
        // 判断点击的是<a-menu-item>还是<a-switch>
        this.visInvertBrush = !this.visInvertBrush;
      }

      if (this.visInvertBrush) {
        this.visBrush = false;
      }
    },
    onVisDrag() {
      this.visDrag = !this.visDrag;
    },
    onVisMouseover() {
      this.visMouseover = !this.visMouseover;
    },
    onVisZoom() {
      this.visZoom = !this.visZoom;
    },
    onVisShowIds() {
      this.visShowIds = !this.visShowIds;
    },
    onOpenChange(openKeys) {
      // 点击菜单，收起其他展开的所有菜单，保持菜单聚焦简洁
      const latestOpenKey = openKeys.find(
        key => this.openKeys.indexOf(key) === -1
      );
      if (this.rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
        this.openKeys = openKeys;
      } else {
        this.openKeys = latestOpenKey ? [latestOpenKey] : [];
      }
    },
    changeChart(key) {
      this.currentChartKey = key;
    },
    // 改变开关的禁用状态
    changeDisabledState({
      // true !!!!!
      save = true,

      click = false,
      drag = false,
      mouseover = false,
      brush = false,
      invertBrush = false,
      zoom = false,
      showIds = false
    } = {}) {
      this.clickDisabled = click;
      this.dragDisabled = drag;
      this.mouseoverDisabled = mouseover;
      this.brushDisabled = brush;
      this.invertBrushDisabled = invertBrush;
      this.zoomDisabled = zoom;
      this.showIdsDisabled = showIds;
    },

    viewUndo() {
      this.$store.commit("changeUndoRedo", undo => {
        if (!undo.length) {
          return;
        }
        this.beforeEvent("undo", this, undo.pop());
        console.info("undo!");
      });
    },
    viewRedo() {
      this.$store.commit("changeUndoRedo", (undo, redo) => {
        if (!redo.length) {
          return;
        }
        this.beforeEvent("redo", this, redo.shift());
        console.info("redo!");
      });
    },
    // filter别名，切片和切片回退
    viewFilter() {
      const slicedData = this.viewSlice();
      if (!slicedData.nodes.length) {
        this.$message.error("No nodes are selected !");
        return;
      }
      slicedData.uuid = this.currentUUID;

      this.beforeEvent("filter", this);

      slicedData.nodes.forEach(d => {
        this.$set(d, "selected", false);
      });

      this.$store.commit("updateVisualData", slicedData);

      this.$store.commit("resetCurrentOperations");

      this.$store.commit("addOperation_", {
        action: "filter",
        nodes: slicedData,
        time: new Date()
      });
      console.log("filter");
    },
    groupTheSelectedNodes(group) {
      // console.log(group);
      this.beforeEvent("classification", this);
      store.state.data.visualData.nodes.forEach(d => {
        if (d.selected) {
          this.$set(d, "group", group);
        }
      });
    },
    // test
    test(event, i, a) {
      console.log(event);
      console.log(this.$listeners);
      console.log(a);
      // console.log(e);
    },
    test1(e) {
      console.log(e);
      console.log(e.target);
    }
  },
  watch: {
    currentUUID: function(val) {
      store.commit("change_uuids", uuids => {
        uuids.add(val);
      });
    }
  }
};
</script>
<style scoped>
.vSubMenu {
  font-size: 14px;
  font-weight: 400;
  width: 30px;
  margin-left: 10px;
}
.vSubTitle {
  font-size: 15px;
  font-weight: 650;
}
/* .vSubMenu:hover {
  color: #1890ff;
  cursor: pointer;
} */
.chartOption .ant-input-number {
  height: 26px;
}
.optionInput {
  width: 90%;
  margin-left: 10px;
}
</style>
<style>
#pageView .ant-tabs-tab {
  text-align: left;
  padding: 2px 5px;
  margin-bottom: 6px;
}
#pageView .ant-tabs-left-content {
  padding-left: 4px;
}
</style>
