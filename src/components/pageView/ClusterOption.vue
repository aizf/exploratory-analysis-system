<template>
  <div>
    <a-button
      type="primary"
      size="small"
      :loading="loading"
      @click="showDrawer"
      ghost
      >cluster</a-button
    >
    <a-drawer
      title="Cluster"
      placement="top"
      :visible="visible"
      @close="onClose"
    >
      <a-tabs v-model="tab">
        <a-tab-pane
          v-for="(params, algorithm) in option"
          :key="algorithm"
          :tab="algorithm"
        >
          <a-input
            v-for="(val, key) in params"
            :addon-before="key"
            v-model="option[algorithm][key]"
            :key="algorithm + key"
          />
        </a-tab-pane>
      </a-tabs>
      <a-button
        type="primary"
        size="small"
        :loading="loading"
        @click="toCluster"
        >cluster</a-button
      >
    </a-drawer>
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
      visible: false,
      tab: "KMeans",
      option: {
        KMeans: { n_clusters: 5 },
        MeanShift: { quantile: 0.2 },
        DBSCAN: { eps: 180, min_samples: 6 },
        AgglomerativeClustering: { linkage: "ward", n_clusters: 5 },
        AffinityPropagation: {},
      },
      loading: false,
    };
  },
  computed: {
    ...mapState({
      uidNodeMap: (state) => state.data.uidMaps.uidNodeMap,
    }),
    ...mapGetters(["nodes", "links", "nodesNumber"]),
  },
  mounted() {
    console.log("NodesList", this);
  },
  methods: {
    showDrawer() {
      this.visible = true;
    },
    onClose() {
      this.visible = false;
    },
    toCluster() {
      this.loading = true;
      const params = this.option[this.tab];
      for (let [key, val] of Object.entries(params)) {
        if (!isNaN(val)) {
          params[key] = +val;
        }
      }
      axios({
        method: "post",
        // url: "//127.0.0.1:3000/p/cluster",
        url: "//127.0.0.1:5000/cluster",
        data: {
          algorithm: this.tab,
          nodes: this.nodes,
          params: params,
        },
      }).then((res) => {
        const { data } = res;
        data.data.forEach(({ uid, group }) => {
          this.uidNodeMap[uid].group = group;
        });
        // console.log("cluster", data);
        setTimeout(() => {
          this.loading = false;
        }, 500);
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