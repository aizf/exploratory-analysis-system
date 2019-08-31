import Vue from 'vue'
import App from './App.vue'

// import Antd from 'ant-design-vue'
import "ant-design-vue/dist/antd.css";
import {
  Button,
  Col,
  Icon,
  Input,
  InputNumber,
  Layout,
  Menu,
  Row,
  Slider,
  Switch,
  Tabs
} from 'ant-design-vue'

import store from './store'

// Vue.use(Antd);
Vue.use(Button);
Vue.use(Col);
Vue.use(Icon);
Vue.use(Input);
Vue.use(InputNumber);
Vue.use(Layout);
Vue.use(Menu);
Vue.use(Row);
Vue.use(Slider);
Vue.use(Switch);
Vue.use(Tabs);

Vue.config.productionTip = false;

new Vue({
  store,
  render: h => h(App)
}).$mount('#app');