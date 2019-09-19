<template>
  <a-layout>
    <a-layout-sider
      width="200"
      theme="light"
      style="background: #fff"
      collapsible
      collapsedWidth="80"
    >
      <a-menu
        mode="inline"
        :defaultSelectedKeys="['1']"
        :defaultOpenKeys="['sub1']"
        :openKeys="openKeys"
        @openChange="onOpenChange"
        :style="{ height: '100%', borderRight: 0 }"
        :inlineIndent="24"
      >
        <a-sub-menu key="sub1">
          <span slot="title">
            <a-icon type="user" />
            <span>oprations</span>
          </span>
          <!--  -->
          <a-menu-item>
            <a-button
              type="primary"
              block="block"
              @click="saveViewData"
              :disabled="saveDisabled"
              :style="{ margin: '1px' }"
            >save</a-button>
          </a-menu-item>
          <a-menu-item>
            <a-button
              @click="sliceUndo"
              shape="circle"
              :disabled="sliceUndoDisabled"
              :style="{ paddingLeft: '8px' }"
            >
              <a-icon type="undo" />
            </a-button>
            <a-button
              type="primary"
              @click="viewSlice"
              :style="{ marginLeft:'5px',width: '100px' }"
            >slice</a-button>
          </a-menu-item>
          <a-menu-item-group key="g1" title="single point">
            <a-menu-item @click="onVisClick" :disabled="clickDisabled">
              <a-tooltip placement="top" title="单点操作，选中或取消选中一个点" :mouseEnterDelay="0.4">
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
              <a-tooltip placement="top" title="多点操作，选中多个点" :mouseEnterDelay="0.4">
                <span>brush</span>
              </a-tooltip>
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
        </a-sub-menu>

        <a-sub-menu key="sub2">
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
          <a-menu-item key="record" @click="recordOpen">
            <a-icon type="database" />record
          </a-menu-item>
          <a-menu-item key="5">DataFlow</a-menu-item>
          <a-menu-item key="6">OprationFlow</a-menu-item>
        </a-sub-menu>

        <a-sub-menu key="sub3">
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
      </a-menu>
    </a-layout-sider>

    <a-layout style="padding: 0 0px 0 5px">
      <a-layout-content :style="{ background: '#fff', padding: '24px', margin: 0 }">
        <keep-alive>
          <component
            ref="theView"
            :is="currentChart"
            :visClick="visClick"
            :visBrush="visBrush"
            :visInvertBrush="visInvertBrush"
            :visDrag="visDrag"
            :visMouseover="visMouseover"
            :visZoom="visZoom"
            :visShowIds="visShowIds"
            :viewUpdate="viewUpdate"
          ></component>
        </keep-alive>
      </a-layout-content>
    </a-layout>
    <a-drawer
      title="record"
      placement="right"
      :width="720"
      :closable="false"
      @close="recordClose"
      :visible="recordVisible"
    >
      <RecordDrawer />
    </a-drawer>
  </a-layout>
</template>
<script>
import ForceChart from "./pageView/ForceChart.vue";
import ScatterChart from "./pageView/ScatterChart.vue";
import NodesTable from "./pageView/NodesTable.vue";
import RecordDrawer from "./pageView/RecordDrawer.vue";
export default {
  name: "PageView",
  components: {
    ForceChart,
    ScatterChart,
    NodesTable,
    RecordDrawer
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
      visInvertBrush: false,
      visZoom: true,
      visShowIds: false,
      recordVisible: false,
      // switch disabled
      saveDisabled: false,
      clickDisabled: false,
      dragDisabled: false,
      mouseoverDisabled: false,
      brushDisabled: false,
      invertBrushDisabled: false,
      zoomDisabled: false,
      showIdsDisabled: false,
      sliceUndoList: [],

      currentChartKey: "force"
    };
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
    changeChart(option) {
      this.currentChartKey = option.key;
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
      this.saveDisabled = save;
      this.clickDisabled = click;
      this.dragDisabled = drag;
      this.mouseoverDisabled = mouseover;
      this.brushDisabled = brush;
      this.invertBrushDisabled = invertBrush;
      this.zoomDisabled = zoom;
      this.showIdsDisabled = showIds;
    },
    // 开关record的drawer
    recordOpen() {
      this.recordVisible = true;
    },
    recordClose() {
      this.recordVisible = false;
    },
    // save相关
    saveViewData() {
      let saveThing = {
        data: this.visualData,
        dom: this.$refs.theView.vis.node().cloneNode(true),
        selectedIds: this.visualData.nodes
          .filter(d => d.selected)
          .map(d => d.id||d.name)
      };
      this.$store.commit("changeSavedViewData", undo => {
        undo.push(saveThing);
      });
      // this.$store.commit("changeSavedViewData", d => console.log(d));
    },
    viewBack() {
      this.$store.commit("changeSavedViewData", (undo, redo) => {
        if (!undo.length) {
          return;
        }
        let data = undo.pop();
        redo.unshift(data);
        this.$store.commit("updateVisualData", data);
        this.$store.commit("updateViewUpdate", "all");
        console.info("backed!");
      });
    },
    // 切片和切片回退
    viewSlice() {
      let slicedData = this.$store.state.viewSlice();
      if (!slicedData.nodes.length) {
        this.$message.error("No nodes are selected !");
        return;
      }
      this.sliceUndoList.push(this.visualData);
      this.$store.commit("updateVisualData", slicedData);
      this.$store.commit("updateViewUpdate", "all");
      this.$store.commit("addOperation", {
        action: "slice",
        nodes: slicedData,
        time: new Date()
      });
      console.log("slice", slicedData);
    },
    sliceUndo() {
      if (this.sliceUndoDisabled) {
        return;
      }
      let data = this.sliceUndoList.pop();
      this.$store.commit("updateVisualData", data);
      this.$store.commit("updateViewUpdate", "all");
      this.$store.commit("addOperation", {
        action: "sliceUndo",
        nodes: data,
        time: new Date()
      });
      console.log("sliceUndo", data);
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
  computed: {
    sourceData() {
      return this.$store.state.sourceData;
    },
    visualData() {
      return this.$store.state.visualData;
    },
    viewUpdate() {
      return this.$store.state.viewUpdate;
    },
    currentChart() {
      switch (this.currentChartKey) {
        case "scatter":
          this.changeDisabledState({ drag: true });
          return "ScatterChart";
          break;
        case "force":
          this.changeDisabledState({ save: false });
          return "ForceChart";
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
          return "NodesTable";
          break;
        default:
          this.changeDisabledState();
          break;
      }
    },
    undoStack() {
      return this.$store.state.undoStack;
    },
    redoStack() {
      return this.$store.state.redoStack;
    },
    savedViewData() {
      return this.$store.getters.savedViewData;
    },
    sliceUndoDisabled() {
      return !this.sliceUndoList.length;
    }
  }
};
</script>
<style></style>