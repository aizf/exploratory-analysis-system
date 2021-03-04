<template>
  <div class="container test-border">
    <div class="draw">
      <Main ref="Main" />
    </div>
    <div class="select">
      <!-- <SubForce
        class="sub-select"
        :nodes="subs[0].nodes"
        :links="subs[0].links"
      /> -->
      <div class="reload">
        <a-icon type="reload" />
      </div>
      <div class="sub-select" v-for="(sub, i) in subs" :key="i">
        <a-button
          class="sub-select-radio"
          shape="circle"
          icon="plus"
          size="small"
          @click="clickSubForce(sub.nodes, sub.links)"
        />
        <SubForce :nodes="sub.nodes" :links="sub.links" />
      </div>
    </div>
  </div>
</template>
<script>
// import Vue from "vue";
import { RecycleScroller } from "vue-virtual-scroller";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";
import { mapState, mapGetters } from "vuex";
import SubForce from "../SubForce";
import sub0 from "@/assets/0.json";
import sub1 from "@/assets/1.json";
import sub2 from "@/assets/2.json";
import sub3 from "@/assets/3.json";
import sub4 from "@/assets/4.json";
import sub5 from "@/assets/5.json";
import Main from "./Main";
// import * as _ from "lodash";
export default {
  name: "StrucInput",
  components: { SubForce, Main },
  inject: ["classificationPalette"],
  props: {},
  data() {
    return {
      subs: [sub0, sub1, sub2, sub3, sub4, sub5],
      value: -1,
    };
  },
  computed: {
  },
  mounted() {
    console.log(this.subs);
  },
  methods: {
    clickSubForce(nodes, links) {
      this.$refs.Main.$emit("add", nodes, links);
      // console.log(1, this.nodes);
    },
  },
};
</script>
<style lang="scss" scoped>
.container {
  color: var(--contrastColor);
  width: 450px;
  height: 594px;
  position: absolute;
  top: 0;
  left: 900px;
  z-index: 999999;
}
.draw {
  height: 50%;
  border-bottom: 1px solid skyblue;
}
.select {
  height: 50%;
  display: flex;
  flex-wrap: wrap;
}
.sub-select {
  height: 50%;
  width: 33%;
  position: relative;
}
.sub-select-radio {
  position: absolute;
  left: 5px;
  top: 5px;
}
.reload {
  position: absolute;
  right: 10px;
  top: 300px;
}
</style>