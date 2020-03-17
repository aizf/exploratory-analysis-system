import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const PageData = () => import("@/components/PageData.vue");
const PageView = () => import('@/components/PageView.vue')
const PageAnalyze = () => import('@/components/PageAnalyze.vue')
const About = () => import('@/views/About.vue')

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/Data'
    },
    {
      path: '/Data',
      name: 'Data',
      component: PageData
    },
    {
      path: '/View',
      name: 'View',
      component: PageView
    },
    {
      path: '/Analyze',
      name: 'Analyze',
      component: PageAnalyze
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: About
    }
  ]
})
