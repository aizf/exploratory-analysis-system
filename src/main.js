import Vue from 'vue'
import App from './App.vue'
import axios from 'axios';
// import Antd from 'ant-design-vue'
import {
  // Badge,
  // Button,
  // Card,
  // Checkbox,
  // Col,
  // Drawer,
  // Dropdown,
  // Icon,
  // Input,
  // InputNumber,
  // Layout,
  message,
  // Menu,
  // Popover,
  // Row,
  // Select,
  // Slider,
  // Switch,
  // Table,
  // Tabs,
  // Tag,
  // Tooltip
} from 'ant-design-vue'

import store from '@/store/'
import router from '@/router/'

Vue.prototype.$message = message;
Vue.prototype.$axios = axios;

// TODO: Vue.use(Antd);
// Vue.use(Badge);
// Vue.use(Button);
// Vue.use(Card);
// Vue.use(Checkbox);
// Vue.use(Col);
// Vue.use(Drawer);
// Vue.use(Dropdown);
// Vue.use(Icon);
// Vue.use(Input);
// Vue.use(InputNumber);
// Vue.use(Layout);
// Vue.use(Menu);
// Vue.use(Popover);
// Vue.use(Row);
// Vue.use(Select);
// Vue.use(Slider);
// Vue.use(Switch);
// Vue.use(Table);
// Vue.use(Tabs);
// Vue.use(Tag);
// Vue.use(Tooltip);

Vue.config.productionTip = false;

new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app');