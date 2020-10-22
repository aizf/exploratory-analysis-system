<template>
  <div class="WebGLChart" :style="{ width: width, height: height }"></div>
</template>
<script>
import Vue from "vue";
import store from "@/store/";
import { mapState, mapGetters } from "vuex";
import * as PIXI from "pixi.js";

import {
  backgroundColor,
  contrastColor,
  classificationPalette,
} from "@/config/color";
export default {
  name: "WebGLChart",
  components: {},
  props: {
    eventOption: Object,
    chartOption: Object,
  },
  data() {
    return {
      transform: { k: 1, x: 0, y: 0 },
    };
  },
  computed: {
    ...mapState({
      uidNodeMap: (state) => state.data.uidMaps.uidNodeMap,
      width: (state) => state.view.dpiX * 0.4,
      height: (state) => state.view.dpiY * 0.7,
      currentUUID: (state) => state.view.currentUUID,
      needUpdate: (state) => state.view.chartsNeedUpdate.force,
    }),
    ...mapGetters(["nodes", "links", "nodesNumber", "linksNumber"]),
  },
  created() {
    this.contrastColor = contrastColor;
    this.backgroundColor = backgroundColor;
  },
  mounted() {
    console.log("WebGLChart", this);
    this.app = new PIXI.Application({
      width: this.width,
      height: this.height,
      antialias: true,
    });
    this.app.renderer.backgroundColor = PIXI.utils.string2hex(backgroundColor);
    this.$el.appendChild(this.app.view);

    const vis = new PIXI.Container();
    this.nodesG = new PIXI.Container();
    this.linksG = new PIXI.Container();
    this.textsG = new PIXI.Container();
    console.log(vis);
    vis.addChild(this.nodesG, this.linksG, this.textsG);
    this.app.stage.addChild(vis);

    this.$watch(
      "nodes",
      function () {
        this.nodes.forEach((node) => {
          this.nodesG.addChild(this.circle(node));
        });
      },
      { immediate: true }
    );
    this.$watch(
      "nodes",
      function () {
        // console.log("watch node");
        this.nodesG.children.forEach((circle) => {
          const node = circle.__data__;
          circle.x = node.x;
          circle.y = node.y;
        });
      },
      { immediate: true, deep: true }
    );
  },
  activated() {},
  methods: {
    reInit() {
      // 重新渲染图标
      if (this.nodes.length === 0) {
        return;
      }
      // debugger;
      this.transform.k = 1;
      this.transform.x = 0;
      this.transform.y = 0;
      let t = this.visTransform();
      t.x = 0;
      t.y = 0;
      t.k = 1;
      this.vis.attr("transform", t);
      // this.simulation.alpha(1).restart(); // 更新数据后重新开始仿真
      console.log("reInit");
    },
    circle(node) {
      const { x, y, group } = node;
      const circle = new PIXI.Graphics();
      circle.beginFill(this.fillColor(group)).drawCircle(x, y, 4.5).endFill();
      circle.__data__ = node;
      circle.interactive = true;
      circle.on("click", function (...e) {
        console.log(e);
        console.log(this);
      });
      return circle;
    },
    fillColor(group) {
      return PIXI.utils.string2hex(classificationPalette[group || 0]);
    },
  },
  watch: {},
};
</script>
<style>
</style>
<style lang="scss" scope>
.WebGLChart {
  /* display: none; */
  border: 1px solid #305dff;
  // background: var(--backgroundColor);
}
</style>