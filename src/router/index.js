import Vue from 'vue'
import VueRouter from 'vue-router'
import LabReport from '@/components/LabReport'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'LabReport',
    component: LabReport
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
