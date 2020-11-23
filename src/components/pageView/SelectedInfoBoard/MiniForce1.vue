<template>
  <div class="MiniForce1 test-border"></div>
</template>
<script>
import echarts from "echarts";
import { mapState, mapGetters } from "vuex";
export default {
  name: "MiniForce1",
  inject: ["backgroundColor", "contrastColor", "classificationPalette"],
  props: {
    items: Array,
  },
  data() {
    return {};
  },
  computed: {
    ...mapState({
      nodeFields: (state) => state.data.nodeFields,
      uidLinksMap: (state) => state.data.uidMaps.uidLinksMap,
    }),
    ...mapGetters(["links"]),
    selectedLinks() {
      return this.links
        .filter((link) => link.source.selected && link.target.selected)
        .map((link) => ({ source: link.source.id, target: link.target.id }));
    },
    selectedNodes() {
      return this.items.map((node) => ({
        name: node.id,
        category: node.group,
        itemStyle: {
          color: this.classificationPalette[node.group || 0],
        },
      }));
    },
  },
  created() {},
  mounted() {
    this.chart = echarts.init(this.$el, null);
    this.$watch(
      "items",
      function () {
        this.render();
      },
      {
        deep: true,
      }
    );
  },
  methods: {
    render() {
      // console.log("MiniForce1 render");
      // console.log(this.selectedNodes);
      // console.log(this.selectedLinks);
      const option = {
        grid: {
          bottom: "12%",
          height: "80%",
        },
        backgroundColor: this.backgroundColor,
        textStyle: {
          color: this.contrastColor,
        },
        series: {
          type: "graph",
          layout: "circular",
          circular: {
            rotateLabel: true,
          },
          data: this.selectedNodes,
          links: this.selectedLinks,
          roam: true,
          label: {
            position: "right",
            formatter: "{b}",
          },
          lineStyle: {
            color: "source",
            curveness: 0.3,
          },
        },
      };
      this.chart.setOption(option, true);
    },
  },
  watch: {},
};
</script>
<style lang="scss" scope>
.MiniForce1 {
  width: 280px;
  height: 200px;
}
</style>