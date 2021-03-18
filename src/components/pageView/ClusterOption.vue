<template>
  <div>
    <a-dropdown-button type="primary" size="small" :disabled="disabled">
      Layout
      <a-menu slot="overlay">
        <a-menu-item key="0" @click="toCluster(0)">
          <a-icon type="desktop" />Force
        </a-menu-item>
        <a-menu-item key="1" @click="toCluster(1)">
          <a-icon type="desktop" />T-SNE
        </a-menu-item>
        <a-menu-item key="2" @click="toCluster(2)">
          <a-icon type="desktop" />PCA
        </a-menu-item>
        <a-menu-item key="3" @click="toCluster(3)">
          <a-icon type="desktop" />UMAP
        </a-menu-item>
        <a-menu-item key="4" @click="toCluster(4)">
          <a-icon type="desktop" />Isomap
        </a-menu-item>
      </a-menu>
    </a-dropdown-button>
  </div>
</template>
<script>
import { mapState, mapGetters } from "vuex";
import axios from "axios";
// import debounce from "lodash/debounce";
export default {
  name: "ClusterOption",
  data() {
    return {
      disabled: false,
    };
  },
  computed: {
    ...mapGetters(["nodes"]),
  },
  mounted() {
    console.log("ClusterOption", this);
  },
  methods: {
    toCluster(index) {
      const data = {
        0: "pos_force.json",
        1: "pos_tsne.json",
        2: "pos_pca.json",
        3: "pos_umap.json",
        4: "pos_isomap.json",
      };
      this.disabled = true;
      axios({
        method: "get",
        // url: "//127.0.0.1:3000/p/cluster",
        url: `/static/${data[index]}`,
      }).then((res) => {
        const { data } = res;
        // console.log(data);
        this.nodes.forEach((d, i) => {
          const [x, y] = data[i];
          d.x = x;
          d.y = y;
        });
        this.disabled = false;
      });
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