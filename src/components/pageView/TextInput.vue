<template>
  <div class="container test-border">
    <a-tag
      class="text"
      :class="{ tagSelected: word.selected }"
      v-for="word in words"
      :color="classificationPalette[word.topic]"
      :key="word.text"
      @click="word.selected = !word.selected"
    >
      {{ word.text }}
    </a-tag>
  </div>
</template>
<script>
// import Vue from "vue";
import { RecycleScroller } from "vue-virtual-scroller";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";
import { mapState, mapGetters } from "vuex";
import texts from "@/assets/text.json";
import textdict from "@/assets/textdict.json";
// import * as _ from "lodash";
export default {
  name: "TextInput",
  components: {},
  inject: ["classificationPalette"],
  props: {},
  data() {
    return {
      words: [],
    };
  },
  computed: {},
  mounted() {
    const words = [];
    for (let i = 0; i < texts.length; i++) {
      for (let j = 0; j < texts[i].length; j++) {
        // console.log(i,j,texts[i][j]);
        words.push({
          topic: i,
          text: textdict[texts[i][j]].join(";"),
          prob: 1,
          selected: false,
        });
      }
    }
    this.words = words;
    // console.log(this.words);
  },
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
  padding: 5px;
  overflow-y: scroll;

  // display: flex;
  // flex-wrap: wrap;
  // align-items: baseline;
}
.text {
  margin-bottom: 20px;
}
.tagSelected {
  border: 4px solid red;
}
</style>