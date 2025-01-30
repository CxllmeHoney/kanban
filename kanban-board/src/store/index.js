import { createStore } from 'vuex'

const mockUsers = [
  { id: 1, username: 'user1', password: 'pass1', email: 'user1@example.com' },
  { id: 2, username: 'user2', password: 'pass2', email: 'user2@example.com' },
]

export default createStore({
  state: {
    currentUser: null,
    users: mockUsers,
    boards: [],
    notifications: [],
  },
  mutations: {
    setCurrentUser(state, user) {
      state.currentUser = user
    },
    addBoard(state, board) {
      state.boards.push(board)
    },
    updateBoard(state, { id, name }) {
      const board = state.boards.find(b => b.id === id)
      if (board) board.name = name
    },
    deleteBoard(state, boardId) {
      state.boards = state.boards.filter(b => b.id !== boardId)
    },
    addNotification(state, notification) {
      state.notifications.push(notification)
    },
  },
  actions: {
    login({ commit }, credentials) {
      const user = mockUsers.find(
        u => u.username === credentials.username && u.password === credentials.password
      )
      if (user) {
        commit('setCurrentUser', user)
        return true
      }
      return false
    },
    register({ state, commit }, userData) {
      const newUser = {
        id: state.users.length + 1,
        ...userData
      }
      state.users.push(newUser)
      commit('setCurrentUser', newUser)
    },
    createBoard({ commit }, boardData) {
      commit('addBoard', {
        id: Date.now(),
        ...boardData,
        columns: [],
        members: []
      })
    },
  }
})