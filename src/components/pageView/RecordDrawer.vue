<template>
  <a-card title="Card Title" class="record">
    <a-card-grid v-for="i in [1,2,3,4,5,6]" :key="i">{{i}}</a-card-grid>
  </a-card>
</template>
<script>
import * as d3 from "d3";

export default {
  name: "RecordDrawer",
  data() {
    return {};
  },
  computed: {},
  methods: {
    test() {
      console.log("c");
    }
  }
};
</script>
<style>
.record .ant-card-grid {
  width: 100%;
  height: 400px;
}
</style>
<style>
</style>