<template>
  <div class="WebGLChart" :style="{ width: width, height: height }"></div>
</template>
<script>
import * as d3 from "d3";
import store from "@/store/";
import { mapState, mapGetters } from "vuex";
import * as PIXI from "pixi.js";

export default {
  name: "WebGLChart",
  components: {},
  inject: ["contrastColor", "backgroundColor", "classificationPalette"],
  props: {
    eventOption: Object,
    chartOption: Object,
    width: Number,
    height: Number,
  },
  data() {
    return {
      transform: { k: 1, x: 0, y: 0 },
    };
  },
  computed: {
    ...mapState({
      uidMaps: (state) => state.data.uidMaps,
      uidNodeMap: (state) => state.data.uidMaps.uidNodeMap,
      currentUUID: (state) => state.view.currentUUID,
      needUpdate: (state) => state.view.chartsNeedUpdate.force,
    }),
    ...mapGetters([
      "nodes",
      "links",
      "nodesNumber",
      "linksNumber",
      "beforeEvent",
    ]),
    lineColor() {
      return PIXI.utils.string2hex("#aaaaaa");
    },
  },
  created() {},
  mounted() {
    console.log("WebGLChart", this);
    console.log("WebGLChart", PIXI);
    this.app = new PIXI.Application({
      width: this.width,
      height: this.height,
      antialias: true,
    });
    this.app.renderer.backgroundColor = PIXI.utils.string2hex(
      this.backgroundColor
    );
    this.$el.appendChild(this.app.view);

    this.vis = new PIXI.Container();
    this.linksG = new PIXI.Container();
    this.nodesG = new PIXI.Container();
    // console.log(vis);
    this.vis.addChild(this.linksG, this.nodesG);
    this.app.stage.addChild(this.vis);

    // nodes数量变化时
    this.$watch(
      () => this.nodes.map((d) => d.uid),
      function () {
        this.nodesG.removeChildren();
        this.nodes.forEach((node) => {
          this.nodesG.addChild(this.nodeG(node));
        });
        this.linksG.removeChildren();
        this.links.forEach((link) => {
          this.linksG.addChild(this.line(link));
        });
      },
      { immediate: true }
    );
    this.$on("setPostion", this.setPostion);
    this.$on("zoom", this.zoom);
    this.$on("brush", this.brush);
  },
  activated() {},
  methods: {
    zoom(transform) {
      const { k, x, y } = transform;
      this.vis.scale.x = k;
      this.vis.scale.y = k;
      this.vis.x = x;
      this.vis.y = y;
    },
    brush() {
      this.nodesG.children.forEach((nodeG) => {
        const { selected, brushing } = nodeG.__data__;
        const border = nodeG.children[0];
        if (brushing || selected) border.alpha = 1;
        else border.alpha = 0;
      });
    },
    clickSelect(d) {
      if (!this.eventOption.visClick) return;
      this.beforeEvent("click", this);
      if (d.selected) {
        d.selected = false;
      } else {
        d.selected = true;
        d.attentionTimes += 1;
        let operation = {
          action: "click",
          nodes: [d],
        };
        this.$store.dispatch("addOperation", operation);
        console.log("click");
      }
    },
    mouseover(node) {
      if (!this.eventOption.visMouseover || this.isDraging) return;

      this.beforeEvent("mouseover", this);

      this.nodes.forEach((node) => (node.mouseover_show = false));
      this.links.forEach((link) => (link.mouseover_show = false));
      const displayNodes = [...this.uidMaps.uidLinkedNodesMap[node.uid], node];
      displayNodes.forEach((d) => (d.mouseover_show = true));
      const displayLinks = this.uidMaps.uidLinksMap[node.uid];
      displayLinks.forEach((d) => (d.mouseover_show = true));

      this.setPostion();

      if (!this.isDraging) {
        displayNodes.forEach((d) => {
          d.attentionTimes += 1;
        });
        let operation = {
          action: "mouseover",
          nodes: displayNodes,
        };
        this.$store.dispatch("addOperation", operation);
        console.log("mouseover");
      }
    },
    mouseout(node) {
      if (!this.eventOption.visMouseover || this.isDraging) return;
      this.nodes.forEach((node) => (node.mouseover_show = true));
      this.links.forEach((link) => (link.mouseover_show = true));
      this.setPostion();
    },
    nodeG(node) {
      const that = this;
      const nodeG = new PIXI.Container();
      nodeG.__data__ = node;
      const { x, y, group } = node;

      const border = new PIXI.Graphics();
      border
        .beginFill(0xf03e3e)
        .drawCircle(0, 0, 4.5 + 1.2)
        .endFill();
      border.alpha = 0;

      const circle = new PIXI.Graphics();
      circle.beginFill(this.fillColor(group)).drawCircle(0, 0, 4.5).endFill();
      circle.interactive = true;
      circle.buttonMode = true;
      circle.on("click", function () {
        const node = this.parent.__data__;
        that.clickSelect(node);
        this.parent.children[0].alpha = node.selected ? 1 : 0;
      });
      circle.on("mouseover", function () {
        that.mouseover(this.parent.__data__);
      });
      circle.on("mouseout", function () {
        that.mouseout(this.parent.__data__);
      });

      // this.text = new PIXI.Container();

      nodeG.addChild(border, circle);
      nodeG.x = x;
      nodeG.y = y;
      return nodeG;
    },
    line(link) {
      const line = new PIXI.Graphics();
      line.__data__ = link;
      return line;
    },
    fillColor(group) {
      return PIXI.utils.string2hex(this.classificationPalette[group || 0]);
    },
    setPostion() {
      this.nodesG.children.forEach((nodeG) => {
        const { x, y, mouseover_show } = nodeG.__data__;
        nodeG.x = x;
        nodeG.y = y;
        nodeG.alpha = mouseover_show ? 1 : 0.04;
      });
      this.linksG.children.forEach((line) => {
        const link = line.__data__;
        const {
          source: { x: x1 },
          source: { y: y1 },
          target: { x: x2 },
          target: { y: y2 },
          mouseover_show,
        } = link;
        line.clear();
        line.lineStyle({
          width: this.chartOption.link.width,
          color: this.lineColor,
          alpha: mouseover_show ? 0.2 : 0.04,
          native: true,
        });
        line.moveTo(x1, y1);
        line.lineTo(x2, y2);
        line.endFill();
      });
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