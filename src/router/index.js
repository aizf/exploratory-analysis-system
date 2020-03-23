import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const PageData = () => import("@/components/PageData.vue");
const PageView = () => import('@/components/PageView.vue')
const PageAnalyze = () => import('@/components/PageAnalyze.vue')
const About = () => import('@/views/About.vue')

const routes = [
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
    component: About
  }
]

const router = new Router({
  routes
})

export default router
