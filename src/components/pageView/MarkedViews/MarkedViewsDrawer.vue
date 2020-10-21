<template>
  <div class="MarkedViews">
    <a-card>
      <a-card-grid v-for="(d, i) in markedVisualData" :key="d.uuid">
        <StaticForce
          :width="width"
          :height="height - optionsHeight"
          :nodes="d.nodes"
          :links="d.links"
        ></StaticForce>
        <a-row>
          <a-col :span="3" style="vertical-align: middle">
            <p>uuid: {{ i }}</p>
          </a-col>
          <a-col :span="6" :offset="5">
            <a-button :disabled="i === currentUUID" @click="rollback(i)"
              >rollback</a-button
            >
          </a-col>
          <a-col :span="6" :offset="0">
            <a-button type="danger" @click="deleteMarked(d)">delete</a-button>
          </a-col>
        </a-row>
      </a-card-grid>
    </a-card>
  </div>
</template>
<script>
import Vue from "vue";
import { Button, Card, Col, Row } from "ant-design-vue";
Vue.use(Button);
Vue.use(Card);
Vue.use(Col);
Vue.use(Row);
import { mapState, mapGetters } from "vuex";
import StaticForce from "@/components/commonUse/StaticForce.vue";

export default {
  name: "MarkedViewsDrawer",
  components: {
    StaticForce,
  },
  props: {
    markedVisualData: Object,
  },
  data() {
    return {
      width: 634,
      height: 380,
      optionsHeight: 30,
    };
  },
  computed: {
    ...mapState({
      currentUUID: (state) => state.view.currentUUID,
    }),
    ...mapGetters(["beforeEvent"]),
  },
  methods: {
    rollback(i) {
      this.beforeEvent("rollback", this, i);
      console.log("rollback");
    },
    deleteMarked(d) {
      d.marked = false;
    },
  },
};
</script>
<style scope>
.MarkedViews .ant-card-grid {
  width: 100%;
  height: 400px;
  padding: 10px 10px 0px 10px;
}
</style>
<style>
</style>