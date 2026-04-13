<script setup>
import { ref } from 'vue'
import { authStore } from '../store/auth.js'
import UserManagement from './UserManagement.vue'
import BookingManagement from './BookingManagement.vue'
import TariffManagement from './TariffManagement.vue'

const activeSection = ref('users')
const showSidebar = ref(true)

const sections = [
  { id: 'users', label: 'Пользователи', icon: '👥', badge: null },
  { id: 'bookings', label: 'Бронирования', icon: '🎫', badge: '5' },
  { id: 'tariffs', label: 'Тарифы', icon: '💰', badge: null },
]

const handleLogout = () => {
  authStore.logout()
}

const toggleSidebar = () => {
  showSidebar.value = !showSidebar.value
}
</script>

<template>
  <div class="admin-panel">
    <!-- Верхняя панель -->
    <header class="admin-header">
      <div class="admin-header-left">
        <button class="sidebar-toggle" @click="toggleSidebar">
          {{ showSidebar ? '◀' : '▶' }}
        </button>
        <h1 class="admin-title">⚙️ Админ-панель</h1>
      </div>

      <div class="admin-header-right">
        <div class="user-info">
          <span class="user-role">{{ authStore.state.user?.role }}</span>
          <span class="user-name">{{ authStore.state.user?.name }}</span>
        </div>
        <button class="btn-logout" @click="handleLogout">
          🚪 Выйти
        </button>
      </div>
    </header>

    <div class="admin-content">
      <!-- Боковое меню -->
      <aside v-show="showSidebar" class="admin-sidebar">
        <nav class="sidebar-nav">
          <button
            v-for="section in sections"
            :key="section.id"
            :class="['nav-item', { active: activeSection === section.id }]"
            @click="activeSection = section.id"
          >
            <span class="nav-icon">{{ section.icon }}</span>
            <span class="nav-label">{{ section.label }}</span>
            <span v-if="section.badge" class="nav-badge">{{ section.badge }}</span>
          </button>
        </nav>
      </aside>

      <!-- Основной контент -->
      <main class="admin-main">
        <UserManagement v-if="activeSection === 'users'" />
        <BookingManagement v-else-if="activeSection === 'bookings'" />
        <TariffManagement v-else-if="activeSection === 'tariffs'" />
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-panel {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

/* Верхняя панель */
.admin-header {
  background: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.admin-header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.sidebar-toggle {
  background: #f8f9fa;
  border: 2px solid #e0e0e0;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
}

.sidebar-toggle:hover {
  background: #e9ecef;
  border-color: #667eea;
}

.admin-title {
  margin: 0;
  font-size: 1.4rem;
  color: #2c3e50;
}

.admin-header-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.user-info {
  text-align: right;
}

.user-role {
  display: block;
  font-size: 0.75rem;
  color: #999;
  text-transform: uppercase;
}

.user-name {
  font-weight: 600;
  color: #2c3e50;
}

.btn-logout {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-logout:hover {
  background: #c0392b;
  transform: translateY(-1px);
}

/* Контент */
.admin-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* Боковое меню */
.admin-sidebar {
  width: 250px;
  background: #34495e;
  padding: 1.5rem 0;
  flex-shrink: 0;
  transition: width 0.3s;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.9rem 1.5rem;
  background: transparent;
  border: none;
  color: #bdc3c7;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.3s;
  text-align: left;
  position: relative;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-item.active {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
}

.nav-icons {
  font-size: 1.3rem;
}

.nav-label {
  flex: 1;
}

.nav-badge {
  background: #e74c3c;
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: bold;
}

.nav-item.active .nav-badge {
  background: white;
  color: #667eea;
}

/* Основной контент */
.admin-main {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .admin-header {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
  }

  .admin-header-left,
  .admin-header-right {
    width: 100%;
    justify-content: space-between;
  }

  .admin-title {
    font-size: 1.2rem;
  }

  .admin-sidebar {
    width: 200px;
  }

  .admin-main {
    padding: 1rem;
  }
}
</style>
