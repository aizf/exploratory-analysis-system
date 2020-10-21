<template>
  <div>
    <a-button @click="marked = !marked">
      <a-icon type="book" :theme="marked ? 'filled' : 'outlined'" />
    </a-button>
    <a-badge
      :count="markedNum"
      showZero
      :numberStyle="{ backgroundColor: '#1890ff' }"
    >
      <a-button @click="markedsVisible = true">
        <a-icon type="database" />Marked Views
      </a-button>
    </a-badge>
    <a-drawer
      title="Marked Views"
      placement="right"
      :width="720"
      :closable="false"
      @close="markedsVisible = false"
      :visible="markedsVisible"
    >
      <MarkedViewsDrawer :markedVisualData="markedVisualData" />
    </a-drawer>
  </div>
</template>
<script>
import MarkedViewsDrawer from "./MarkedViewsDrawer.vue";
import { mapState, mapGetters } from "vuex";

export default {
  name: "MarkedViews",
  components: {
    MarkedViewsDrawer,
  },
  props: {},
  data() {
    return {
      markedsVisible: false,
    };
  },
  computed: {
    ...mapState({
      currentUUID: (state) => state.view.currentUUID,
    }),
    ...mapGetters(["tmpExistingViews"]),
    marked: {
      get: function () {
        return this.tmpExistingViews.nodes[this.currentUUID].marked;
      },
      set: function (val) {
        this.tmpExistingViews.nodes[this.currentUUID].marked = val;
      },
    },
    markedVisualData() {
      const nodes = this.tmpExistingViews.nodes;
      const res = {};
      Object.keys(nodes).forEach((uid) => {
        if (nodes[uid].marked) {
          res[uid] = nodes[uid];
        }
      });
      return res;
    },
    markedNum() {
      return Object.keys(this.markedVisualData).length;
    },
  },
  methods: {},
};
</script>
<style scope>
</style>
