import Vue from 'vue'
import App from './App.vue'

// import Antd from 'ant-design-vue'
import "ant-design-vue/dist/antd.css";
import {
  Button,
  Card,
  Checkbox,
  Col,
  Drawer,
  Icon,
  Input,
  InputNumber,
  Layout,
  message,
  Menu,
  Popover,
  Row,
  Select,
  Slider,
  Switch,
  Table,
  Tabs,
  Tag,
  Tooltip
} from 'ant-design-vue'

import store from './store'

Vue.prototype.$message = message;

// TODO: Vue.use(Antd);
Vue.use(Button);
Vue.use(Card);
Vue.use(Checkbox);
Vue.use(Col);
Vue.use(Drawer);
Vue.use(Icon);
Vue.use(Input);
Vue.use(InputNumber);
Vue.use(Layout);
Vue.use(Menu);
Vue.use(Popover);
Vue.use(Row);
Vue.use(Select);
Vue.use(Slider);
Vue.use(Switch);
Vue.use(Table);
Vue.use(Tabs);
Vue.use(Tag);
Vue.use(Tooltip);

Vue.config.productionTip = false;

new Vue({
  store,
  render: h => h(App)
}).$mount('#app');