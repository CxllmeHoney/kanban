<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <img src="/kanban-logo.png" alt="Logo" class="auth-logo" />
        <h1>Kanban Board</h1>
      </div>

      <!-- Tab Selection -->
      <div class="auth-tabs">
        <button :class="['tab-btn', { active: isLogin }]" @click="isLogin = true">Login</button>
        <button :class="['tab-btn', { active: !isLogin }]" @click="isLogin = false">
          Register
        </button>
      </div>

      <!-- Login Form -->
      <form v-if="isLogin" @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label for="username">Username</label>
          <div class="input-group">
            <i class="fas fa-user"></i>
            <input
              id="username"
              v-model="form.username"
              type="text"
              placeholder="Enter your username"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <div class="input-group">
            <i class="fas fa-lock"></i>
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Enter your password"
              required
            />
            <i
              :class="['fas', showPassword ? 'fa-eye-slash' : 'fa-eye', 'password-toggle']"
              @click="showPassword = !showPassword"
            ></i>
          </div>
        </div>

        <button type="submit" class="submit-btn">
          <span>Login</span>
          <i class="fas fa-arrow-right"></i>
        </button>
      </form>

      <!-- Register Form -->
      <form v-else @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label for="reg-username">Username</label>
          <div class="input-group">
            <i class="fas fa-user"></i>
            <input
              id="reg-username"
              v-model="form.username"
              type="text"
              placeholder="Choose a username"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <div class="input-group">
            <i class="fas fa-envelope"></i>
            <input
              id="email"
              v-model="form.email"
              type="email"
              placeholder="Enter your email"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label for="reg-password">Password</label>
          <div class="input-group">
            <i class="fas fa-lock"></i>
            <input
              id="reg-password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Choose a password"
              required
            />
            <i
              :class="['fas', showPassword ? 'fa-eye-slash' : 'fa-eye', 'password-toggle']"
              @click="showPassword = !showPassword"
            ></i>
          </div>
        </div>

        <button type="submit" class="submit-btn">
          <span>Create Account</span>
          <i class="fas fa-arrow-right"></i>
        </button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isLogin: true,
      showPassword: false,
      form: {
        username: '',
        password: '',
        email: '',
      },
    }
  },
  methods: {
    async handleLogin() {
      try {
        const success = await this.$store.dispatch('login', this.form)
        if (success) {
          this.$router.push('/boards')
        } else {
          this.showError('Invalid credentials')
        }
      } catch (error) {
        this.showError('Login failed')
      }
    },
    async handleRegister() {
      try {
        await this.$store.dispatch('register', this.form)
        this.$router.push('/boards')
      } catch (error) {
        this.showError('Registration failed')
      }
    },
    showError(message) {
      // สามารถเพิ่ม toast notification library ได้ในอนาคต
      alert(message)
    },
  },
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.auth-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-logo {
  width: 80px;
  height: 80px;
  margin-bottom: 1rem;
}

.auth-header h1 {
  color: #2d3748;
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
}

.auth-tabs {
  display: flex;
  margin-bottom: 2rem;
  background: #f7fafc;
  border-radius: 12px;
  padding: 0.5rem;
  gap: 0.5rem;
}

.tab-btn {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #4a5568;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn.active {
  background: white;
  color: #4c51bf;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: #4a5568;
  font-size: 0.875rem;
  font-weight: 500;
}

.input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.input-group i {
  position: absolute;
  left: 1rem;
  color: #a0aec0;
}

.input-group input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.input-group input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  outline: none;
}

.password-toggle {
  position: absolute !important;
  right: 1rem !important;
  left: auto !important;
  cursor: pointer;
}

.submit-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.875rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.submit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.submit-btn:active {
  transform: translateY(0);
}

/* Animation classes */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.auth-form {
  animation: fadeIn 0.3s ease-out;
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .auth-card {
    padding: 1.5rem;
  }

  .auth-header h1 {
    font-size: 1.5rem;
  }
}
</style>
