import Vue from 'vue'
import App from './App.vue'
import axios from 'axios';
import Amark from 'amark'
import Antd from 'ant-design-vue'

// Vue.prototype.$message = message;
Vue.prototype.$axios = axios;
Vue.prototype.$amark = new Amark({
  url:"http://localhost:3000/n/interactive-data"
});

import store from '@/store/'
import router from '@/router/'

Vue.use(Antd);

Vue.config.productionTip = false;

new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app');