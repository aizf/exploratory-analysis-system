<template>
  <div class="container test-border">
    <SubRecord
      v-for="record in records"
      :record="record"
      :words="record.words"
      :nodes="record.nodes"
      :links="record.links"
      :index="record.index"
      :key="record.index"
      @updateFather="updateFather"
    />
  </div>
</template>
<script>
// import Vue from "vue";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";
import { mapState, mapGetters } from "vuex";
import SubRecord from "./SubRecord.vue";
// import g from "@/assets/0.json";
// import * as _ from "lodash";
export default {
  name: "Record",
  components: { SubRecord },
  inject: ["classificationPalette"],
  props: {},
  data() {
    return {
      records: [],
      root: { index: "root", words: [], nodes: [], links: [], children: [] },
      father: {},
    };
  },
  computed: {},
  mounted() {
    // console.log("Record", this);
    window.Record = this;
    this.father = this.root;
    this.$on("addRecord", (record) => {
      "children" in this.father ? null : (this.father.children = []);
      this.father.children.push(record);
      this.records.unshift(record);
    });
  },
  methods: {
    updateFather(newVal) {
      this.father = newVal;
    },
  },
};
</script>
<style lang="scss" scoped>
.container {
  width: 1350px;
  height: 277px;
  position: absolute;
  top: 594px;
  left: 0;
  overflow-x: scroll;
  display: flex;
}
</style>