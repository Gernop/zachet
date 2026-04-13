<script setup>
import { ref, computed } from 'vue'

const drivers = ref([
  { id: 1, lastName: 'Иванов', firstName: 'Алексей', middleName: 'Петрович', licenseNumber: '7701234567', category: 'D', experience: 15, phone: '+7(999)123-45-67', status: 'На линии' },
  { id: 2, lastName: 'Петров', firstName: 'Сергей', middleName: 'Иванович', licenseNumber: '7701234568', category: 'D', experience: 10, phone: '+7(999)234-56-78', status: 'На смене' },
  { id: 3, lastName: 'Сидоров', firstName: 'Владимир', middleName: 'Алексеевич', licenseNumber: '7701234569', category: 'D,DE', experience: 20, phone: '+7(999)345-67-89', status: 'Выходной' },
  { id: 4, lastName: 'Козлов', firstName: 'Дмитрий', middleName: 'Сергеевич', licenseNumber: '7701234570', category: 'D', experience: 8, phone: '+7(999)456-78-90', status: 'На линии' },
  { id: 5, lastName: 'Новикова', firstName: 'Елена', middleName: 'Викторовна', licenseNumber: '7701234571', category: 'D', experience: 12, phone: '+7(999)567-89-01', status: 'Больничный' },
])

const showForm = ref(false)
const newDriver = ref({ lastName: '', firstName: '', middleName: '', licenseNumber: '', category: 'D', experience: 0, phone: '', status: 'Выходной' })
const searchQuery = ref('')

const filteredDrivers = computed(() => {
  return drivers.value.filter(driver => 
    driver.lastName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    driver.firstName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    driver.licenseNumber.includes(searchQuery.value)
  )
})

const addDriver = () => {
  if (newDriver.value.lastName && newDriver.value.firstName) {
    drivers.value.push({
      id: drivers.value.length + 1,
      ...newDriver.value
    })
    newDriver.value = { lastName: '', firstName: '', middleName: '', licenseNumber: '', category: 'D', experience: 0, phone: '', status: 'Выходной' }
    showForm.value = false
  }
}

const deleteDriver = (id) => {
  drivers.value = drivers.value.filter(driver => driver.id !== id)
}

const getStatusClass = (status) => {
  switch(status) {
    case 'На линии': return 'status-active'
    case 'На смене': return 'status-shift'
    case 'Выходной': return 'status-dayoff'
    case 'Больничный': return 'status-sick'
    default: return ''
  }
}
</script>

<template>
  <div class="driver-list">
    <h2>👨‍✈️ Управление водителями</h2>
    
    <div class="controls">
      <input 
        v-model="searchQuery" 
        placeholder="Поиск по ФИО или номеру прав..." 
        class="search-input"
      />
      <button @click="showForm = !showForm" class="btn btn-primary">
        {{ showForm ? 'Отменить' : 'Добавить водителя' }}
      </button>
    </div>

    <div v-if="showForm" class="form-card">
      <h3>Новый водитель</h3>
      <div class="form-grid">
        <div class="form-group">
          <label>Фамилия</label>
          <input v-model="newDriver.lastName" placeholder="Иванов" />
        </div>
        <div class="form-group">
          <label>Имя</label>
          <input v-model="newDriver.firstName" placeholder="Алексей" />
        </div>
        <div class="form-group">
          <label>Отчество</label>
          <input v-model="newDriver.middleName" placeholder="Петрович" />
        </div>
        <div class="form-group">
          <label>Номер прав</label>
          <input v-model="newDriver.licenseNumber" placeholder="7701234567" />
        </div>
        <div class="form-group">
          <label>Категория</label>
          <select v-model="newDriver.category">
            <option>D</option>
            <option>D,DE</option>
            <option>D1</option>
          </select>
        </div>
        <div class="form-group">
          <label>Стаж (лет)</label>
          <input v-model.number="newDriver.experience" type="number" min="0" />
        </div>
        <div class="form-group">
          <label>Телефон</label>
          <input v-model="newDriver.phone" placeholder="+7(999)123-45-67" />
        </div>
        <div class="form-group">
          <label>Статус</label>
          <select v-model="newDriver.status">
            <option>На линии</option>
            <option>На смене</option>
            <option>Выходной</option>
            <option>Больничный</option>
          </select>
        </div>
      </div>
      <button @click="addDriver" class="btn btn-success">Сохранить</button>
    </div>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>ФИО</th>
            <th>Номер прав</th>
            <th>Категория</th>
            <th>Стаж</th>
            <th>Телефон</th>
            <th>Статус</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="driver in filteredDrivers" :key="driver.id">
            <td>{{ driver.id }}</td>
            <td>{{ driver.lastName }} {{ driver.firstName }} {{ driver.middleName }}</td>
            <td><code>{{ driver.licenseNumber }}</code></td>
            <td><span class="badge">{{ driver.category }}</span></td>
            <td>{{ driver.experience }} лет</td>
            <td>{{ driver.phone }}</td>
            <td><span :class="getStatusClass(driver.status)">{{ driver.status }}</span></td>
            <td>
              <button @click="deleteDriver(driver.id)" class="btn btn-danger">Удалить</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="stats">
      <div class="stat-item">
        <span class="stat-label">Всего водителей:</span>
        <span class="stat-value">{{ drivers.length }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">На линии:</span>
        <span class="stat-value">{{ drivers.filter(d => d.status === 'На линии').length }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">На смене:</span>
        <span class="stat-value">{{ drivers.filter(d => d.status === 'На смене').length }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Ср. стаж:</span>
        <span class="stat-value">{{ Math.round(drivers.reduce((sum, d) => sum + d.experience, 0) / drivers.length) }} лет</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.driver-list {
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

.badge {
  background: #9b59b6;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
}

.status-active {
  background: #2ecc71;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
}

.status-shift {
  background: #3498db;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
}

.status-dayoff {
  background: #95a5a6;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
}

.status-sick {
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
