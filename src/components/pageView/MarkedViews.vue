<template>
  <div class="MarkedViews">
    <a-card>
      <a-card-grid v-for="d in markedData" :key="d.uuid">
        <StaticForce
          :width="width"
          :height="height-optionsHeight"
          :nodes="d.data.nodes"
          :links="d.data.links"
        ></StaticForce>
        <a-row>
          <a-col :span="6" :offset="8">
            <a-button :disabled="d.uuid==='current'" @click="rollback(d)">rollback</a-button>
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
      marked: state => state.view.marked,

      recordset: state => state.analyze.recordset,
      recordData: state => state.analyze.recordData
    }),
    ...mapGetters(["savedViewData", "generateUUID"]),

    markedData() {
      let data = this.recordset.filter(d => d.marked);
      return this.marked
        ? [
            ...data,
            this.recordData({
              data: this.visualData,
              uuid: "current",
              marked: true
            })
          ]
        : data;
    }
  },
  methods: {
    rollback(d) {
      let args = {
        data: this.visualData,
        uuid: this.currentUUID,
        operation: "rollback",
        time: new Date(),
        marked: this.marked
      };
      this.$store.commit("addRecordData", args);
      this.$store.commit("updateVisualData", d.data);
      this.$store.commit("updateParentUUID", this.currentUUID);
      this.$store.commit("updateCurrentUUID", d.uuid);
      console.log("rollback");
    },
    deleteMarked(d) {
      if (d.uuid === "current") {
        this.$store.commit("changeMarked", false);
      } else {
        d.marked = false;
      }
    }
  }
};
</script>
<style>
.MarkedViews .ant-card-grid {
  width: 100%;
  height: 400px;
  padding: 10px 10px 10px 10px;
}
</style>
<style>
</style>