import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from './components/LoginPage.vue'
import AdminDashboard from './components/AdminDashboard.vue'
import CustomerDashboard from './components/CustomerDashboard.vue'
import EmployeeRegister from './components/EmployeeRegister.vue'
import AdminRegister from './components/AdminRegister.vue'
import EmployeeDashboard from './components/EmployeeDashboard.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: LoginPage
  },
  {
    path: '/register/employee',
    name: 'EmployeeRegister',
    component: EmployeeRegister
  },
  {
    path: '/register/admin',
    name: 'AdminRegister',
    component: AdminRegister
  },
  {
    path: '/admin-dashboard',
    name: 'AdminDashboard',
    component: AdminDashboard
  },
  {
    path: '/employee-dashboard',
    name: 'EmployeeDashboard',
    component: EmployeeDashboard
  },
  {
    path: '/customer-dashboard',
    name: 'CustomerDashboard',
    component: CustomerDashboard
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
