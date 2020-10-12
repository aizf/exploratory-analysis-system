<template>
  <div class="FlowController" :style="{}">
    <a-checkbox
      class="checkbox"
      :checked="option.isCompressRecord"
      @change="changeOption($event, 'isCompressRecord')"
      >Compress
    </a-checkbox>
  </div>
</template>

<script>
import Vue from "vue";

import { Checkbox } from "ant-design-vue";
Vue.use(Checkbox);
import { backgroundColor, contrastColor } from "@/config/color";

export default {
  name: "FlowController",
  components: {},
  props: {
    recordFlow: Object,
    option: Object,
  },
  data() {
    return {};
  },
  computed: {},
  created() {
    this.contrastColor = contrastColor;
    this.backgroundColor = backgroundColor;
  },
  mounted() {},
  activated() {},
  methods: {
    changeOption(e, key) {
      this.$emit(
        "update:option",
        Object.assign({}, this.option, { [key]: e.target.checked })
      );
    },
  },
};
</script>
<style lang="scss" scoped>
.FlowController {
  display: flex;
  .checkbox {
    color: var(--contrastColor);
  }
}
</style>
