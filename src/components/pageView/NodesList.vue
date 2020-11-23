<template>
  <div class="container test-border">
    <a-input
      placeholder="input search text"
      v-model="keyword"
      style="width: 100%"
    />
    <RecycleScroller
      class="scroller"
      :items="items"
      :item-size="32"
      keyField="uid"
      v-slot="{ item }"
    >
      <div
        :class="{
          item: true,
          selected: item.selected,
          mouseover_show: item.mouseover_show,
        }"
        @click="clickSelect(item)"
        @mouseover="item.current = true"
        @mouseout="item.current = false"
        :style="{ color: classificationPalette[item.group || 0] }"
      >
        {{ item.id }}
      </div>
    </RecycleScroller>
  </div>
</template>
<script>
// import Vue from "vue";
import { RecycleScroller } from "vue-virtual-scroller";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";
import { mapState, mapGetters } from "vuex";
// import * as _ from "lodash";
export default {
  name: "NodesList",
  components: {
    RecycleScroller,
  },
  inject: ["classificationPalette"],
  props: {},
  data() {
    return {
      keyword: "",
    };
  },
  computed: {
    ...mapState({
      sourceData: (state) => state.data.sourceData,
      visualData: (state) => state.data.visualData,
      nodeFields: (state) => state.data.nodeFields,
    }),
    ...mapGetters(["nodes", "links", "nodesNumber"]),
    items() {
      let nodes = this.nodes;
      const mouseoverNodes = this.nodes.filter((d) => d.mouseover_show);
      nodes = mouseoverNodes.length ? mouseoverNodes : this.nodes;
      const pattern = new RegExp(this.keyword, "i");
      // console.log(this.keyword);
      // console.log(pattern);
      nodes = nodes.filter((d) => pattern.test(d.id));
      // console.log(nodes);
      return nodes;
    },
  },
  mounted() {
    console.log("NodesList", this);
  },
  methods: {
    clickSelect(node) {
      node.selected = !node.selected;
    },
    onSearch() {},
  },
};
</script>
<style lang="scss" scoped>
.container {
  width: 230px;
  height: 870px;
}
.scroller {
  width: 100%;
  height: 845px;
  .selected {
    border: 1px solid red;
  }
}

.item {
  height: 32%;
  padding: 0 12px;
  display: flex;
  align-items: center;
  cursor: pointer;
  text-overflow: ellipsis;
}
</style>