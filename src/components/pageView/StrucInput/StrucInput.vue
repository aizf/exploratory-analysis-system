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
      <div class="reload">
        <a-icon type="reload" @click="reload" />
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
// import sub0 from "@/assets/0.json";
import strucs from "@/assets/strucs.json";
import Main from "./Main";
// import * as _ from "lodash";
export default {
  name: "StrucInput",
  components: { SubForce, Main },
  inject: ["classificationPalette"],
  props: {},
  data() {
    return {
      subs: [],
      index: [],
      value: -1,
    };
  },
  computed: {},
  mounted() {
    // console.log(this.subs);
    // console.log(this.genIndex(6));
    this.reload();
  },
  methods: {
    genIndex(n) {
      let arr = Array(strucs.length)
        .fill(0)
        .map((d, i) => i);
      arr.sort((a, b) => 0.5 - Math.random());
      return arr.slice(0, n);
    },
    randomNum(minNum, maxNum) {
      switch (arguments.length) {
        case 1:
          return parseInt(Math.random() * minNum + 1, 10);
        case 2:
          return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
        default:
          return 0;
      }
    },
    clickSubForce(nodes, links) {
      this.$refs.Main.$emit("add", nodes, links);
      // console.log(1, this.nodes);
    },
    reload() {
      // console.log(1);
      // key 问题导致更新问题
      this.subs = [];
      this.$nextTick(function () {
        this.subs = this.genIndex(6).map((d) => strucs[d]);
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.container {
  color: var(--contrastColor);
  width: 450px;
  height: 564px;
  // position: absolute;
  // top: 0;
  // left: 900px;
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
  cursor: pointer;
}
</style>