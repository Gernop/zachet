<script setup>
import { ref, onMounted } from 'vue'
import { apiService } from '../store/auth.js'

const tariffs = ref([])
const loading = ref(false)
const showForm = ref(false)
const editingTariff = ref(null)
const searchQuery = ref('')
const message = ref({ text: '', type: '' })

const defaultTariff = {
  name: '',
  pricePerKm: 0,
  minPrice: 0,
  description: '',
  validFrom: '',
  validTo: '',
  status: 'Активен',
}

const formTariff = ref({ ...defaultTariff })
const filteredTariffs = ref([])

onMounted(async () => {
  await loadTariffs()
})

const loadTariffs = async () => {
  loading.value = true
  tariffs.value = await apiService.get('tariffs')
  filteredTariffs.value = tariffs.value
  loading.value = false
}

const filterTariffs = () => {
  if (!searchQuery.value) {
    filteredTariffs.value = tariffs.value
    return
  }
  const query = searchQuery.value.toLowerCase()
  filteredTariffs.value = tariffs.value.filter(t =>
    t.name.toLowerCase().includes(query) ||
    t.description.toLowerCase().includes(query)
  )
}

const openCreateForm = () => {
  editingTariff.value = null
  formTariff.value = { ...defaultTariff }
  showForm.value = true
}

const openEditForm = (tariff) => {
  editingTariff.value = tariff
  formTariff.value = { ...tariff }
  showForm.value = true
}

const closeForm = () => {
  showForm.value = false
  editingTariff.value = null
  formTariff.value = { ...defaultTariff }
}

const saveTariff = async () => {
  if (!formTariff.value.name || !formTariff.value.pricePerKm) {
    showMessage('Заполните обязательные поля', 'error')
    return
  }

  try {
    if (editingTariff.value) {
      await apiService.update('tariffs', editingTariff.value.id, formTariff.value)
      showMessage('Тариф обновлён', 'success')
    } else {
      await apiService.create('tariffs', formTariff.value)
      showMessage('Тариф создан', 'success')
    }
    closeForm()
    await loadTariffs()
  } catch (error) {
    showMessage('Ошибка при сохранении', 'error')
  }
}

const deleteTariff = async (id) => {
  if (!confirm('Вы уверены, что хотите удалить этот тариф?')) return
  
  try {
    await apiService.delete('tariffs', id)
    showMessage('Тариф удалён', 'success')
    await loadTariffs()
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

const getStatusBadge = (status) => {
  return status === 'Активен' ? 'status-active' : 'status-inactive'
}
</script>

<template>
  <div class="tariff-management">
    <div class="section-header">
      <div>
        <h2>💰 Управление тарифами</h2>
        <p class="section-description">Настройка тарифов на пассажирские перевозки</p>
      </div>
      <button class="btn btn-primary" @click="openCreateForm">
        ➕ Новый тариф
      </button>
    </div>

    <!-- Сообщения -->
    <div v-if="message.text" :class="['alert', `alert-${message.type}`]">
      {{ message.text }}
    </div>

    <!-- Форма -->
    <div v-if="showForm" class="form-modal">
      <div class="form-overlay" @click="closeForm"></div>
      <div class="form-content">
        <h3>{{ editingTariff ? '✏️ Редактирование' : '➕ Новый тариф' }}</h3>
        
        <div class="form-grid">
          <div class="form-group">
            <label>Название тарифа *</label>
            <input v-model="formTariff.name" placeholder="Городской" />
          </div>
          <div class="form-group">
            <label>Цена за км (руб.) *</label>
            <input v-model.number="formTariff.pricePerKm" type="number" step="0.1" min="0" />
          </div>
          <div class="form-group">
            <label>Минимальная цена (руб.)</label>
            <input v-model.number="formTariff.minPrice" type="number" min="0" />
          </div>
          <div class="form-group">
            <label>Описание</label>
            <textarea v-model="formTariff.description" rows="3" placeholder="Описание тарифа"></textarea>
          </div>
          <div class="form-group">
            <label>Действует с</label>
            <input v-model="formTariff.validFrom" type="date" />
          </div>
          <div class="form-group">
            <label>Действует по</label>
            <input v-model="formTariff.validTo" type="date" />
          </div>
          <div class="form-group">
            <label>Статус</label>
            <select v-model="formTariff.status">
              <option>Активен</option>
              <option>Неактивен</option>
            </select>
          </div>
        </div>

        <div class="form-actions">
          <button class="btn btn-success" @click="saveTariff">
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
        @input="filterTariffs"
        placeholder="🔍 Поиск по названию или описанию..."
        class="search-input"
      />
      <span class="result-count">Найдено: {{ filteredTariffs.length }}</span>
    </div>

    <!-- Таблица -->
    <div v-if="loading" class="loading">Загрузка данных...</div>
    
    <div v-else class="cards-container">
      <div v-for="tariff in filteredTariffs" :key="tariff.id" class="tariff-card">
        <div class="tariff-header">
          <h3>{{ tariff.name }}</h3>
          <span :class="['status-badge', getStatusBadge(tariff.status)]">{{ tariff.status }}</span>
        </div>

        <div class="tariff-info">
          <div class="info-row">
            <span class="info-label">💰 Цена за км:</span>
            <span class="info-value">{{ tariff.pricePerKm }} руб.</span>
          </div>
          <div class="info-row">
            <span class="info-label">📊 Мин. цена:</span>
            <span class="info-value">{{ tariff.minPrice }} руб.</span>
          </div>
          <div class="info-row">
            <span class="info-label">📝 Описание:</span>
            <span class="info-value">{{ tariff.description }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">📅 Период:</span>
            <span class="info-value">{{ tariff.validFrom }} — {{ tariff.validTo }}</span>
          </div>
        </div>

        <div class="tariff-actions">
          <button class="btn-icon btn-edit" @click="openEditForm(tariff)" title="Редактировать">
            ✏️
          </button>
          <button class="btn-icon btn-delete" @click="deleteTariff(tariff.id)" title="Удалить">
            🗑️
          </button>
        </div>
      </div>

      <div v-if="filteredTariffs.length === 0" class="empty-state">
        <p>📭 Тарифы не найдены</p>
      </div>
    </div>

    <!-- Статистика -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-info">
          <div class="stat-value">{{ tariffs.length }}</div>
          <div class="stat-label">Всего тарифов</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-info">
          <div class="stat-value">{{ tariffs.filter(t => t.status === 'Активен').length }}</div>
          <div class="stat-label">Активных</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-info">
          <div class="stat-value">{{ tariffs.length > 0 ? (tariffs.reduce((sum, t) => sum + t.pricePerKm, 0) / tariffs.length).toFixed(2) : 0 }} руб.</div>
          <div class="stat-label">Средняя цена за км</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📈</div>
        <div class="stat-info">
          <div class="stat-value">{{ tariffs.length > 0 ? Math.max(...tariffs.map(t => t.pricePerKm)) : 0 }} руб.</div>
          <div class="stat-label">Макс. цена за км</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tariff-management {
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
  max-width: 700px;
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
.form-group select,
.form-group textarea {
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
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

/* Карточки тарифов */
.cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.tariff-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.tariff-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.tariff-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.tariff-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.2rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-active {
  background: #2ecc71;
  color: white;
}

.status-inactive {
  background: #95a5a6;
  color: white;
}

.tariff-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.info-label {
  color: #777;
  font-size: 0.9rem;
  white-space: nowrap;
}

.info-value {
  color: #2c3e50;
  font-weight: 500;
  text-align: right;
}

.tariff-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.btn-icon {
  background: #f8f9fa;
  border: 2px solid #e0e0e0;
  padding: 0.5rem 0.75rem;
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
  grid-column: 1 / -1;
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
  .tariff-management {
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

  .cards-container {
    grid-template-columns: 1fr;
  }
}
</style>
