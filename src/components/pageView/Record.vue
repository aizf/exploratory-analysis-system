<template>
  <div class="container test-border">
    <SubRecord
      v-for="record in records"
      :words="record.words"
      :nodes="record.nodes"
      :links="record.links"
      :key="record.index"
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
    };
  },
  computed: {},
  mounted() {
    console.log("Record", this);
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
.container {
  width: 1350px;
  height: 277px;
  position: absolute;
  top: 594px;
  left: 0;
  z-index: 999999;
  overflow-x: scroll;
  display: flex;
}
</style>