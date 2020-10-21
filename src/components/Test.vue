<template></template>

<script>
import { mapState, mapGetters } from "vuex";
export default {
  name: "",
  props: {},
  data() {
    return {};
  },
  computed: {
    ...mapState({
      visualData: (state) => state.data.visualData,
    }),
    ...mapGetters(["nodesNumber", "beforeEvent"]),
  },
  created() {},
  mounted() {
    console.log("", this);
  },
  methods: {},
  watch: {},
};
</script>
<style lang="scss" scope>
</style>