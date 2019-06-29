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
} from 'ant-design-vue'

// Vue.use(Antd);
Vue.use(Icon);
Vue.use(Button);
Vue.use(Layout);
Vue.use(Menu);
Vue.use(Switch);

Vue.config.productionTip = false;

new Vue({
  render: h => h(App),
}).$mount('#app');