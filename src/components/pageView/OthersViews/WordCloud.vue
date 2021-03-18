<template>
  <div class="con test-border"></div>
  <!-- <canvas class="con test-border"></canvas> -->
</template>
<script>
// import Vue from "vue";
import { RecycleScroller } from "vue-virtual-scroller";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";
import { mapState, mapGetters } from "vuex";
import WordCloud from "wordcloud";
import textInfo from "@/assets/text_info.json";
import textdict from "@/assets/textdict.json";
// import * as _ from "lodash";
export default {
  name: "WordCloud",
  components: {},
  inject: ["classificationPalette", "backgroundColor", "contrastColor"],
  props: {
    items: Array,
  },
  data() {
    return {
      nodes: [],
      links: [],
    };
  },
  computed: {},
  mounted() {
    const ids = this.items.map((d) => d.id);
    const wordCount = new Map();
    ids.forEach((id) => {
      const list = textInfo[id];
      for (let word of list) {
        if (wordCount.has(word)) {
          wordCount.set(word, wordCount.get(word) + 1);
        } else {
          wordCount.set(word, 1);
        }
      }
    });
    let list = [];
    const textDict = new Map(Object.entries(textdict));
    wordCount.forEach((val, key) => {
      // console.log(val, key, textDict.get(key));
      // console.log(textDict);
      const words = textDict.get(key);
      if (!words) return;
      // const str = words.join(";");
      const str = words[0];
      list.push([str, val]);
    });
    WordCloud(this.$el, {
      list: list,
      gridSize: 18,
      weightFactor: 3,
      fontFamily: "Average, Times, serif",
      color: function () {
        return ["#d0d0d0", "#e11", "#44f"][Math.floor(Math.random() * 3)];
      },
      backgroundColor: this.backgroundColor,
    });
  },
  methods: {},
};
</script>
<style>
.selected {
  stroke: red;
}
</style>
<style lang="scss" scoped>
.con {
  width: 1170px;
  height: 760px;
  // display: flex;
  // justify-content: center;
  // align-items: center;
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
}
</style>