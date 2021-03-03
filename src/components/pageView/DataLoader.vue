<template>
  <div class="container test-border">
    <a-button style="margin: 0 0 0 5px"> DataLoader </a-button>
  </div>
</template>
<script>
// import Vue from "vue";
import { RecycleScroller } from "vue-virtual-scroller";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";
import { mapState, mapGetters } from "vuex";
// import * as _ from "lodash";
export default {
  name: "DataLoader",
  components: {},
  inject: ["classificationPalette"],
  props: {},
  data() {
    return {
      keyword: "",
    };
  },
  computed: {},
  mounted() {},
  methods: {},
};
</script>
<style lang="scss" scoped>
.container {
  // width: 200px;
  // height: 3em;
  position: absolute;
  top:0;
  left: 0;
  z-index: 999999;
}
</style>