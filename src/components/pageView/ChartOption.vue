<template>
  <a-card
    title="Chart Option"
    :headStyle="{ padding: '0 24px 0 24px' }"
    :bodyStyle="{ padding: '5px 10px 5px 10px' }"
  >
    <!-- <a-icon type="area-chart" /> -->
    <a-tabs
      tabPosition="left"
      :activeKey="currentChartKey"
      @change="changeChart"
    >
      <a-tab-pane key="force">
        <span slot="tab"> <a-icon type="deployment-unit" />force </span>
        <div class="chartOption">
          <span class="vSubTitle">simulation</span>
          <div class="vMenu">
            <span class="vSubMenu">run</span>
            <a-switch
              v-model="chartOption.simulation.run"
              style="margin-left: 40%"
            />
            <span class="vSubMenu">alphaTarget</span>
            <a-input-number
              class="optionInput"
              :min="0"
              :max="1"
              :step="0.1"
              v-model="chartOption.simulation.alphaTarget"
            />
          </div>
          <span class="vSubTitle">node</span>
          <div>
            <span class="vSubMenu">size</span>
            <a-input-number
              class="optionInput"
              :min="0.1"
              :max="70"
              :step="0.2"
              v-model="chartOption.node.nodeSize"
            />
            <span class="vSubMenu">border color</span>
            <a-input
              class="optionInput"
              :value="chartOption.node.borderColor"
            />
            <span class="vSubMenu">charge force</span>
            <a-input-number
              class="optionInput"
              :min="-70"
              :max="70"
              :step="5"
              v-model="chartOption.node.chargeForce"
            />
          </div>
          <span class="vSubTitle">link</span>
          <div>
            <span class="vSubMenu">color</span>
            <a-input class="optionInput" v-model="chartOption.link.color" />
            <span class="vSubMenu">width</span>
            <a-input-number
              class="optionInput"
              :min="0"
              :max="10"
              :step="0.1"
              v-model="chartOption.link.width"
            />
            <span class="vSubMenu">distance</span>
            <a-input-number
              class="optionInput"
              :min="0"
              :max="200"
              :step="1"
              v-model="chartOption.link.distance"
            />
            <span class="vSubMenu">opacity</span>
            <a-input-number
              class="optionInput"
              :min="0"
              :max="1"
              :step="0.1"
              v-model="chartOption.link.opacity"
            />
          </div>
        </div>
      </a-tab-pane>
      <a-tab-pane key="scatter">
        <span slot="tab"> <a-icon type="dot-chart" />scatter </span>
      </a-tab-pane>
      <a-tab-pane key="table">
        <span slot="tab"> <a-icon type="table" />table </span>
      </a-tab-pane>
    </a-tabs>
  </a-card>
</template>

<script>
export default {
  name: "ChartOption",
  props: {
    chartOption: Object,
  },
  data() {
    return {
      currentChartKey: "force",
    };
  },
  computed: {},
  created() {},
  mounted() {
    console.log("", this);
  },
  methods: {
    changeChart(key) {
      if (this.currentChartKey === key) return;
      this.currentChartKey = key;
      this.currentChart();
    },
    currentChart() {
      let chart;
      switch (this.currentChartKey) {
        case "scatter":
          this.$parent.$emit("changeDisabledState", { drag: true });
          chart = "ScatterChart";
          break;
        case "force":
          this.$parent.$emit("changeDisabledState", { save: false });
          chart = "ForceChart";
          break;
        case "table":
          this.$parent.$emit("changeDisabledState", {
            click: true,
            drag: true,
            mouseover: true,
            brush: true,
            invertBrush: true,
            zoom: true,
            showIds: true,
          });
          chart = "NodesTable";
          break;
        default:
          this.$parent.$emit("changeDisabledState");
          break;
      }
      this.$emit("changeCurrentChart", chart);
    },
  },
  watch: {},
};
</script>
