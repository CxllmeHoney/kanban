<template>
  <div id="app">
    <header v-if="currentUser">
      <nav>
        <router-link to="/boards">Boards</router-link>
        <div class="user-info">
          {{ currentUser.username }}
          <button @click="logout">Logout</button>
        </div>
      </nav>
      
      <!-- Notifications -->
      <div class="notifications">
        <div v-for="notification in userNotifications" :key="notification.id" class="notification">
          {{ notification.message }}
        </div>
      </div>
    </header>
    
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  computed: {
    currentUser() {
      return this.$store.state.currentUser
    },
    userNotifications() {
      return this.$store.state.notifications.filter(
        n => n.userId === this.currentUser?.id
      )
    }
  },
  methods: {
    logout() {
      this.$store.commit('setCurrentUser', null)
      this.$router.push('/')
    }
  }
}
</script>

<style>
/* Global styles */
:root {
  --primary: #3498db;
  --primary-dark: #2980b9;
  --success: #2ecc71;
  --danger: #e74c3c;
  --warning: #f1c40f;
  --background: #f8fafc;
  --surface: #ffffff;
  --text: #2d3436;
}

body {
  margin: 0;
  background: var(--background);
  color: var(--text);
}

#app {
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
}

/* Modern Header */
header {
  background: linear-gradient(135deg, #2c3e50, #3498db);
  color: white;
  padding: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

nav a {
  color: white;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

nav a:hover {
  background: rgba(255, 255, 255, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Modern Notifications */
.notifications {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
}

.notification {
  background: var(--primary);
  color: white;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform-origin: right;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  0% {
    transform: translateX(100%) scale(0.8);
    opacity: 0;
  }
  100% {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
}

/* Modern Buttons */
button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  background: var(--primary);
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

button:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

button:active {
  transform: translateY(0);
}

/* Modern Inputs */
input {
  padding: 0.5rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
}

input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}
</style>