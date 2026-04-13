<script setup>
import { ref, onMounted } from 'vue'
import { apiService } from '../store/auth.js'

const bookings = ref([])
const loading = ref(false)
const showForm = ref(false)
const editingBooking = ref(null)
const searchQuery = ref('')
const message = ref({ text: '', type: '' })

const defaultBooking = {
  passengerName: '',
  route: '',
  date: '',
  time: '',
  seats: 1,
  phone: '',
  status: 'Ожидание',
  totalPrice: 0,
}

const formBooking = ref({ ...defaultBooking })
const filteredBookings = ref([])

onMounted(async () => {
  await loadBookings()
})

const loadBookings = async () => {
  loading.value = true
  bookings.value = await apiService.get('bookings')
  filteredBookings.value = bookings.value
  loading.value = false
}

const filterBookings = () => {
  if (!searchQuery.value) {
    filteredBookings.value = bookings.value
    return
  }
  const query = searchQuery.value.toLowerCase()
  filteredBookings.value = bookings.value.filter(b =>
    b.passengerName.toLowerCase().includes(query) ||
    b.route.includes(query) ||
    b.phone.includes(query)
  )
}

const openCreateForm = () => {
  editingBooking.value = null
  formBooking.value = { ...defaultBooking }
  showForm.value = true
}

const openEditForm = (booking) => {
  editingBooking.value = booking
  formBooking.value = { ...booking }
  showForm.value = true
}

const closeForm = () => {
  showForm.value = false
  editingBooking.value = null
  formBooking.value = { ...defaultBooking }
}

const calculatePrice = () => {
  const prices = { '10': 60, '25': 45, '42': 90, '105': 150, '7': 45 }
  const pricePerSeat = prices[formBooking.value.route] || 50
  formBooking.value.totalPrice = pricePerSeat * formBooking.value.seats
}

const saveBooking = async () => {
  if (!formBooking.value.passengerName || !formBooking.value.route) {
    showMessage('Заполните обязательные поля', 'error')
    return
  }

  try {
    if (editingBooking.value) {
      await apiService.update('bookings', editingBooking.value.id, formBooking.value)
      showMessage('Бронирование обновлено', 'success')
    } else {
      await apiService.create('bookings', formBooking.value)
      showMessage('Бронирование создано', 'success')
    }
    closeForm()
    await loadBookings()
  } catch (error) {
    showMessage('Ошибка при сохранении', 'error')
  }
}

const deleteBooking = async (id) => {
  if (!confirm('Вы уверены, что хотите удалить это бронирование?')) return
  
  try {
    await apiService.delete('bookings', id)
    showMessage('Бронирование удалено', 'success')
    await loadBookings()
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
  const badges = {
    'Подтверждено': 'status-confirmed',
    'Ожидание': 'status-pending',
    'Отменено': 'status-cancelled',
  }
  return badges[status] || 'status-default'
}
</script>

<template>
  <div class="booking-management">
    <div class="section-header">
      <div>
        <h2>🎫 Управление бронированиями</h2>
        <p class="section-description">Просмотр, создание и управление бронированиями пассажиров</p>
      </div>
      <button class="btn btn-primary" @click="openCreateForm">
        ➕ Новое бронирование
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
        <h3>{{ editingBooking ? '✏️ Редактирование' : '➕ Новое бронирование' }}</h3>
        
        <div class="form-grid">
          <div class="form-group">
            <label>ФИО пассажира *</label>
            <input v-model="formBooking.passengerName" placeholder="Иванов И.И." />
          </div>
          <div class="form-group">
            <label>Телефон</label>
            <input v-model="formBooking.phone" placeholder="+7(999)123-45-67" />
          </div>
          <div class="form-group">
            <label>Номер маршрута *</label>
            <select v-model="formBooking.route" @change="calculatePrice">
              <option value="">Выберите маршрут</option>
              <option value="10">10 - Вокзал - Микрорайон</option>
              <option value="25">25 - Автопарк - Рынок</option>
              <option value="42">42 - Пос. Северный - ТЦ Мега</option>
              <option value="105">105 - Автостанция - Дер. Ивановка</option>
              <option value="7">7 - Ж/Д станция - Университет</option>
            </select>
          </div>
          <div class="form-group">
            <label>Дата поездки</label>
            <input v-model="formBooking.date" type="date" />
          </div>
          <div class="form-group">
            <label>Время отправления</label>
            <input v-model="formBooking.time" type="time" />
          </div>
          <div class="form-group">
            <label>Количество мест</label>
            <input v-model.number="formBooking.seats" type="number" min="1" max="10" @change="calculatePrice" />
          </div>
          <div class="form-group">
            <label>Статус</label>
            <select v-model="formBooking.status">
              <option>Ожидание</option>
              <option>Подтверждено</option>
              <option>Отменено</option>
            </select>
          </div>
          <div class="form-group">
            <label>Итого (руб.)</label>
            <input v-model.number="formBooking.totalPrice" type="number" />
          </div>
        </div>

        <div class="form-actions">
          <button class="btn btn-success" @click="saveBooking">
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
        @input="filterBookings"
        placeholder="🔍 Поиск по пассажиру, маршруту, телефону..."
        class="search-input"
      />
      <span class="result-count">Найдено: {{ filteredBookings.length }}</span>
    </div>

    <!-- Таблица -->
    <div v-if="loading" class="loading">Загрузка данных...</div>
    
    <div v-else class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Пассажир</th>
            <th>Телефон</th>
            <th>Маршрут</th>
            <th>Дата</th>
            <th>Время</th>
            <th>Мест</th>
            <th>Сумма</th>
            <th>Статус</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="booking in filteredBookings" :key="booking.id">
            <td>{{ booking.id }}</td>
            <td><strong>{{ booking.passengerName }}</strong></td>
            <td>{{ booking.phone }}</td>
            <td><span class="route-badge">№{{ booking.route }}</span></td>
            <td>{{ booking.date }}</td>
            <td>{{ booking.time }}</td>
            <td>{{ booking.seats }}</td>
            <td><strong>{{ booking.totalPrice }} ₽</strong></td>
            <td><span :class="['status-badge', getStatusBadge(booking.status)]">{{ booking.status }}</span></td>
            <td class="actions">
              <button class="btn-icon btn-edit" @click="openEditForm(booking)" title="Редактировать">
                ✏️
              </button>
              <button class="btn-icon btn-delete" @click="deleteBooking(booking.id)" title="Удалить">
                🗑️
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="filteredBookings.length === 0" class="empty-state">
        <p>📭 Бронирования не найдены</p>
      </div>
    </div>

    <!-- Статистика -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">🎫</div>
        <div class="stat-info">
          <div class="stat-value">{{ bookings.length }}</div>
          <div class="stat-label">Всего бронирований</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-info">
          <div class="stat-value">{{ bookings.filter(b => b.status === 'Подтверждено').length }}</div>
          <div class="stat-label">Подтверждено</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⏳</div>
        <div class="stat-info">
          <div class="stat-value">{{ bookings.filter(b => b.status === 'Ожидание').length }}</div>
          <div class="stat-label">В ожидании</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-info">
          <div class="stat-value">{{ bookings.reduce((sum, b) => sum + b.totalPrice, 0) }} ₽</div>
          <div class="stat-label">Общая сумма</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.booking-management {
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

.route-badge {
  background: #e74c3c;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-weight: bold;
  display: inline-block;
  min-width: 40px;
  text-align: center;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-block;
}

.status-confirmed {
  background: #2ecc71;
  color: white;
}

.status-pending {
  background: #f39c12;
  color: white;
}

.status-cancel {
  background: #e74c3c;
  color: white;
}

.status-default {
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
  .booking-management {
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
