<template>
  <div class="container test-border">
    <a-button type="primary" style="width: 30%" @click="infoInput">
      Input
    </a-button>
    <a-input
      placeholder="input search text"
      v-model="keyword"
      style="width: 70%"
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
        :style="{ color: classificationPalette[0] }"
      >
        {{ item.uid }}
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
  props: {
    refs: Object,
  },
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
    infoInput() {
      // console.log(1, this.$parent.$refs);
      const words = this.refs.TextInput.words.filter((d) => d.selected);
      const nodes = this.refs.StrucInput.nodes;
      const links = this.refs.StrucInput.links;
      this.refs.Record.records.unshift({
        words,
        nodes,
        links,
      });
      // console.log(1, words, nodes, links);
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