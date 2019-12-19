<template>
  <div>
    <button v-on:click="$emit('welcome')">Click me to be welcomed</button>
  </div>
</template>
<script>
import store from "@/store/";
import { mapState, mapGetters } from "vuex";
import * as d3 from "d3";

export default {
  name: "Test",
  data() {
    return {
      testData: 1
    };
  },
  computed: {
    ...mapState({}),
    ...mapGetters([])
  },
  mounted() {
    const pie = d3
      .pie()
      .sort(null)
      .value(d => d.value);
  },
  methods: {
    testFn() {}
  }
};
</script>
