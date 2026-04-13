<script setup>
import { ref } from 'vue'
import { authStore } from '../store/auth.js'

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const emit = defineEmits(['login-success'])

const handleLogin = async () => {
  if (!username.value || !password.value) return
  
  try {
    await authStore.login(username.value, password.value)
    emit('login-success')
  } catch (error) {
    // Ошибка уже установлена в store
  }
}
</script>

<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <div class="auth-logo">🚍</div>
        <h1>ИС «Пассажирское автопредприятие»</h1>
        <p class="auth-subtitle">Вход в систему</p>
      </div>

      <form @submit.prevent="handleLogin" class="auth-form">
        <div v-if="authStore.state.error" class="error-message">
          {{ authStore.state.error }}
        </div>

        <div class="form-group">
          <label for="username">Имя пользователя</label>
          <div class="input-wrapper">
            <span class="input-icon">👤</span>
            <input
              id="username"
              v-model="username"
              type="text"
              placeholder="Введите имя пользователя"
              autocomplete="username"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label for="password">Пароль</label>
          <div class="input-wrapper">
            <span class="input-icon">🔒</span>
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Введите пароль"
              autocomplete="current-password"
              required
            />
            <button
              type="button"
              class="toggle-password"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
        </div>

        <button
          type="submit"
          class="btn-login"
          :disabled="authStore.state.loading"
        >
          <span v-if="authStore.state.loading" class="spinner"></span>
          {{ authStore.state.loading ? 'Вход...' : 'Войти' }}
        </button>

        <div class="demo-credentials">
          <p><strong>Демо-доступ:</strong></p>
          <p>Логин: <code>admin</code> | Пароль: <code>admin123</code></p>
        </div>
      </form>
    </div>

    <footer class="auth-footer">
      <p>© 2026 ИС «Пассажирское автопредприятие» | Лабораторная работа 4.3</p>
    </footer>
  </div>
</template>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.auth-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  padding: 3rem 2.5rem;
  width: 100%;
  max-width: 420px;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-logo {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.auth-header h1 {
  color: #2c3e50;
  font-size: 1.5rem;
  margin: 0 0 0.5rem 0;
}

.auth-subtitle {
  color: #777;
  margin: 0;
  font-size: 1rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.error-message {
  background: #fee;
  color: #c0392b;
  padding: 0.75rem;
  border-radius: 8px;
  border-left: 4px solid #e74c3c;
  font-size: 0.9rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #555;
  font-size: 0.9rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 12px;
  font-size: 1.1rem;
}

.input-wrapper input {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 2.5rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.input-wrapper input:focus {
  outline: none;
  border-color: #667eea;
}

.toggle-password {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0;
}

.btn-login {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.9rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-login:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.demo-credentials {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  font-size: 0.85rem;
}

.demo-credentials p {
  margin: 0.25rem 0;
  color: #555;
}

.demo-credentials code {
  background: #e9ecef;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-family: monospace;
}

.auth-footer {
  color: white;
  text-align: center;
  padding: 1rem;
  font-size: 0.85rem;
  opacity: 0.9;
}

.auth-footer p {
  margin: 0;
}

@media (max-width: 480px) {
  .auth-card {
    padding: 2rem 1.5rem;
  }

  .auth-header h1 {
    font-size: 1.2rem;
  }

  .auth-logo {
    font-size: 3rem;
  }
}
</style>
