import Vue from 'vue'
import App from './App.vue'
// import Antd from 'ant-design-vue'
import "ant-design-vue/dist/antd.css";

import {
  Icon,
  Button,
  Layout,
  Menu,
  Switch,
  Tabs
} from 'ant-design-vue'

import store from './store'

// Vue.use(Antd);
Vue.use(Icon);
Vue.use(Button);
Vue.use(Layout);
Vue.use(Menu);
Vue.use(Switch);
Vue.use(Tabs);

Vue.config.productionTip = false;

new Vue({
  store,
  render: h => h(App)
}).$mount('#app');