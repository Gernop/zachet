<script setup>
import { ref, computed, onMounted } from 'vue'
import { apiService } from '../store/auth.js'
import { authStore } from '../store/auth.js'

const routes = ref([])
const myBookings = ref([])
const loading = ref(false)
const showBookingForm = ref(false)
const selectedRoute = ref(null)
const message = ref({ text: '', type: '' })
const activeTab = ref('routes')

const emit = defineEmits(['logout'])

const bookingForm = ref({
  passengerName: '',
  phone: '',
  date: '',
  time: '',
  seats: 1,
})

const handleLogout = () => {
  authStore.logout()
  emit('logout')
}

onMounted(async () => {
  await loadRoutes()
  await loadMyBookings()
  // Подставляем имя текущего пользователя
  if (authStore.state.user?.name) {
    bookingForm.value.passengerName = authStore.state.user.name
  }
})

const loadRoutes = async () => {
  loading.value = true
  routes.value = await apiService.get('routes')
  loading.value = false
}

const loadMyBookings = async () => {
  const allBookings = await apiService.get('bookings')
  // Фильтруем бронирования текущего пользователя
  myBookings.value = allBookings.filter(b => 
    b.passengerName === authStore.state.user?.name ||
    b.phone === authStore.state.user?.phone
  )
}

const openBookingForm = (route) => {
  selectedRoute.value = route
  bookingForm.value.seats = 1
  bookingForm.value.date = new Date().toISOString().split('T')[0]
  showBookingForm.value = true
}

const calculatePrice = () => {
  if (!selectedRoute.value) return 0
  return selectedRoute.value.length * 3.5 * bookingForm.value.seats
}

const submitBooking = async () => {
  if (!bookingForm.value.passengerName || !bookingForm.value.phone) {
    showMessage('Заполните ФИО и телефон', 'error')
    return
  }

  if (!selectedRoute.value) {
    showMessage('Выберите маршрут', 'error')
    return
  }

  const totalPrice = calculatePrice()

  try {
    await apiService.create('bookings', {
      passengerName: bookingForm.value.passengerName,
      route: selectedRoute.value.number,
      date: bookingForm.value.date,
      time: bookingForm.value.time || '08:00',
      seats: bookingForm.value.seats,
      phone: bookingForm.value.phone,
      status: 'Ожидание',
      totalPrice: Math.round(totalPrice)
    })
    showMessage('Бронирование создано! Ожидайте подтверждения.', 'success')
    showBookingForm.value = false
    selectedRoute.value = null
    await loadMyBookings()
  } catch (error) {
    showMessage('Ошибка при бронировании', 'error')
  }
}

const cancelBooking = async (id) => {
  if (!confirm('Отменить бронирование?')) return
  
  try {
    await apiService.update('bookings', id, { status: 'Отменено' })
    showMessage('Бронирование отменено', 'success')
    await loadMyBookings()
  } catch (error) {
    showMessage('Ошибка при отмене', 'error')
  }
}

const showMessage = (text, type) => {
  message.value = { text, type }
  setTimeout(() => {
    message.value = { text: '', type: '' }
  }, 3000)
}

const getTypeBadge = (type) => {
  const badges = {
    'Городской': 'type-city',
    'Пригородный': 'type-suburban',
    'Межгород': 'type-intercity',
  }
  return badges[type] || 'type-default'
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
  <div class="passenger-panel">
    <!-- Приветствие -->
    <div class="welcome-banner">
      <div class="welcome-content">
        <h2>👋 Добро пожаловать, {{ authStore.state.user?.name }}!</h2>
        <p>Просмотрите доступные маршруты и забронируйте поездку</p>
      </div>
      <button class="btn-logout" @click="handleLogout">
        🚪 Выйти
      </button>
    </div>

    <!-- Сообщения -->
    <div v-if="message.text" :class="['alert', `alert-${message.type}`]">
      {{ message.text }}
    </div>

    <!-- Табы -->
    <div class="tabs">
      <button 
        :class="['tab-btn', { active: activeTab === 'routes' }]"
        @click="activeTab = 'routes'"
      >
        🗺️ Маршруты
      </button>
      <button 
        :class="['tab-btn', { active: activeTab === 'bookings' }]"
        @click="activeTab = 'bookings'"
      >
        🎫 Мои бронирования
      </button>
    </div>

    <!-- Маршруты -->
    <div v-if="activeTab === 'routes'" class="tab-content">
      <h3>Доступные маршруты</h3>
      
      <div v-if="loading" class="loading">Загрузка маршрутов...</div>
      
      <div v-else class="routes-grid">
        <div v-for="route in routes" :key="route.id" class="route-card">
          <div class="route-header">
            <span class="route-number">№{{ route.number }}</span>
            <span :class="['route-type', getTypeBadge(route.type)]">{{ route.type }}</span>
          </div>
          
          <div class="route-info">
            <p class="route-name">{{ route.name }}</p>
            <div class="route-details">
              <span>📏 {{ route.length }} км</span>
              <span>🚏 {{ route.stops }} ост.</span>
              <span>⏱️ {{ route.travelTime }} мин</span>
            </div>
          </div>

          <button class="btn-book" @click="openBookingForm(route)">
            🎫 Забронировать
          </button>
        </div>

        <div v-if="routes.length === 0" class="empty-state">
          <p>📭 Нет доступных маршрутов</p>
        </div>
      </div>
    </div>

    <!-- Мои бронирования -->
    <div v-if="activeTab === 'bookings'" class="tab-content">
      <h3>Мои бронирования</h3>

      <div v-if="myBookings.length === 0" class="empty-state">
        <p>📭 У вас пока нет бронирований</p>
        <button class="btn btn-primary" @click="activeTab = 'routes'">
          Перейти к маршрутам
        </button>
      </div>

      <div v-else class="bookings-list">
        <div v-for="booking in myBookings" :key="booking.id" class="booking-card">
          <div class="booking-header">
            <span class="booking-route">Маршрут №{{ booking.route }}</span>
            <span :class="['booking-status', getStatusBadge(booking.status)]">
              {{ booking.status }}
            </span>
          </div>
          
          <div class="booking-details">
            <div class="detail-row">
              <span class="detail-label">📅 Дата:</span>
              <span class="detail-value">{{ booking.date }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">🕐 Время:</span>
              <span class="detail-value">{{ booking.time }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">💺 Мест:</span>
              <span class="detail-value">{{ booking.seats }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">💰 Стоимость:</span>
              <span class="detail-value price">{{ booking.totalPrice }} ₽</span>
            </div>
          </div>

          <div v-if="booking.status === 'Ожидание'" class="booking-actions">
            <button class="btn btn-danger btn-sm" @click="cancelBooking(booking.id)">
              ❌ Отменить
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно бронирования -->
    <div v-if="showBookingForm" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>🎫 Бронирование маршрута №{{ selectedRoute?.number }}</h3>
          <button class="modal-close" @click="showBookingForm = false">✕</button>
        </div>

        <div class="modal-body">
          <div class="selected-route-info">
            <p><strong>{{ selectedRoute?.name }}</strong></p>
            <p>📏 {{ selectedRoute?.length }} км | ⏱️ {{ selectedRoute?.travelTime }} мин</p>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label>ФИО пассажира *</label>
              <input v-model="bookingForm.passengerName" placeholder="Иванов Иван Иванович" />
            </div>
            <div class="form-group">
              <label>Телефон *</label>
              <input v-model="bookingForm.phone" placeholder="+7(999)123-45-67" />
            </div>
            <div class="form-group">
              <label>Дата поездки</label>
              <input v-model="bookingForm.date" type="date" />
            </div>
            <div class="form-group">
              <label>Время</label>
              <input v-model="bookingForm.time" type="time" />
            </div>
            <div class="form-group">
              <label>Количество мест</label>
              <input v-model.number="bookingForm.seats" type="number" min="1" max="10" />
            </div>
            <div class="form-group">
              <label>Итого</label>
              <div class="price-display">{{ calculatePrice().toFixed(0) }} ₽</div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showBookingForm = false">
            Отмена
          </button>
          <button class="btn btn-success" @click="submitBooking">
            ✅ Забронировать
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.passenger-panel {
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.welcome-content h2 {
  margin: 0 0 0.5rem 0;
}

.welcome-content p {
  margin: 0;
  opacity: 0.9;
}

.btn-logout {
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

.btn-logout:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: white;
  transform: translateY(-2px);
}

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.tab-btn {
  padding: 0.75rem 1.5rem;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s;
}

.tab-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.tab-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
  color: white;
}

h3 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

/* Маршруты */
.routes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.route-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s, box-shadow 0.2s;
}

.route-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.route-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.route-number {
  background: #e74c3c;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: bold;
  font-size: 1.1rem;
}

.route-type {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.type-city {
  background: #2ecc71;
  color: white;
}

.type-suburban {
  background: #f39c12;
  color: white;
}

.type-intercity {
  background: #9b59b6;
  color: white;
}

.route-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.75rem 0;
}

.route-details {
  display: flex;
  gap: 1rem;
  color: #777;
  font-size: 0.9rem;
}

.btn-book {
  width: 100%;
  margin-top: 1rem;
  padding: 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-book:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* Бронирования */
.bookings-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1rem;
}

.booking-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.booking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.booking-route {
  font-weight: 600;
  color: #2c3e50;
  font-size: 1.1rem;
}

.booking-status {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-confirmed {
  background: #2ecc71;
  color: white;
}

.status-pending {
  background: #f39c12;
  color: white;
}

.status-cancelled {
  background: #e74c3c;
  color: white;
}

.booking-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
}

.detail-label {
  color: #777;
}

.detail-value {
  font-weight: 500;
  color: #2c3e50;
}

.price {
  color: #27ae60;
  font-weight: bold;
}

.booking-actions {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
}

/* Модальное окно */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
}

.modal-body {
  padding: 1.5rem;
}

.selected-route-info {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.selected-route-info p {
  margin: 0.25rem 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
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

.form-group input {
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.price-display {
  font-size: 1.5rem;
  font-weight: bold;
  color: #27ae60;
  padding: 0.75rem;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1.5rem;
  border-top: 1px solid #eee;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
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

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #999;
}

.empty-state p {
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #667eea;
  font-weight: 500;
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

@media (max-width: 768px) {
  .welcome-banner {
    padding: 1.5rem;
  }

  .routes-grid,
  .bookings-list {
    grid-template-columns: 1fr;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
