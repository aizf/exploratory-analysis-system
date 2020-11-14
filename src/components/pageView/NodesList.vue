<template>
  <RecycleScroller
    class="scroller test-border"
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
    return {};
  },
  computed: {
    ...mapState({
      sourceData: (state) => state.data.sourceData,
      visualData: (state) => state.data.visualData,
      nodeFields: (state) => state.data.nodeFields,
    }),
    ...mapGetters(["nodes", "links", "nodesNumber"]),
    items() {
      const mouseoverNodes = this.nodes.filter((d) => d.mouseover_show);
      return mouseoverNodes.length ? mouseoverNodes : this.nodes;
    },
  },
  mounted() {
    console.log("NodesList", this);
  },
  methods: {
    clickSelect(node) {
      node.selected = !node.selected;
    },
  },
};
</script>
<style lang="scss" scoped>
.scroller {
  width: 230px;
  height: 870px;
}

.item {
  height: 32%;
  padding: 0 12px;
  display: flex;
  align-items: center;
  cursor: pointer;
  text-overflow: ellipsis;
}
div {
  .selected {
    border: 1px solid red;
  }
}
</style>