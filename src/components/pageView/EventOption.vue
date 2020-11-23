<template>
  <a-card
    title="Oprations"
    :headStyle="{ padding: '0 24px 0 24px' }"
    :bodyStyle="{ padding: '5px 20px 5px 15px' }"
  >
    <a-row>
      <a-col :span="12" offset="1">
        <span class="vSubMenu">click</span>
      </a-col>
      <a-col :span="4" offset="2">
        <a-switch v-model="eventOption.visClick" :disabled="clickDisabled" />
      </a-col>
    </a-row>
    <a-row>
      <a-col :span="12" offset="1">
        <span class="vSubMenu">drag</span>
      </a-col>
      <a-col :span="4" offset="2">
        <a-switch v-model="eventOption.visDrag" :disabled="dragDisabled" />
      </a-col>
    </a-row>
    <a-row>
      <a-col :span="12" offset="1">
        <span class="vSubMenu">hover</span>
      </a-col>
      <a-col :span="4" offset="2">
        <a-switch
          v-model="eventOption.visMouseover"
          :disabled="mouseoverDisabled"
        />
      </a-col>
    </a-row>
    <a-row>
      <a-col :span="12" offset="1">
        <a-popover
          placement="top"
          title="keep last selected nodes ?"
          :mouseEnterDelay="0.4"
        >
          <template slot="content">
            no
            <a-switch v-model="eventOption.brushKeep" />
            yes
          </template>
          <span class="vSubMenu">brush</span>
        </a-popover>
      </a-col>
      <a-col :span="4" offset="2">
        <a-switch
          v-model="eventOption.visBrush"
          @change="$emit('vis-brush', 'switch')"
          :disabled="brushDisabled"
        />
      </a-col>
    </a-row>
    <!-- <a-row>
      <a-col :span="12" offset="1">
        <span class="vSubMenu">invert brush</span>
      </a-col>
      <a-col :span="4" offset="2">
        <a-switch
          v-model="eventOption.visInvertBrush"
          @change="$emit('vis-invert-brush','switch')"
          :disabled="invertBrushDisabled"
        />
      </a-col>
    </a-row> -->
    <a-row>
      <a-col :span="12" offset="1">
        <span class="vSubMenu">zoom</span>
      </a-col>
      <a-col :span="4" offset="2">
        <a-switch v-model="eventOption.visZoom" :disabled="zoomDisabled" />
      </a-col>
    </a-row>
  </a-card>
</template>

<script>
import { mapState, mapGetters } from "vuex";
export default {
  name: "EventOption",
  props: {
    eventOption: Object,
  },
  data() {
    return {
      // switch disabled
      saveDisabled: false,
      clickDisabled: false,
      dragDisabled: false,
      mouseoverDisabled: false,
      brushDisabled: false,
      invertBrushDisabled: false,
      zoomDisabled: false,
    };
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
    // ChartOption触发
    this.$parent.$on("changeDisabledState", this.changeDisabledState);
    document.addEventListener("keydown", (e) => {
      if (e && e.ctrlKey === true) {
        // 按 ctrl
        // console.log(e);
        // e.preventDefault();
        // e.stopPropagation();
        this.eventOption.visZoom = !this.eventOption.visZoom;
      }
    });
    // document.addEventListener("keyup", (e) => {
    //   if (e && e.keyCode === 17) {
    //     // 松 ctrl
    //     e.stopPropagation();
    //     this.eventOption.visZoom = false;
    //   }
    // });
  },
  methods: {
    // 改变开关的禁用状态
    changeDisabledState({
      // true !!!!!
      save = true,

      click = false,
      drag = false,
      mouseover = false,
      brush = false,
      invertBrush = false,
      zoom = false,
      showIds = false,
    } = {}) {
      this.clickDisabled = click;
      this.dragDisabled = drag;
      this.mouseoverDisabled = mouseover;
      this.brushDisabled = brush;
      this.invertBrushDisabled = invertBrush;
      this.zoomDisabled = zoom;
    },
  },
  watch: {},
};
</script>
<style lang="scss" scope>
</style>