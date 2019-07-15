<template>
  <div id="app">
    <a-layout id="components-layout-demo-top-side-2" style="min-height: 100vh">
      <a-layout-header class="header">
        <div class="logo" />
        <a-menu
          theme="dark"
          mode="horizontal"
          :defaultSelectedKeys="['2']"
          :style="{ lineHeight: '64px' }"
        >
          <a-menu-item key="1">nav 1</a-menu-item>
          <a-menu-item key="2">nav 2</a-menu-item>
          <a-menu-item key="3">nav 3</a-menu-item>
        </a-menu>
      </a-layout-header>

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
              <a-menu-item @click="onVisClick">
                <span>click</span>
                <span :style="{display:'block',float:'right'}">
                  <a-switch v-model="visClick" @change="visSwitched=true" />
                </span>
              </a-menu-item>
              <a-menu-item @click="onVisBrush">
                <span>brush</span>
                <span :style="{display:'block',float:'right'}">
                  <a-switch v-model="visBrush" @change="visSwitched=true" />
                </span>
              </a-menu-item>
              <a-menu-item key="1" @click="onVisDrag">
                <span>drag</span>
                <span :style="{display:'block',float:'right'}">
                  <a-switch v-model="visDrag" @change="visSwitched=true" />
                </span>
              </a-menu-item>
              <a-menu-item @click="onVisMouseover">
                <span>mouseover</span>
                <span :style="{display:'block',float:'right'}">
                  <a-switch v-model="visMouseover" @change="visSwitched=true" />
                </span>
              </a-menu-item>
            </a-sub-menu>

            <a-sub-menu key="sub2">
              <span slot="title">
                <a-icon type="laptop" />
                <span>display</span>
              </span>
              <a-menu-item @click="onVisShowIds">
                <span>visShowIds</span>
                <span :style="{display:'block',float:'right'}">
                  <a-switch v-model="visShowIds" @change="visSwitched=true" />
                </span>
              </a-menu-item>
              <a-menu-item key="4">OprationView</a-menu-item>
              <a-menu-item key="5">DataFlow</a-menu-item>
              <a-menu-item key="6">OprationFlow</a-menu-item>
            </a-sub-menu>

            <a-sub-menu key="sub3">
              <span slot="title">
                <a-icon type="notification" />
                <span>sub3</span>
              </span>
              <a-menu-item key="9">option9</a-menu-item>
              <a-menu-item key="10">option10</a-menu-item>
              <a-menu-item key="11">option11</a-menu-item>
              <a-menu-item key="12">option12</a-menu-item>
            </a-sub-menu>
          </a-menu>
        </a-layout-sider>

        <a-layout style="padding: 0 24px 0 5px">
          <a-layout-content :style="{ background: '#fff', padding: '24px', margin: 0 }">
            <ForceChart
              :visClick="visClick"
              :visBrush="visBrush"
              :visDrag="visDrag"
              :visMouseover="visMouseover"
              :visShowIds="visShowIds"
            ></ForceChart>
          </a-layout-content>
        </a-layout>
      </a-layout>
    </a-layout>
  </div>
</template>

<script>
import ForceChart from "./components/ForceChart.vue";

export default {
  name: "app",
  components: {
    ForceChart
  },
  data() {
    return {
      collapsed: false,
      visClick: false,
      visBrush: false,
      visDrag: true,
      visMouseover: false,
      visSwitched: false,   // 点击开关时，防止双击
      visShowIds:false,
    };
  },
  methods: {
    onVisClick() {
      if (this.visSwitched) {
        this.visSwitched = false;
        return;
      }
      this.visClick = !this.visClick;
      // this.visClick = checked;
    },
    onVisBrush() {
      if (this.visSwitched) {
        this.visSwitched = false;
        return;
      }
      this.visBrush = !this.visBrush;
      // this.visBrush = checked;
      // console.log(this.visBrush);
    },
    onVisDrag() {
      if (this.visSwitched) {
        this.visSwitched = false;
        return;
      }
      this.visDrag = !this.visDrag;
      // this.visDrag = checked;
      // console.log(this.visDrag);
    },
    onVisMouseover() {
      if (this.visSwitched) {
        this.visSwitched = false;
        return;
      }
      this.visMouseover = !this.visMouseover;
      // this.visMouseover = checked;
    },
    onVisShowIds(){
      if (this.visSwitched) {
        this.visSwitched = false;
        return;
      }
      this.visShowIds = !this.visShowIds;
    },
    test() {
      console.log("c");
    },
    test1(e) {
      console.log(e);
      console.log(e.target);
    }
  }
};
</script>

<style scoped>
/* #app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
} */
#components-layout-demo-top-side-2 .logo {
  width: 120px;
  height: 31px;
  background: rgba(255, 255, 255, 0.2);
  margin: 16px 28px 16px 0;
  float: left;
}
</style>
