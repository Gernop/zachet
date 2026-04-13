<script setup>
import { ref, onMounted } from 'vue'
import { apiService } from '../store/auth.js'

const users = ref([])
const loading = ref(false)
const showForm = ref(false)
const editingUser = ref(null)
const searchQuery = ref('')
const message = ref({ text: '', type: '' })

const defaultUser = {
  username: '',
  password: '',
  name: '',
  email: '',
  role: 'Диспетчер',
  status: 'Активен',
}

const formUser = ref({ ...defaultUser })

const filteredUsers = ref([])

onMounted(async () => {
  await loadUsers()
})

const loadUsers = async () => {
  loading.value = true
  users.value = await apiService.get('users')
  filteredUsers.value = users.value
  loading.value = false
}

const filterUsers = () => {
  if (!searchQuery.value) {
    filteredUsers.value = users.value
    return
  }
  const query = searchQuery.value.toLowerCase()
  filteredUsers.value = users.value.filter(u =>
    u.username.toLowerCase().includes(query) ||
    u.name.toLowerCase().includes(query) ||
    u.email.toLowerCase().includes(query) ||
    u.role.toLowerCase().includes(query)
  )
}

const openCreateForm = () => {
  editingUser.value = null
  formUser.value = { ...defaultUser, password: '' }
  showForm.value = true
}

const openEditForm = (user) => {
  editingUser.value = user
  formUser.value = { ...user, password: '' }
  showForm.value = true
}

const closeForm = () => {
  showForm.value = false
  editingUser.value = null
  formUser.value = { ...defaultUser }
}

const saveUser = async () => {
  if (!formUser.value.username || !formUser.value.name) {
    showMessage('Заполните обязательные поля', 'error')
    return
  }

  if (!editingUser.value && !formUser.value.password) {
    showMessage('Укажите пароль для нового пользователя', 'error')
    return
  }

  if (!editingUser.value && formUser.value.password.length < 3) {
    showMessage('Пароль должен содержать минимум 3 символа', 'error')
    return
  }

  try {
    if (editingUser.value) {
      await apiService.update('users', editingUser.value.id, formUser.value)
      showMessage('Пользователь обновлён', 'success')
    } else {
      await apiService.create('users', formUser.value)
      showMessage('Пользователь создан', 'success')
    }
    closeForm()
    await loadUsers()
  } catch (error) {
    showMessage('Ошибка при сохранении', 'error')
  }
}

const deleteUser = async (id) => {
  if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) return
  
  try {
    await apiService.delete('users', id)
    showMessage('Пользователь удалён', 'success')
    await loadUsers()
  } catch (error) {
    showMessage('Ошибка при удалении', 'error')
  }
}

const showMessage = (text, type) => {
  message.value = { text, type }
  setTimeout(() => {
    message.value = { text: '', type: '' }
  }, 3000)
}

const getRoleBadge = (role) => {
  const badges = {
    'Администратор': 'badge-admin',
    'Диспетчер': 'badge-dispatcher',
    'Менеджер': 'badge-manager',
  }
  return badges[role] || 'badge-default'
}

const getStatusBadge = (status) => {
  return status === 'Активен' ? 'status-active' : 'status-inactive'
}
</script>

<template>
  <div class="user-management">
    <div class="section-header">
      <div>
        <h2>👥 Управление пользователями</h2>
        <p class="section-description">Создание, редактирование и удаление пользователей системы</p>
      </div>
      <button class="btn btn-primary" @click="openCreateForm">
        ➕ Добавить пользователя
      </button>
    </div>

    <!-- Сообщения -->
    <div v-if="message.text" :class="['alert', `alert-${message.type}`]">
      {{ message.text }}
    </div>

    <!-- Форма создания/редактирования -->
    <div v-if="showForm" class="form-modal">
      <div class="form-overlay" @click="closeForm"></div>
      <div class="form-content">
        <h3>{{ editingUser ? '✏️ Редактирование' : '➕ Новый пользователь' }}</h3>
        
        <div class="form-grid">
          <div class="form-group">
            <label>Имя пользователя *</label>
            <input v-model="formUser.username" placeholder="username" />
          </div>
          <div class="form-group">
            <label>Пароль {{ editingUser ? '(оставьте пустым, чтобы не менять)' : '*' }}</label>
            <input v-model="formUser.password" type="password" :placeholder="editingUser ? 'Не изменять' : 'Пароль'" />
          </div>
          <div class="form-group">
            <label>ФИО *</label>
            <input v-model="formUser.name" placeholder="Иванов И.И." />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input v-model="formUser.email" type="email" placeholder="email@example.com" />
          </div>
          <div class="form-group">
            <label>Роль</label>
            <select v-model="formUser.role">
              <option>Администратор</option>
              <option>Диспетчер</option>
              <option>Менеджер</option>
              <option>Пассажир</option>
            </select>
          </div>
          <div class="form-group">
            <label>Статус</label>
            <select v-model="formUser.status">
              <option>Активен</option>
              <option>Неактивен</option>
            </select>
          </div>
        </div>

        <div class="form-actions">
          <button class="btn btn-success" @click="saveUser">
            💾 Сохранить
          </button>
          <button class="btn btn-secondary" @click="closeForm">
            Отмена
          </button>
        </div>
      </div>
    </div>

    <!-- Поиск -->
    <div class="search-bar">
      <input
        v-model="searchQuery"
        @input="filterUsers"
        placeholder="🔍 Поиск по имени, email, роли..."
        class="search-input"
      />
      <span class="result-count">Найдено: {{ filteredUsers.length }}</span>
    </div>

    <!-- Таблица -->
    <div v-if="loading" class="loading">Загрузка данных...</div>
    
    <div v-else class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Логин</th>
            <th>ФИО</th>
            <th>Email</th>
            <th>Роль</th>
            <th>Последний вход</th>
            <th>Статус</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id">
            <td>{{ user.id }}</td>
            <td><code>{{ user.username }}</code></td>
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td><span :class="['role-badge', getRoleBadge(user.role)]">{{ user.role }}</span></td>
            <td>{{ user.lastLogin || '—' }}</td>
            <td><span :class="['status-badge', getStatusBadge(user.status)]">{{ user.status }}</span></td>
            <td class="actions">
              <button class="btn-icon btn-edit" @click="openEditForm(user)" title="Редактировать">
                ✏️
              </button>
              <button class="btn-icon btn-delete" @click="deleteUser(user.id)" title="Удалить">
                🗑️
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="filteredUsers.length === 0" class="empty-state">
        <p>📭 Пользователи не найдены</p>
      </div>
    </div>

    <!-- Статистика -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-info">
          <div class="stat-value">{{ users.length }}</div>
          <div class="stat-label">Всего пользователей</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-info">
          <div class="stat-value">{{ users.filter(u => u.status === 'Активен').length }}</div>
          <div class="stat-label">Активных</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⏸️</div>
        <div class="stat-info">
          <div class="stat-value">{{ users.filter(u => u.status === 'Неактивен').length }}</div>
          <div class="stat-label">Неактивных</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">👑</div>
        <div class="stat-info">
          <div class="stat-value">{{ users.filter(u => u.role === 'Администратор').length }}</div>
          <div class="stat-label">Администраторов</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-management {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.section-header h2 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.section-description {
  margin: 0;
  color: #777;
  font-size: 0.9rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
  white-space: nowrap;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-success {
  background: #2ecc71;
  color: white;
}

.btn-success:hover {
  background: #27ae60;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background: #7f8c8d;
}

.alert {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-weight: 500;
}

.alert-success {
  background: #d4edda;
  color: #155724;
  border-left: 4px solid #28a745;
}

.alert-error {
  background: #f8d7da;
  color: #721c24;
  border-left: 4px solid #dc3545;
}

/* Форма */
.form-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.form-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.form-content {
  position: relative;
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.form-content h3 {
  margin: 0 0 1.5rem 0;
  color: #2c3e50;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
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

.form-group input,
.form-group select {
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.form-actions {
  display: flex;
  gap: 1rem;
}

/* Поиск */
.search-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.search-input {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
}

.result-count {
  color: #777;
  font-size: 0.9rem;
  white-space: nowrap;
}

/* Таблица */
.table-container {
  overflow-x: auto;
  margin-bottom: 2rem;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.data-table th {
  background: #34495e;
  color: white;
  font-weight: 600;
}

.data-table tbody tr:hover {
  background: #f8f9fa;
}

.data-table code {
  background: #f0f0f0;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-family: monospace;
}

.role-badge,
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-block;
}

.badge-admin {
  background: #e74c3c;
  color: white;
}

.badge-dispatcher {
  background: #3498db;
  color: white;
}

.badge-manager {
  background: #f39c12;
  color: white;
}

.badge-default {
  background: #95a5a6;
  color: white;
}

.status-active {
  background: #2ecc71;
  color: white;
}

.status-inactive {
  background: #95a5a6;
  color: white;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  background: #f8f9fa;
  border: 2px solid #e0e0e0;
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-edit:hover {
  background: #3498db;
  border-color: #3498db;
}

.btn-delete:hover {
  background: #e74c3c;
  border-color: #e74c3c;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #999;
  font-size: 1.1rem;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #667eea;
  font-weight: 500;
}

/* Статистика */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}

.stat-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  padding: 1.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.stat-icon {
  font-size: 2.5rem;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: #2c3e50;
}

.stat-label {
  font-size: 0.85rem;
  color: #777;
}

@media (max-width: 768px) {
  .user-management {
    padding: 1rem;
  }

  .section-header {
    flex-direction: column;
  }

  .form-content {
    padding: 1.5rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
