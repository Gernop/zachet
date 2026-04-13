<script setup>
import { ref, computed } from 'vue'
import { authStore } from './store/auth.js'
import Auth from './components/Auth.vue'
import AdminPanel from './components/AdminPanel.vue'
import PassengerPanel from './components/PassengerPanel.vue'
import BusList from './components/BusList.vue'
import DriverList from './components/DriverList.vue'
import RouteList from './components/RouteList.vue'
import TripList from './components/TripList.vue'
import Monitoring from './components/Monitoring.vue'

const showAdmin = ref(false)
const activeTab = ref('buses')

const tabs = [
  { id: 'buses', label: 'Автобусы', icon: '🚌' },
  { id: 'drivers', label: 'Водители', icon: '👨‍✈️' },
  { id: 'routes', label: 'Маршруты', icon: '🗺️' },
  { id: 'trips', label: 'Рейсы', icon: '🕐' },
  { id: 'monitoring', label: 'Мониторинг', icon: '📊' },
]

// Динамическая проверка роли пассажира
const isPassenger = computed(() => authStore.state.user?.role === 'Пассажир')

const handleLoginSuccess = () => {
  showAdmin.value = false
  activeTab.value = 'buses'
}

const handleBackToApp = () => {
  showAdmin.value = false
}

const handleLogout = () => {
  showAdmin.value = false
  activeTab.value = 'buses'
}
</script>

<template>
  <!-- Страница авторизации -->
  <Auth v-if="!authStore.state.isAuthenticated" @login-success="handleLoginSuccess" />

  <!-- Приложение после авторизации -->
  <div v-else class="app">
    <!-- Верхняя панель -->
    <header class="app-header">
      <div class="header-content">
        <div class="logo-section">
          <h1 class="app-title">🚍 ИС «Пассажирское автопредприятие»</h1>
          <p class="app-subtitle">
            {{ isPassenger ? 'Панель пассажира' : 'Система управления автобусным парком' }}
          </p>
        </div>
        <div class="header-actions">
          <!-- Кнопка админки только для сотрудников -->
          <button 
            v-if="!isPassenger && !showAdmin" 
            class="btn-admin" 
            @click="showAdmin = true"
          >
            ⚙️ Админ-панель
          </button>
          <button 
            v-if="showAdmin && !isPassenger" 
            class="btn-back" 
            @click="handleBackToApp"
          >
            ◀️ Назад
          </button>
          <div class="user-badge">
            <span class="user-role">{{ authStore.state.user?.role }}</span>
            <span class="user-name">{{ authStore.state.user?.name }}</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Навигация (только для сотрудников и не в админке) -->
    <nav v-if="!isPassenger && !showAdmin" class="app-nav">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="['nav-btn', { active: activeTab === tab.id }]"
      >
        <span class="nav-icon">{{ tab.icon }}</span>
        <span class="nav-label">{{ tab.label }}</span>
      </button>
    </nav>

    <!-- Основной контент -->
    <main class="app-main">
      <!-- Панель пассажира (только для роли Пассажир) -->
      <PassengerPanel v-if="isPassenger" @logout="handleLogout" />

      <!-- Админ-панель (только для сотрудников) -->
      <AdminPanel v-else-if="showAdmin" />

      <!-- Обычные страницы для сотрудников -->
      <template v-else>
        <BusList v-if="activeTab === 'buses'" />
        <DriverList v-else-if="activeTab === 'drivers'" />
        <RouteList v-else-if="activeTab === 'routes'" />
        <TripList v-else-if="activeTab === 'trips'" />
        <Monitoring v-else-if="activeTab === 'monitoring'" />
      </template>
    </main>

    <footer class="app-footer">
      <p>© 2026 ИС «Пассажирское автопредприятие» | Лабораторная работа 4.3</p>
    </footer>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.app-title {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
}

.app-subtitle {
  margin: 0.5rem 0 0 0;
  font-size: 0.9rem;
  opacity: 0.9;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-admin,
.btn-back {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.5);
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  white-space: nowrap;
}

.btn-admin:hover,
.btn-back:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: white;
  transform: translateY(-2px);
}

.user-badge {
  background: rgba(255, 255, 255, 0.15);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  text-align: right;
}

.user-role {
  display: block;
  font-size: 0.7rem;
  opacity: 0.8;
  text-transform: uppercase;
}

.user-name {
  font-weight: 600;
  font-size: 0.9rem;
}

.app-nav {
  background: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  color: #555;
  transition: all 0.3s;
}

.nav-btn:hover {
  background: #f5f5f5;
  border-color: #667eea;
  color: #667eea;
}

.nav-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
  color: white;
}

.nav-icon {
  font-size: 1.2rem;
}

.app-main {
  flex: 1;
  max-width: 1400px;
  width: 100%;
  margin: 2rem auto;
  padding: 0 2rem;
}

.app-footer {
  background: #34495e;
  color: white;
  text-align: center;
  padding: 1rem;
  margin-top: auto;
}

.app-footer p {
  margin: 0;
  font-size: 0.85rem;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .app-title {
    font-size: 1.4rem;
  }

  .header-actions {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }

  .user-badge {
    text-align: center;
  }

  .app-nav {
    padding: 0.75rem;
  }

  .nav-btn {
    flex: 1;
    justify-content: center;
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
  }

  .nav-label {
    display: none;
  }

  .app-main {
    margin: 1rem auto;
    padding: 0 1rem;
  }
}
</style>
