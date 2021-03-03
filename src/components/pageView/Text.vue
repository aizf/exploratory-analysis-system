<template>
  <a-tag :color="classificationPalette[topic]"> {{text}} </a-tag>
</template>
<script>
// import Vue from "vue";
import { RecycleScroller } from "vue-virtual-scroller";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";
import { mapState, mapGetters } from "vuex";
// import * as _ from "lodash";
export default {
  name: "Text",
  components: {},
  inject: ["classificationPalette"],
  props: {
    text: String,
    topic: Number,
    prob: Number,
  },
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
  width: 400px;
  height: 594px;
  position: absolute;
  top: 0;
  left: 500px;
  z-index: 999999;
}
</style>