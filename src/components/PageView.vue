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
        :style="{ height: '100%', borderRight: 0 }"
        :inlineIndent="24"
      >
        <a-sub-menu key="sub1">
          <span slot="title">
            <a-icon type="user" />
            <span>opration</span>
          </span>
          <!--  -->
          <a-menu-item>
            <a-button type="primary" block="block" :style="{ margin: '1px' }">save</a-button>
          </a-menu-item>
          <a-menu-item-group key="g1" title="single point">
            <a-menu-item @click="onVisClick">
              <a-tooltip placement="top" title="单点操作，选中或取消选中一个点" :mouseEnterDelay="0.4">
                <span>click</span>
              </a-tooltip>
              <span :style="{display:'block',float:'right'}" @click.stop>
                <a-switch v-model="visClick" />
              </span>
            </a-menu-item>
            <a-menu-item key="1" @click="onVisDrag">
              <a-tooltip placement="top" title="单点操作，拖动一个点" :mouseEnterDelay="0.4">
                <span>drag</span>
              </a-tooltip>
              <span :style="{display:'block',float:'right'}" @click.stop>
                <a-switch v-model="visDrag" />
              </span>
            </a-menu-item>
            <a-menu-item @click="onVisMouseover">
              <a-tooltip placement="top" title="单点操作，展示与该点相关联的点" :mouseEnterDelay="0.4">
                <span>mouseover</span>
              </a-tooltip>
              <span :style="{display:'block',float:'right'}" @click.stop>
                <a-switch v-model="visMouseover" />
              </span>
            </a-menu-item>
          </a-menu-item-group>
          <a-menu-item-group key="g2" title="multiple point">
            <a-menu-item @click="onVisBrush">
              <a-tooltip placement="top" title="多点操作，选中多个点" :mouseEnterDelay="0.4">
                <span>brush</span>
              </a-tooltip>
              <span :style="{display:'block',float:'right'}" @click.stop>
                <a-switch v-model="visBrush" @change="onVisBrush('switch')" />
              </span>
            </a-menu-item>
            <a-menu-item @click="onVisInvertBrush">
              <a-tooltip placement="top" title="多点操作，取消选中多个点" :mouseEnterDelay="0.4">
                <span>invert brush</span>
              </a-tooltip>
              <span :style="{display:'block',float:'right'}" @click.stop>
                <a-switch v-model="visInvertBrush" @change="onVisInvertBrush('switch')" />
              </span>
            </a-menu-item>
            <a-menu-item @click="onVisZoom">
              <a-tooltip placement="top" title="多点操作，放大、缩小或平移视图" :mouseEnterDelay="0.4">
                <span>zoom</span>
              </a-tooltip>
              <span :style="{display:'block',float:'right'}" @click.stop>
                <a-switch v-model="visZoom" />
              </span>
            </a-menu-item>
          </a-menu-item-group>
        </a-sub-menu>

        <a-sub-menu key="sub2">
          <span slot="title">
            <a-icon type="laptop" />
            <span>display</span>
          </span>
          <a-menu-item @click="onVisShowIds">
            <span>visShowIds</span>
            <span :style="{display:'block',float:'right'}" @click.stop>
              <a-switch v-model="visShowIds" />
            </span>
          </a-menu-item>
          <a-menu-item key="4">OprationView</a-menu-item>
          <a-menu-item key="5">DataFlow</a-menu-item>
          <a-menu-item key="6">OprationFlow</a-menu-item>
        </a-sub-menu>

        <a-sub-menu key="sub3">
          <span slot="title">
            <a-icon type="notification" />
            <span>charts</span>
          </span>
          <a-menu-item key="scatter" @click="changeChart">scatter</a-menu-item>
          <a-menu-item key="force" @click="changeChart">force</a-menu-item>
        </a-sub-menu>
      </a-menu>
    </a-layout-sider>

    <a-layout style="padding: 0 0px 0 5px">
      <a-layout-content :style="{ background: '#fff', padding: '24px', margin: 0 }">
        <keep-alive>
          <component
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
        <!-- <ForceChart
          :visClick="visClick"
          :visBrush="visBrush"
          :visInvertBrush="visInvertBrush"
          :visDrag="visDrag"
          :visMouseover="visMouseover"
          :visShowIds="visShowIds"
          :viewUpdate="viewUpdate"
        ></ForceChart>-->
        <!-- <ScatterChart
          :visClick="visClick"
          :visBrush="visBrush"
          :visInvertBrush="visInvertBrush"
          :visDrag="visDrag"
          :visMouseover="visMouseover"
          :visShowIds="visShowIds"
          :viewUpdate="viewUpdate"
        ></ScatterChart>-->
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>
<script>
import ForceChart from "./charts/ForceChart.vue";
import ScatterChart from "./charts/ScatterChart.vue";
export default {
  name: "PageView",
  components: {
    ForceChart,
    ScatterChart
  },
  data() {
    return {
      // interface
      collapsed: false, // 侧边栏
      // view
      visClick: false,
      visBrush: false,
      visInvertBrush: false,
      visDrag: true,
      visMouseover: false,
      visZoom: true,
      visShowIds: false,

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
    changeChart(option) {
      this.currentChartKey = option.key;
    },
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
    viewUpdate() {
      return this.$store.state.viewUpdate;
    },
    currentChart() {
      switch (this.currentChartKey) {
        case "scatter":
          return "ScatterChart";
          break;
        case "force":
          return "ForceChart";
          break;
        default:
          break;
      }
    }
  }
};
</script>
<style></style>