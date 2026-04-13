<script setup>
import { ref, computed } from 'vue'

const trips = ref([
  { id: 1, routeNumber: '10', busPlate: 'А123БВ77', driverName: 'Иванов А.П.', departureTime: '06:00', arrivalTime: '06:45', status: 'Завершён', passengers: 45 },
  { id: 2, routeNumber: '25', busPlate: 'В456ГД77', driverName: 'Петров С.И.', departureTime: '07:30', arrivalTime: '08:05', status: 'В пути', passengers: 62 },
  { id: 3, routeNumber: '42', busPlate: 'Е789ЖЗ77', driverName: 'Сидоров В.А.', departureTime: '08:00', arrivalTime: '08:55', status: 'В пути', passengers: 78 },
  { id: 4, routeNumber: '10', busPlate: 'А123БВ77', driverName: 'Козлов Д.С.', departureTime: '09:00', arrivalTime: '09:45', status: 'Ожидание', passengers: 0 },
  { id: 5, routeNumber: '7', busPlate: 'М345НО77', driverName: 'Иванов А.П.', departureTime: '10:15', arrivalTime: '10:55', status: 'Ожидание', passengers: 0 },
  { id: 6, routeNumber: '105', busPlate: 'Е789ЖЗ77', driverName: 'Сидоров В.А.', departureTime: '11:00', arrivalTime: '12:15', status: 'Ожидание', passengers: 0 },
])

const showForm = ref(false)
const newTrip = ref({ routeNumber: '', busPlate: '', driverName: '', departureTime: '', arrivalTime: '', status: 'Ожидание', passengers: 0 })
const searchQuery = ref('')

const filteredTrips = computed(() => {
  return trips.value.filter(trip => 
    trip.routeNumber.includes(searchQuery.value) ||
    trip.driverName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    trip.busPlate.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const addTrip = () => {
  if (newTrip.value.routeNumber && newTrip.value.driverName) {
    trips.value.push({
      id: trips.value.length + 1,
      ...newTrip.value
    })
    newTrip.value = { routeNumber: '', busPlate: '', driverName: '', departureTime: '', arrivalTime: '', status: 'Ожидание', passengers: 0 }
    showForm.value = false
  }
}

const deleteTrip = (id) => {
  trips.value = trips.value.filter(trip => trip.id !== id)
}

const getStatusClass = (status) => {
  switch(status) {
    case 'Завершён': return 'status-completed'
    case 'В пути': return 'status-in-progress'
    case 'Ожидание': return 'status-waiting'
    case 'Отменён': return 'status-cancelled'
    default: return ''
  }
}
</script>

<template>
  <div class="trip-list">
    <h2>🕐 Управление рейсами</h2>
    
    <div class="controls">
      <input 
        v-model="searchQuery" 
        placeholder="Поиск по маршруту, водителю или автобусу..." 
        class="search-input"
      />
      <button @click="showForm = !showForm" class="btn btn-primary">
        {{ showForm ? 'Отменить' : 'Добавить рейс' }}
      </button>
    </div>

    <div v-if="showForm" class="form-card">
      <h3>Новый рейс</h3>
      <div class="form-grid">
        <div class="form-group">
          <label>Номер маршрута</label>
          <input v-model="newTrip.routeNumber" placeholder="10" />
        </div>
        <div class="form-group">
          <label>Гос. номер автобуса</label>
          <input v-model="newTrip.busPlate" placeholder="А123БВ77" />
        </div>
        <div class="form-group">
          <label>Водитель</label>
          <input v-model="newTrip.driverName" placeholder="Иванов А.П." />
        </div>
        <div class="form-group">
          <label>Время отправления</label>
          <input v-model="newTrip.departureTime" placeholder="08:00" />
        </div>
        <div class="form-group">
          <label>Время прибытия</label>
          <input v-model="newTrip.arrivalTime" placeholder="08:45" />
        </div>
        <div class="form-group">
          <label>Статус</label>
          <select v-model="newTrip.status">
            <option>Ожидание</option>
            <option>В пути</option>
            <option>Завершён</option>
            <option>Отменён</option>
          </select>
        </div>
      </div>
      <button @click="addTrip" class="btn btn-success">Сохранить</button>
    </div>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Маршрут</th>
            <th>Автобус</th>
            <th>Водитель</th>
            <th>Отправление</th>
            <th>Прибытие</th>
            <th>Пассажиры</th>
            <th>Статус</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="trip in filteredTrips" :key="trip.id">
            <td>{{ trip.id }}</td>
            <td><span class="route-number">{{ trip.routeNumber }}</span></td>
            <td><code>{{ trip.busPlate }}</code></td>
            <td>{{ trip.driverName }}</td>
            <td><strong>{{ trip.departureTime }}</strong></td>
            <td>{{ trip.arrivalTime }}</td>
            <td>{{ trip.passengers }} чел.</td>
            <td><span :class="getStatusClass(trip.status)">{{ trip.status }}</span></td>
            <td>
              <button @click="deleteTrip(trip.id)" class="btn btn-danger">Удалить</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="stats">
      <div class="stat-item">
        <span class="stat-label">Всего рейсов:</span>
        <span class="stat-value">{{ trips.length }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">В пути:</span>
        <span class="stat-value">{{ trips.filter(t => t.status === 'В пути').length }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Завершено:</span>
        <span class="stat-value">{{ trips.filter(t => t.status === 'Завершён').length }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Пассажиров сегодня:</span>
        <span class="stat-value">{{ trips.reduce((sum, t) => sum + t.passengers, 0) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.trip-list {
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
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
}

.btn-success {
  background: #2ecc71;
  color: white;
}

.btn-success:hover {
  background: #27ae60;
}

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background: #c0392b;
}

.form-card {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.form-card h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
}

.form-group input,
.form-group select {
  padding: 0.5rem;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
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

.route-number {
  background: #e74c3c;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-weight: bold;
  display: inline-block;
  min-width: 30px;
  text-align: center;
}

.status-completed {
  background: #2ecc71;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
}

.status-in-progress {
  background: #3498db;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
}

.status-waiting {
  background: #f39c12;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
}

.status-cancelled {
  background: #e74c3c;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
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
</style>
