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
      <a-button
        class="sub-select-button"
        shape="circle"
        icon="plus"
        size="small"
        @click="clickSub()"
      />
      <span class="sub-select-index">{{ index }}</span>
      <SubForce :nodes="nodes" :links="links" />
    </div>
  </div>
</template>
<script>
// import Vue from "vue";
import { dataDeepClone } from "@/utils/methods.js";
import { mapState, mapGetters } from "vuex";
import SubForce from "./SubForce";
import TextInput from "./TextInput";
import store from "@/store/";
// import * as _ from "lodash";
export default {
  name: "SubRecord",
  components: { SubForce },
  inject: ["classificationPalette"],
  props: {
    record: Object,
    words: Array,
    nodes: Array,
    links: Array,
    index: [Number, String],
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
    clickSub() {
      // console.log(1, { nodes: this.nodes, links: this.links });
      this.$emit("updateFather", this.record);
      const { nodes, links } = dataDeepClone(
        { nodes: this.nodes, links: this.links },
        "id",
        "strucID"
      );
      // console.log(2, { nodes, links });
      nodes.forEach((d, i) => {
        d.strucID = i;
      });
      nodes.forEach((d) => {
        this.$set(d, "x", d.x);
        this.$set(d, "y", d.y);
      });

      // 防止key重复
      store.commit("updateG", { nodes: [], links: [] });
      this.$nextTick(function () {
        store.commit("updateG", { nodes, links });
      });
      // console.log(this.$parent.$parent);
      // this.$refs.Main.$emit("add", nodes, links);
      // console.log(1, this.nodes);
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
.g {
  position: relative;
  height: calc(100% - 3em);
}
.sub-select-button {
  position: absolute;
  left: 5px;
  top: 5px;
}
.sub-select-index {
  position: absolute;
  right: 8px;
  top: 5px;
  color: var(--contrastColor);
}
</style>