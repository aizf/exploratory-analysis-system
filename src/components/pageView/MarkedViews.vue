<template>
  <div class="MarkedViews">
    <a-card>
      <a-card-grid v-for="d in markedVisualData" :key="d.uuid">
        <StaticForce
          :width="width"
          :height="height-optionsHeight"
          :nodes="d.nodes"
          :links="d.links"
        ></StaticForce>
        <a-row>
          <a-col :span="3" style="vertical-align: middle;">
            <p>uuid: {{d.uuid}}</p>
          </a-col>
          <a-col :span="6" :offset="5">
            <a-button :disabled="d.uuid===currentUUID" @click="rollback(d)">rollback</a-button>
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
import Vue from 'vue'
import {Button,Card,Col,Row} from 'ant-design-vue'
Vue.use(Button);
Vue.use(Card);
Vue.use(Col);
Vue.use(Row);
import { mapState, mapGetters } from "vuex";
import StaticForce from "@/components/commonUse/StaticForce.vue";

export default {
  name: "MarkedViews",
  components: {
    StaticForce
  },
  data() {
    return {
      width: 634,
      height: 380,
      optionsHeight: 30
    };
  },
  computed: {
    ...mapState({
      visualData: state => state.data.visualData,

      currentUUID: state => state.view.currentUUID,

      recordset: state => state.analyze.recordset,
    }),
    ...mapGetters([
      "savedViewData",
      "markedVisualData",
      "beforeEvent"
    ])
  },
  methods: {
    rollback(d) {
      this.beforeEvent("rollback", this, d);
      console.log("rollback");
    },
    deleteMarked(d) {
      d.marked = false;
    }
  }
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