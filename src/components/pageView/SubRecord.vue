<template>
  <div class="container1">
    <div class="words">
      <a-tag
        class="text"
        v-for="word in words"
        :color="classificationPalette[word.topic]"
        :style="{ opacity: prob2opacity(word) }"
        :key="word.topic + word.text"
      >
        {{ word.text }}
      </a-tag>
    </div>
    <div class="g">
      <SubForce :nodes="nodes" :links="links" />
    </div>
  </div>
</template>
<script>
// import Vue from "vue";
import { RecycleScroller } from "vue-virtual-scroller";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";
import { mapState, mapGetters } from "vuex";
import SubForce from "./SubForce";
import TextInput from "./TextInput";
// import * as _ from "lodash";
export default {
  name: "SubRecord",
  components: { SubForce },
  inject: ["classificationPalette"],
  props: {
    words: Array,
    nodes: Array,
    links: Array,
  },
  data() {
    return {
      keyword: "",
    };
  },
  computed: {},
  mounted() {},
  methods: {
    prob2opacity(word) {
      // console.log(TextInput);
      return TextInput.methods.prob2opacity.call(this, word);
    },
  },
};
</script>
<style lang="scss" scoped>
.container1 {
  width: 350px;
  height: 100%;
  border: 1px solid skyblue;
  flex-shrink: 0;
}
.words {
  height: 3em;
  border-bottom: 1px solid skyblue;
  padding: 5px;
  display: flex;
  align-items: center;
  overflow: hidden;
}
</style>