<template>
  <div>
    <a-dropdown-button type="primary" size="small" :disabled="loading" ghost>
      Group
      <a-menu slot="overlay">
        <a-menu-item key="0" @click="classification(0)">
          <a-icon type="desktop" />None
        </a-menu-item>
        <a-menu-item key="1" @click="classification(1)">
          <a-icon type="desktop" />Communities
        </a-menu-item>
        <a-menu-item key="2" @click="classification(2)">
          <a-icon type="desktop" />Target
        </a-menu-item>
        <a-menu-item
          v-for="func in onlineFunc"
          :key="func"
          @click="cluster(func)"
        >
          <a-icon type="cloud-download" />{{ func }}
        </a-menu-item>
        <a-menu-item
          v-for="func in onlineFunc"
          :key="func + '32'"
          @click="cluster32(func)"
        >
          <a-icon type="desktop" />{{ func }}
        </a-menu-item>
      </a-menu>
    </a-dropdown-button>
    <!-- <a-button
      type="primary"
      size="small"
      :loading="loading1 || loading2"
      @click="classification"
      ghost
      >Classification</a-button
    > -->
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
      loading: false,
      onlineFunc: [
        "KMeans",
        "MeanShift",
        "AgglomerativeClustering",
        "AffinityPropagation",
      ],
    };
  },
  computed: {
    ...mapState({
      datasetName: (state) => state.data.datasetName,
      uidNodeMap: (state) => state.data.uidMaps.uidNodeMap,
    }),
    ...mapGetters(["nodes", "links", "nodesNumber"]),
  },
  mounted() {
    // console.log("ClassificationOption", this);
  },
  methods: {
    classification(index) {
      if (index === 0) {
        this.nodes.forEach((node) => {
          node.group = 0;
        });
        return;
      }
      this.loading = true;
      const data = {
        0: "",
        1: "communities_list.json",
        2: "target_list.json",
        // 3: "pos_umap.json",
        // 4: "pos_isomap.json",
      };
      axios({
        method: "get",
        url: `/static/${this.datasetName}/${data[index]}`,
      }).then((res) => {
        const { data } = res;
        this.nodes.forEach((node, i) => {
          node.group = data[i];
        });
        this.loading = false;
      });
    },
    cluster(algorithm) {
      this.loading = true;
      const pos = this.nodes.map((d) => [d.x, d.y]);
      axios({
        method: "post",
        url: `//127.0.0.1:5000/cluster`,
        data: { pos, algorithm },
      })
        .then((res) => {
          const { data } = res;
          const group = data.data;
          // console.log(group);
          this.nodes.forEach((node, i) => {
            node.group = group[i];
          });
          this.loading = false;
        })
        .catch((err) => {
          this.loading = false;
          throw err;
        });
    },
    cluster32(algorithm) {
      if (algorithm === "AffinityPropagation") return;
      this.loading = true;
      // const pos = this.nodes.map((d) => [d.x, d.y]);
      axios({
        method: "get",
        url: `/static/facebook/cluster_32/${algorithm}.json`,
      })
        .then((res) => {
          const { data } = res;
          const group = data;
          // console.log(group);
          this.nodes.forEach((node, i) => {
            node.group = group[i];
          });
          this.loading = false;
        })
        .catch((err) => {
          this.loading = false;
          throw err;
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