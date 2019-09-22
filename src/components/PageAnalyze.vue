<template>
  <div>
    <TimeOrder></TimeOrder>
  </div>
</template>

<script>
import * as d3 from "d3";
import TimeOrder from "./pageAnalyze/TimeOrder.vue";

export default {
  name: "PageAnalyze",
  components:{
    TimeOrder
  },
  data() {
    return {
      chart: {}
    };
  },
  computed: {
    visualData() {
      return this.$store.state.visualData;
    },
    nodes() {
      return this.$store.getters.nodes;
    },
    links() {
      return this.$store.getters.links;
    },
    backgroundColor() {
      return this.$store.state.backgroundColor;
    },
    colorPalette() {
      return this.$store.state.colorPalette;
    },
    operations() {
      return this.$store.state.operations;
    }
  },
  mounted() {
  },
  activated() {
  },
  methods: {}
};
</script>