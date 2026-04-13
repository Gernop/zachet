<script setup>
import { ref, computed } from 'vue'

const routes = ref([
  { id: 1, number: '10', name: 'Вокзал - Центр - Микрорайон', length: 12.5, stops: 18, travelTime: 45, type: 'Городской' },
  { id: 2, number: '25', name: 'Автопарк - Больница - Рынок', length: 8.3, stops: 14, travelTime: 35, type: 'Городской' },
  { id: 3, number: '42', name: 'Пос. Северный - Школа - ТЦ Мега', length: 15.7, stops: 22, travelTime: 55, type: 'Пригородный' },
  { id: 4, number: '105', name: 'Автостанция - Дер. Ивановка', length: 35.2, stops: 12, travelTime: 75, type: 'Межгород' },
  { id: 5, number: '7', name: 'Ж/Д станция - Парк - Университет', length: 10.1, stops: 16, travelTime: 40, type: 'Городской' },
])

const showForm = ref(false)
const newRoute = ref({ number: '', name: '', length: 0, stops: 0, travelTime: 0, type: 'Городской' })
const searchQuery = ref('')

const filteredRoutes = computed(() => {
  return routes.value.filter(route => 
    route.number.includes(searchQuery.value) ||
    route.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const addRoute = () => {
  if (newRoute.value.number && newRoute.value.name) {
    routes.value.push({
      id: routes.value.length + 1,
      ...newRoute.value
    })
    newRoute.value = { number: '', name: '', length: 0, stops: 0, travelTime: 0, type: 'Городской' }
    showForm.value = false
  }
}

const deleteRoute = (id) => {
  routes.value = routes.value.filter(route => route.id !== id)
}

const getTypeClass = (type) => {
  switch(type) {
    case 'Городской': return 'type-city'
    case 'Пригородный': return 'type-suburban'
    case 'Межгород': return 'type-intercity'
    default: return ''
  }
}
</script>

<template>
  <div class="route-list">
    <h2>🗺️ Управление маршрутами</h2>
    
    <div class="controls">
      <input 
        v-model="searchQuery" 
        placeholder="Поиск по номеру или названию..." 
        class="search-input"
      />
      <button @click="showForm = !showForm" class="btn btn-primary">
        {{ showForm ? 'Отменить' : 'Добавить маршрут' }}
      </button>
    </div>

    <div v-if="showForm" class="form-card">
      <h3>Новый маршрут</h3>
      <div class="form-grid">
        <div class="form-group">
          <label>Номер маршрута</label>
          <input v-model="newRoute.number" placeholder="10" />
        </div>
        <div class="form-group">
          <label>Название</label>
          <input v-model="newRoute.name" placeholder="Вокзал - Центр - Микрорайон" />
        </div>
        <div class="form-group">
          <label>Длина (км)</label>
          <input v-model.number="newRoute.length" type="number" step="0.1" min="0" />
        </div>
        <div class="form-group">
          <label>Кол-во остановок</label>
          <input v-model.number="newRoute.stops" type="number" min="1" />
        </div>
        <div class="form-group">
          <label>Время в пути (мин)</label>
          <input v-model.number="newRoute.travelTime" type="number" min="1" />
        </div>
        <div class="form-group">
          <label>Тип маршрута</label>
          <select v-model="newRoute.type">
            <option>Городской</option>
            <option>Пригородный</option>
            <option>Межгород</option>
          </select>
        </div>
      </div>
      <button @click="addRoute" class="btn btn-success">Сохранить</button>
    </div>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Номер</th>
            <th>Название</th>
            <th>Длина</th>
            <th>Остановки</th>
            <th>Время</th>
            <th>Тип</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="route in filteredRoutes" :key="route.id">
            <td>{{ route.id }}</td>
            <td><span class="route-number">{{ route.number }}</span></td>
            <td>{{ route.name }}</td>
            <td>{{ route.length }} км</td>
            <td>{{ route.ststops }}</td>
            <td>{{ route.travelTime }} мин</td>
            <td><span :class="getTypeClass(route.type)">{{ route.type }}</span></td>
            <td>
              <button @click="deleteRoute(route.id)" class="btn btn-danger">Удалить</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="stats">
      <div class="stat-item">
        <span class="stat-label">Всего маршрутов:</span>
        <span class="stat-value">{{ routes.length }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Городских:</span>
        <span class="stat-value">{{ routes.filter(r => r.type === 'Городской').length }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Пригородных:</span>
        <span class="stat-value">{{ routes.filter(r => r.type === 'Пригородный').length }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Общая длина:</span>
        <span class="stat-value">{{ routes.reduce((sum, r) => sum + r.length, 0).toFixed(1) }} км</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.route-list {
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

.type-city {
  background: #2ecc71;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
}

.type-suburban {
  background: #f39c12;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
}

.type-intercity {
  background: #9b59b6;
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
