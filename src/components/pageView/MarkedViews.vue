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
import store from "@/store/";
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

      uuids: state => state.analyze.uuids,
      recordset: state => state.analyze.recordset,
      recordData: state => state.analyze.recordData
    }),
    ...mapGetters([
      "savedViewData",
      "generateUUID",
      "uniqueViews",
      "markedVisualData"
    ])
  },
  methods: {
    rollback(d) {
      const args = {
        data: this.visualData,
        deepClone: !this.existingViews.has(this.currentUUID),
        uuid: this.currentUUID,
        operation: "rollback",
        time: new Date()
      };
      this.$store.commit("addRecordData", args);
      this.$store.commit("updateVisualData", d);
      this.$store.commit("updateParentUUID", this.currentUUID);
      this.$store.commit("updateCurrentUUID", d.uuid);
      console.log("rollback");
    },
    deleteMarked(d) {
      d.marked = false;
    }
  }
};
</script>
<style>
.MarkedViews .ant-card-grid {
  width: 100%;
  height: 400px;
  padding: 10px 10px 0px 10px;
}
</style>
<style>
</style>