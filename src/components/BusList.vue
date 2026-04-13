<script setup>
import { ref, computed, onMounted } from 'vue'
import { apiService } from '../store/auth.js'

const buses = ref([])
const loading = ref(false)
const showForm = ref(false)
const editingBus = ref(null)
const searchQuery = ref('')
const message = ref({ text: '', type: '' })

const defaultBus = {
  model: '',
  plateNumber: '',
  capacity: 0,
  year: 2024,
  status: 'В гараже'
}

const formBus = ref({ ...defaultBus })

const filteredBuses = computed(() => {
  if (!searchQuery.value) return buses.value
  const query = searchQuery.value.toLowerCase()
  return buses.value.filter(bus =>
    bus.model.toLowerCase().includes(query) ||
    bus.plateNumber.toLowerCase().includes(query)
  )
})

onMounted(async () => {
  await loadBuses()
})

const loadBuses = async () => {
  loading.value = true
  buses.value = await apiService.get('buses')
  loading.value = false
}

const openCreateForm = () => {
  editingBus.value = null
  formBus.value = { ...defaultBus }
  showForm.value = true
}

const openEditForm = (bus) => {
  editingBus.value = bus
  formBus.value = { ...bus }
  showForm.value = true
}

const closeForm = () => {
  showForm.value = false
  editingBus.value = null
  formBus.value = { ...defaultBus }
}

const saveBus = async () => {
  if (!formBus.value.model || !formBus.value.plateNumber) {
    showMessage('Заполните обязательные поля', 'error')
    return
  }

  try {
    if (editingBus.value) {
      await apiService.update('buses', editingBus.value.id, formBus.value)
      showMessage('Автобус обновлён', 'success')
    } else {
      await apiService.create('buses', formBus.value)
      showMessage('Автобус добавлен', 'success')
    }
    closeForm()
    await loadBuses()
  } catch (error) {
    showMessage('Ошибка при сохранении', 'error')
  }
}

const deleteBus = async (id) => {
  if (!confirm('Вы уверены, что хотите удалить этот автобус?')) return
  
  try {
    await apiService.delete('buses', id)
    showMessage('Автобус удалён', 'success')
    await loadBuses()
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

const getStatusClass = (status) => {
  switch(status) {
    case 'На линии': return 'status-active'
    case 'В гараже': return 'status-garage'
    case 'На ремонте': return 'status-repair'
    default: return ''
  }
}
</script>

<template>
  <div class="bus-list">
    <h2>🚌 Управление автобусами</h2>

    <!-- Сообщения -->
    <div v-if="message.text" :class="['alert', `alert-${message.type}`]">
      {{ message.text }}
    </div>

    <!-- Управление -->
    <div class="controls">
      <input
        v-model="searchQuery"
        @input="filteredBuses"
        placeholder="Поиск по модели или гос. номеру..."
        class="search-input"
      />
      <button @click="openCreateForm" class="btn btn-primary">
        ➕ Добавить автобус
      </button>
    </div>

    <!-- Форма создания/редактирования -->
    <div v-if="showForm" class="form-modal">
      <div class="form-overlay" @click="closeForm"></div>
      <div class="form-content">
        <h3>{{ editingBus ? '✏️ Редактирование автобуса' : '➕ Новый автобус' }}</h3>
        
        <div class="form-grid">
          <div class="form-group">
            <label>Модель *</label>
            <input v-model="formBus.model" placeholder="ЛиАЗ-5292" />
          </div>
          <div class="form-group">
            <label>Гос. номер *</label>
            <input v-model="formBus.plateNumber" placeholder="А123БВ77" />
          </div>
          <div class="form-group">
            <label>Вместимость</label>
            <input v-model.number="formBus.capacity" type="number" min="1" />
          </div>
          <div class="form-group">
            <label>Год выпуска</label>
            <input v-model.number="formBus.year" type="number" min="1990" max="2026" />
          </div>
          <div class="form-group">
            <label>Статус</label>
            <select v-model="formBus.status">
              <option>На линии</option>
              <option>В гараже</option>
              <option>На ремонте</option>
            </select>
          </div>
        </div>

        <div class="form-actions">
          <button class="btn btn-success" @click="saveBus">
            💾 Сохранить
          </button>
          <button class="btn btn-secondary" @click="closeForm">
            Отмена
          </button>
        </div>
      </div>
    </div>

    <!-- Таблица -->
    <div v-if="loading" class="loading">Загрузка данных...</div>
    
    <div v-else class="table-container">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Модель</th>
            <th>Гос. номер</th>
            <th>Вместимость</th>
            <th>Год</th>
            <th>Статус</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="bus in filteredBuses" :key="bus.id">
            <td>{{ bus.id }}</td>
            <td>{{ bus.model }}</td>
            <td><code>{{ bus.plateNumber }}</code></td>
            <td>{{ bus.capacity }} чел.</td>
            <td>{{ bus.year }}</td>
            <td><span :class="getStatusClass(bus.status)">{{ bus.status }}</span></td>
            <td class="actions">
              <button @click="openEditForm(bus)" class="btn-icon btn-edit" title="Изменить">
                ✏️
              </button>
              <button @click="deleteBus(bus.id)" class="btn-icon btn-delete" title="Удалить">
                🗑️
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="filteredBuses.length === 0" class="empty-state">
        <p>📭 Автобусы не найдены</p>
      </div>
    </div>

    <!-- Статистика -->
    <div class="stats">
      <div class="stat-item">
        <span class="stat-label">Всего автобусов:</span>
        <span class="stat-value">{{ buses.length }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">На линии:</span>
        <span class="stat-value">{{ buses.filter(b => b.status === 'На линии').length }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">В гараже:</span>
        <span class="stat-value">{{ buses.filter(b => b.status === 'В гараже').length }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">На ремонте:</span>
        <span class="stat-value">{{ buses.filter(b => b.status === 'На ремонте').length }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bus-list {
  padding: 1rem;
}

h2 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.search-input {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
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

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background: #c0392b;
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

/* Модальная форма */
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
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

.table-container {
  overflow-x: auto;
  margin-bottom: 1.5rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

th, td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background: #34495e;
  color: white;
  font-weight: 600;
}

tr:hover {
  background: #f5f5f5;
}

code {
  background: #f0f0f0;
  padding: 0.2rem 0.5rem;
  border-radius: 3px;
  font-family: monospace;
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

.status-active {
  background: #2ecc71;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  display: inline-block;
}

.status-garage {
  background: #95a5a6;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  display: inline-block;
}

.status-repair {
  background: #e67e22;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  display: inline-block;
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

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-item {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
}

.stat-label {
  font-weight: 500;
  color: #555;
}

.stat-value {
  font-weight: bold;
  color: #2c3e50;
  font-size: 1.2rem;
}

@media (max-width: 768px) {
  .bus-list {
    padding: 1rem;
  }

  .controls {
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
