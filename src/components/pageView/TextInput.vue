<template>
  <div class="container test-border">
    <!-- <span class="text"> -->
    <a-popover
      class="text"
      v-for="word in words"
      :mouseEnterDelay="0.3"
      :key="word.topic + word.text"
    >
      <template slot="content">
        <p>topic: {{ word.topic }}</p>
        <p>prob: {{ word.prob }}</p>
      </template>
      <a-tag
        class="tag"
        :class="{ tagSelected: word.selected }"
        :color="classificationPalette[word.topic]"
        @click="word.selected = !word.selected"
        :style="{ opacity: prob2opacity(word) }"
      >
        {{ word.text }}
      </a-tag>
    </a-popover>
    <!-- </span> -->
  </div>
</template>
<script>
// import Vue from "vue";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";
import { mapState, mapGetters } from "vuex";
import textdict from "@/assets/textdict.json";
import axios from "axios";

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
    // console.log(this.words);
    this.change(10, 10);
  },
  methods: {
    prob2opacity(word) {
      const { prob } = word;
      const c = 0.2;
      const a = -27;
      const b = 1 - c - a;
      return (a * prob + b) * prob + c;
    },
    formmatWords(texts) {
      const words = [];
      for (let i = 0; i < texts.length; i++) {
        for (let j = 0; j < texts[i].length; j++) {
          // console.log(i,j,texts[i][j]);
          const [text, prob] = texts[i][j];
          words.push({
            topic: i,
            text: textdict[text].join(";"),
            prob: prob,
            selected: false,
          });
        }
      }
      return words;
    },
    change(n_topics, n_top_words) {
      axios({
        method: "post",
        // url: "//127.0.0.1:3000/p/cluster",
        url: "//127.0.0.1:5000/topics",
        data: {
          n_topics: n_topics,
          n_top_words: n_top_words,
        },
      }).then((res) => {
        const { data } = res;
        const texts = JSON.parse(data.data);
        this.words = this.formmatWords(texts);
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.container {
  width: 100%;
  height: 564px;
  // position: absolute;
  // top: 0;
  // left: 500px;
  padding: 5px;
  overflow-y: scroll;

  // display: flex;
  // flex-wrap: wrap;
  // align-items: baseline;
}
.text {
  margin-bottom: 7px;
  cursor: pointer;
  // display: inline;
}
.tagSelected {
  border: 4px solid red;
}
</style>