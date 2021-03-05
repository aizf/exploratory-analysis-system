<template>
  <div>
    <a-button
      type="primary"
      size="small"
      :loading="loading1 || loading2"
      @click="classification"
      ghost
      >Classification</a-button
    >
  </div>
</template>
<script>
import { mapState, mapGetters } from "vuex";
import axios from "axios";
// import debounce from "lodash/debounce";
export default {
  name: "ClassificationOption",
  data() {
    return {
      lists: [],
      index: 0,
      loading1: true,
      loading2: true,
    };
  },
  computed: {
    ...mapState({
      uidNodeMap: (state) => state.data.uidMaps.uidNodeMap,
    }),
    ...mapGetters(["nodes", "links", "nodesNumber"]),
  },
  mounted() {
    // console.log("ClassificationOption", this);

    const defaultList = Array(22470).fill(0);
    this.lists.push(defaultList);
    axios({
      method: "get",
      // url: "//127.0.0.1:3000/p/cluster",
      url: "/static/communities_list.json",
    }).then((res) => {
      const { data } = res;
      this.lists.push(data);
      this.loading1 = false;
      // console.log("list", data);
    });
    axios({
      method: "get",
      // url: "//127.0.0.1:3000/p/cluster",
      url: "/static/target_list.json",
    }).then((res) => {
      const { data } = res;
      this.lists.push(data);
      this.loading2 = false;
      // console.log("list", data);
    });
  },
  methods: {
    classification() {
      this.index = (this.index + 1) % this.lists.length;
      const list = this.lists[this.index];
      // console.log(list);
      this.nodes.forEach((node) => {
        node.group = list[node.uid];
      });
      //
    },
  },
};
</script>
<style lang="scss" scoped>
.scroller {
  width: 230px;
  height: 800px;
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