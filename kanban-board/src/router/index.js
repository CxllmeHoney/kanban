import { createRouter, createWebHistory } from 'vue-router'
import LoginRegister from '../components/LoginRegister.vue'
import BoardList from '../components/BoardList.vue'
import KanbanBoard from '../components/KanbanBoard.vue'
import store from '../store'

const routes = [
  {
    path: '/',
    name: 'login',
    component: LoginRegister
  },
  {
    path: '/boards',
    name: 'boards',
    component: BoardList,
    meta: { requiresAuth: true }
  },
  {
    path: '/board/:id',
    name: 'board',
    component: KanbanBoard,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !store.state.currentUser) {
    next('/')
  } else {
    next()
  }
})

export default router