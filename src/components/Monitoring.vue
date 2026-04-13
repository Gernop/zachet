<script setup>
import { ref, computed } from 'vue'

// Данные по выручке предприятия за год (в тыс. руб.)
const monthlyRevenue = ref([
  { month: 'Январь', revenue: 2850, passengers: 145000, fuelCost: 920, trips: 890 },
  { month: 'Февраль', revenue: 2650, passengers: 132000, fuelCost: 880, trips: 820 },
  { month: 'Март', revenue: 3100, passengers: 158000, fuelCost: 950, trips: 910 },
  { month: 'Апрель', revenue: 3350, passengers: 168000, fuelCost: 970, trips: 945 },
  { month: 'Май', revenue: 3800, passengers: 189000, fuelCost: 1050, trips: 1020 },
  { month: 'Июнь', revenue: 4200, passengers: 210000, fuelCost: 1150, trips: 1100 },
  { month: 'Июль', revenue: 4500, passengers: 225000, fuelCost: 1200, trips: 1150 },
  { month: 'Август', revenue: 4350, passengers: 218000, fuelCost: 1180, trips: 1120 },
  { month: 'Сентябрь', revenue: 3650, passengers: 178000, fuelCost: 1020, trips: 980 },
  { month: 'Октябрь', revenue: 3200, passengers: 162000, fuelCost: 960, trips: 920 },
  { month: 'Ноябрь', revenue: 2900, passengers: 148000, fuelCost: 930, trips: 870 },
  { month: 'Декабрь', revenue: 3050, passengers: 155000, fuelCost: 940, trips: 900 },
])

// Данные по маршрутам для круговой диаграммы
const routeRevenue = ref([
  { route: 'Маршрут №10', revenue: 12800, percent: 0 },
  { route: 'Маршрут №25', revenue: 8500, percent: 0 },
  { route: 'Маршрут №42', revenue: 10200, percent: 0 },
  { route: 'Маршрут №105', revenue: 6800, percent: 0 },
  { route: 'Маршрут №7', revenue: 9900, percent: 0 },
])

// Вычисляем проценты для круговой диаграммы
const totalRouteRevenue = computed(() => routeRevenue.value.reduce((sum, r) => sum + r.revenue, 0))

routeRevenue.value.forEach(r => {
  r.percent = ((r.revenue / totalRouteRevenue.value) * 100).toFixed(1)
})

// Цвета для круговой диаграммы
const chartColors = ['#667eea', '#764ba2', '#2ecc71', '#f39c12', '#e74c3c']

// Параметры линейной диаграммы
const maxRevenue = computed(() => Math.max(...monthlyRevenue.value.map(m => m.revenue)))
const chartHeight = 200

// Параметры гистограммы
const maxPassengers = computed(() => Math.max(...monthlyRevenue.value.map(m => m.passengers)))
const passengerChartHeight = 150

// Статистические данные для таблицы
const stats = computed(() => {
  const revenues = monthlyRevenue.value.map(m => m.revenue)
  const passengers = monthlyRevenue.value.map(m => m.passengers)
  const fuelCosts = monthlyRevenue.value.map(m => m.fuelCost)
  const trips = monthlyRevenue.value.map(m => m.trips)

  return {
    revenue: {
      sum: revenues.reduce((a, b) => a + b, 0),
      avg: Math.round(revenues.reduce((a, b) => a + b, 0) / revenues.length),
      min: Math.min(...revenues),
      max: Math.max(...revenues),
    },
    passengers: {
      sum: passengers.reduce((a, b) => a + b, 0),
      avg: Math.round(passengers.reduce((a, b) => a + b, 0) / passengers.length),
      min: Math.min(...passengers),
      max: Math.max(...passengers),
    },
    fuelCost: {
      sum: fuelCosts.reduce((a, b) => a + b, 0),
      avg: Math.round(fuelCosts.reduce((a, b) => a + b, 0) / fuelCosts.length),
      min: Math.min(...fuelCosts),
      max: Math.max(...fuelCosts),
    },
    trips: {
      sum: trips.reduce((a, b) => a + b, 0),
      avg: Math.round(trips.reduce((a, b) => a + b, 0) / trips.length),
      min: Math.min(...trips),
      max: Math.max(...trips),
    },
    profit: {
      sum: revenues.reduce((a, b) => a + b, 0) - fuelCosts.reduce((a, b) => a + b, 0),
      avg: Math.round((revenues.reduce((a, b) => a + b, 0) - fuelCosts.reduce((a, b) => a + b, 0)) / 12),
      min: Math.min(...revenues.map((r, i) => r - fuelCosts[i])),
      max: Math.max(...revenues.map((r, i) => r - fuelCosts[i])),
    }
  }
})

const activeChart = ref('line')

// Tooltip для диаграмм
const hoveredItem = ref(null)
</script>

<template>
  <div class="monitoring">
    <h2>📊 Мониторинг показателей предприятия</h2>

    <!-- Переключатель диаграмм -->
    <div class="chart-tabs">
      <button 
        v-for="chart in [{id: 'line', label: '📈 Линейная'}, {id: 'bar', label: '📊 Гистограмма'}, {id: 'pie', label: '🥧 Круговая'}, {id: 'table', label: '📋 Таблица'}]"
        :key="chart.id"
        :class="['tab-btn', { active: activeChart === chart.id }]"
        @click="activeChart = chart.id"
      >
        {{ chart.label }}
      </button>
    </div>

    <!-- ЛИНЕЙНАЯ ДИАГРАММА -->
    <div v-if="activeChart === 'line'" class="chart-container">
      <h3>Выручка предприятия по месяцам (тыс. руб.)</h3>
      <div class="line-chart">
        <div class="chart-area">
          <!-- Горизонтальные линии сетки -->
          <div class="grid-lines">
            <div v-for="i in 5" :key="i" class="grid-line" :style="{ bottom: `${(i/5)*100}%` }">
              <span class="grid-label">{{ Math.round((maxRevenue * i / 5) / 100) * 100 }}</span>
            </div>
          </div>

          <!-- Линия графика -->
          <svg class="line-svg" viewBox="0 0 720 220" preserveAspectRatio="none">
            <!-- Линия -->
            <polyline
              :points="monthlyRevenue.map((m, i) => `${(i * 60) + 30},${chartHeight - (m.revenue / maxRevenue) * chartHeight}`).join(' ')"
              fill="none"
              stroke="#667eea"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <!-- Точки -->
            <circle
              v-for="(m, i) in monthlyRevenue"
              :key="i"
              :cx="(i * 60) + 30"
              :cy="chartHeight - (m.revenue / maxRevenue) * chartHeight"
              r="5"
              fill="#667eea"
              @mouseenter="hoveredItem = { type: 'line', index: i, value: m.revenue, label: m.month }"
              @mouseleave="hoveredItem = null"
              class="chart-point"
            />
            <!-- Область под графиком -->
            <polygon
              :points="`0,${chartHeight} ` + monthlyRevenue.map((m, i) => `${(i * 60) + 30},${chartHeight - (m.revenue / maxRevenue) * chartHeight}`).join(' ') + ` 710,${chartHeight}`"
              fill="url(#gradient)"
              opacity="0.3"
            />
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#667eea" />
                <stop offset="100%" stop-color="#764ba2" stop-opacity="0" />
              </linearGradient>
            </defs>
          </svg>

          <!-- Подписи месяцев -->
          <div class="x-labels">
            <span v-for="m in monthlyRevenue" :key="m.month" class="x-label">
              {{ m.month.slice(0, 3) }}
            </span>
          </div>
        </div>

        <!-- Tooltip -->
        <div v-if="hoveredItem && hoveredItem.type === 'line'" class="tooltip">
          <strong>{{ hoveredItem.label }}</strong><br />
          Выручка: {{ hoveredItem.value.toLocaleString('ru-RU') }} тыс. руб.
        </div>
      </div>
    </div>

    <!-- ГИСТОГРАММА -->
    <div v-if="activeChart === 'bar'" class="chart-container">
      <h3>Количество перевезённых пассажиров по месяцам (тыс.)</h3>
      <div class="bar-chart">
        <div class="chart-area">
          <!-- Горизонтальные линии сетки -->
          <div class="grid-lines">
            <div v-for="i in 5" :key="i" class="grid-line" :style="{ bottom: `${(i/5)*100}%` }">
              <span class="grid-label">{{ Math.round((maxPassengers * i / 5) / 10000) * 10 }}т</span>
            </div>
          </div>

          <!-- Столбцы -->
          <div class="bars-container">
            <div v-for="(m, i) in monthlyRevenue" :key="i" class="bar-wrapper">
              <div 
                class="bar"
                :style="{ height: `${(m.passengers / maxPassengers) * 100}%`, background: `hsl(${230 + i * 10}, 70%, 60%)` }"
                @mouseenter="hoveredItem = { type: 'bar', index: i, value: m.passengers, label: m.month }"
                @mouseleave="hoveredItem = null"
              >
                <span class="bar-value">{{ (m.passengers / 1000).toFixed(0) }}т</span>
              </div>
              <span class="bar-label">{{ m.month.slice(0, 3) }}</span>
            </div>
          </div>
        </div>

        <!-- Tooltip -->
        <div v-if="hoveredItem && hoveredItem.type === 'bar'" class="tooltip">
          <strong>{{ hoveredItem.label }}</strong><br />
          Пассажиров: {{ (hoveredItem.value / 1000).toFixed(0) }} тыс.
        </div>
      </div>
    </div>

    <!-- КРУГОВАЯ ДИАГРАММА -->
    <div v-if="activeChart === 'pie'" class="chart-container">
      <h3>Распределение выручки по маршрутам</h3>
      <div class="pie-chart-wrapper">
        <div class="pie-chart">
          <svg viewBox="-100 -100 200 200" width="300" height="300">
            <template v-for="(r, i) in routeRevenue" :key="i">
              <path
                :d="getPiePath(i, routeRevenue)"
                :fill="chartColors[i]"
                :stroke="white"
                stroke-width="2"
                @mouseenter="hoveredItem = { type: 'pie', index: i, data: r }"
                @mouseleave="hoveredItem = null"
                class="pie-slice"
              />
            </template>
            <!-- Центральный круг для donut-эффекта -->
            <circle cx="0" cy="0" r="30" fill="white" />
            <text x="0" y="5" text-anchor="middle" font-size="12" font-weight="bold" fill="#2c3e50">
              {{ (totalRouteRevenue / 1000).toFixed(0) }}т
            </text>
          </svg>
        </div>

        <!-- Легенда -->
        <div class="pie-legend">
          <div v-for="(r, i) in routeRevenue" :key="i" class="legend-item">
            <span class="legend-color" :style="{ background: chartColors[i] }"></span>
            <span class="legend-label">{{ r.route }}: {{ r.revenue.toLocaleString('ru-RU') }} тыс. руб. ({{ r.percent }}%)</span>
          </div>
        </div>

        <!-- Tooltip -->
        <div v-if="hoveredItem && hoveredItem.type === 'pie'" class="tooltip">
          <strong>{{ hoveredItem.data.route }}</strong><br />
          Выручка: {{ hoveredItem.data.revenue.toLocaleString('ru-RU') }} тыс. руб.<br />
          Доля: {{ hoveredItem.data.percent }}%
        </div>
      </div>
    </div>

    <!-- ТАБЛИЦА С ПОКАЗАТЕЛЯМИ -->
    <div v-if="activeChart === 'table'" class="chart-container">
      <h3>Аналитика показателей предприятия за год</h3>
      
      <!-- Основная таблица данных -->
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Месяц</th>
              <th>Выручка (тыс. руб.)</th>
              <th>Пассажиры (тыс.)</th>
              <th>Расходы на ГСМ (тыс. руб.)</th>
              <th>Кол-во рейсов</th>
              <th>Прибыль (тыс. руб.)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in monthlyRevenue" :key="m.month">
              <td><strong>{{ m.month }}</strong></td>
              <td>{{ m.revenue.toLocaleString('ru-RU') }}</td>
              <td>{{ (m.passengers / 1000).toFixed(0) }}</td>
              <td>{{ m.fuelCost.toLocaleString('ru-RU') }}</td>
              <td>{{ m.trips }}</td>
              <td :class="m.revenue - m.fuelCost > 2500 ? 'positive' : 'negative'">
                {{ (m.revenue - m.fuelCost).toLocaleString('ru-RU') }}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="summary-row">
              <td><strong>ИТОГО / СРЕДНЕЕ</strong></td>
              <td>{{ stats.revenue.sum.toLocaleString('ru-RU') }}</td>
              <td>{{ (stats.passengers.sum / 1000).toFixed(0) }}</td>
              <td>{{ stats.fuelCost.sum.toLocaleString('ru-RU') }}</td>
              <td>{{ stats.trips.sum }}</td>
              <td>{{ stats.profit.sum.toLocaleString('ru-RU') }}</td>
            </tr>
            <tr class="avg-row">
              <td><strong>СРЕДНЕЕ В МЕСЯЦ</strong></td>
              <td>{{ stats.revenue.avg.toLocaleString('ru-RU') }}</td>
              <td>{{ Math.round(stats.passengers.avg / 1000) }}</td>
              <td>{{ stats.fuelCost.avg.toLocaleString('ru-RU') }}</td>
              <td>{{ stats.trips.avg }}</td>
              <td>{{ stats.profit.avg.toLocaleString('ru-RU') }}</td>
            </tr>
            <tr class="min-row">
              <td><strong>МИНИМУМ</strong></td>
              <td>{{ stats.revenue.min.toLocaleString('ru-RU') }}</td>
              <td>{{ Math.round(stats.passengers.min / 1000) }}</td>
              <td>{{ stats.fuelCost.min.toLocaleString('ru-RU') }}</td>
              <td>{{ stats.trips.min }}</td>
              <td>{{ stats.profit.min.toLocaleString('ru-RU') }}</td>
            </tr>
            <tr class="max-row">
              <td><strong>МАКСИМУМ</strong></td>
              <td>{{ stats.revenue.max.toLocaleString('ru-RU') }}</td>
              <td>{{ Math.round(stats.passengers.max / 1000) }}</td>
              <td>{{ stats.fuelCost.max.toLocaleString('ru-RU') }}</td>
              <td>{{ stats.trips.max }}</td>
              <td>{{ stats.profit.max.toLocaleString('ru-RU') }}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Сводная таблица показателей -->
      <div class="stats-summary">
        <h3>Сводные показатели за год</h3>
        <div class="summary-cards">
          <div class="summary-card card-revenue">
            <h4>💰 Общая выручка</h4>
            <div class="card-value">{{ (stats.revenue.sum / 1000).toFixed(1) }} млн руб.</div>
            <div class="card-detail">
              Среднее: {{ (stats.revenue.avg / 1000).toFixed(1) }} млн | 
              Min: {{ (stats.revenue.min / 1000).toFixed(1) }} млн | 
              Max: {{ (stats.revenue.max / 1000).toFixed(1) }} млн
            </div>
          </div>
          <div class="summary-card card-passengers">
            <h4>👥 Всего пассажиров</h4>
            <div class="card-value">{{ (stats.passengers.sum / 1000000).toFixed(2) }} млн чел.</div>
            <div class="card-detail">
              Среднее: {{ Math.round(stats.passengers.avg / 1000) }} тыс. | 
              Min: {{ Math.round(stats.passengers.min / 1000) }} тыс. | 
              Max: {{ Math.round(stats.passengers.max / 1000) }} тыс.
            </div>
          </div>
          <div class="summary-card card-fuel">
            <h4>⛽ Расходы на ГСМ</h4>
            <div class="card-value">{{ (stats.fuelCost.sum / 1000).toFixed(1) }} млн руб.</div>
            <div class="card-detail">
              Среднее: {{ (stats.fuelCost.avg / 1000).toFixed(1) }} млн | 
              Min: {{ (stats.fuelCost.min / 1000).toFixed(1) }} млн | 
              Max: {{ (stats.fuelCost.max / 1000).toFixed(1) }} млн
            </div>
          </div>
          <div class="summary-card card-profit">
            <h4>📈 Чистая прибыль</h4>
            <div class="card-value">{{ (stats.profit.sum / 1000).toFixed(1) }} млн руб.</div>
            <div class="card-detail">
              Среднее: {{ (stats.profit.avg / 1000).toFixed(1) }} млн | 
              Min: {{ (stats.profit.min / 1000).toFixed(1) }} млн | 
              Max: {{ (stats.profit.max / 1000).toFixed(1) }} млн
            </div>
          </div>
          <div class="summary-card card-trips">
            <h4>🕐 Всего рейсов</h4>
            <div class="card-value">{{ stats.trips.sum.toLocaleString('ru-RU') }}</div>
            <div class="card-detail">
              Среднее: {{ stats.trips.avg }} | 
              Min: {{ stats.trips.min }} | 
              Max: {{ stats.trips.max }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    getPiePath(index, data) {
      const total = data.reduce((sum, d) => sum + d.revenue, 0)
      let startAngle = 0
      for (let i = 0; i < index; i++) {
        startAngle += (data[i].revenue / total) * 360
      }
      const endAngle = startAngle + (data[index].revenue / total) * 360

      const startRad = (startAngle - 90) * Math.PI / 180
      const endRad = (endAngle - 90) * Math.PI / 180

      const x1 = Math.cos(startRad) * 80
      const y1 = Math.sin(startRad) * 80
      const x2 = Math.cos(endRad) * 80
      const y2 = Math.sin(endRad) * 80

      const largeArc = (endAngle - startAngle) > 180 ? 1 : 0

      return `M 0 0 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`
    }
  }
}
</script>

<style scoped>
.monitoring {
  padding: 1rem;
}

h2 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

h3 {
  color: #34495e;
  margin-bottom: 1rem;
}

.chart-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.tab-btn {
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

.tab-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.tab-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
  color: white;
}

.chart-container {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
}

/* Линейная диаграмма */
.line-chart {
  position: relative;
}

.chart-area {
  position: relative;
  height: 250px;
  border-left: 2px solid #ddd;
  border-bottom: 2px solid #ddd;
  margin-left: 60px;
  margin-bottom: 40px;
}

.grid-lines {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.grid-line {
  position: absolute;
  left: 0;
  right: 0;
  border-top: 1px dashed #eee;
}

.grid-label {
  position: absolute;
  left: -55px;
  top: -8px;
  font-size: 0.75rem;
  color: #999;
}

.line-svg {
  width: 100%;
  height: 100%;
}

.chart-point {
  cursor: pointer;
  transition: r 0.2s;
}

.chart-point:hover {
  r: 8;
}

.x-labels {
  position: absolute;
  bottom: -35px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
}

.x-label {
  font-size: 0.8rem;
  color: #666;
}

/* Гистограмма */
.bar-chart {
  position: relative;
}

.bars-container {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 200px;
  padding: 0 10px;
}

.bar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  height: 100%;
  justify-content: flex-end;
}

.bar {
  width: 40px;
  min-height: 10px;
  border-radius: 4px 4px 0 0;
  cursor: pointer;
  position: relative;
  transition: all 0.3s;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 5px;
}

.bar:hover {
  opacity: 0.8;
  transform: scaleY(1.02);
}

.bar-value {
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
}

.bar-label {
  margin-top: 8px;
  font-size: 0.8rem;
  color: #666;
}

/* Круговая диаграмма */
.pie-chart-wrapper {
  position: relative;
  display: flex;
  gap: 2rem;
  align-items: center;
  flex-wrap: wrap;
}

.pie-chart {
  flex-shrink: 0;
}

.pie-slice {
  cursor: pointer;
  transition: transform 0.2s;
}

.pie-slice:hover {
  transform: scale(1.05);
}

.pie-legend {
  flex: 1;
  min-width: 250px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  flex-shrink: 0;
}

.legend-label {
  font-size: 0.9rem;
  color: #555;
}

/* Tooltip */
.tooltip {
  position: fixed;
  background: #34495e;
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  z-index: 1000;
  pointer-events: none;
}

/* Таблица */
.table-wrapper {
  overflow-x: auto;
  margin-bottom: 2rem;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.data-table th,
.data-table td {
  padding: 0.75rem;
  text-align: right;
  border-bottom: 1px solid #eee;
}

.data-table th {
  background: #34495e;
  color: white;
  font-weight: 600;
  text-align: center;
}

.data-table th:first-child,
.data-table td:first-child {
  text-align: left;
}

.data-table tbody tr:hover {
  background: #f8f9fa;
}

.positive {
  color: #2ecc71;
  font-weight: bold;
}

.negative {
  color: #e74c3c;
  font-weight: bold;
}

tfoot tr {
  background: #f8f9fa;
}

.summary-row td {
  font-weight: bold;
  border-top: 2px solid #34495e;
}

.avg-row td,
.min-row td,
.max-row td {
  font-weight: 500;
}

/* Карточки сводки */
.stats-summary h3 {
  margin-top: 2rem;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.summary-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  padding: 1.5rem;
  border-radius: 12px;
  border-left: 4px solid #667eea;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: transform 0.2s;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.card-revenue { border-left-color: #667eea; }
.card-passengers { border-left-color: #2ecc71; }
.card-fuel { border-left-color: #f39c12; }
.card-profit { border-left-color: #27ae60; }
.card-trips { border-left-color: #3498db; }

.summary-card h4 {
  margin: 0 0 0.75rem 0;
  color: #555;
  font-size: 0.9rem;
}

.card-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.card-detail {
  font-size: 0.8rem;
  color: #777;
}

@media (max-width: 768px) {
  .chart-container {
    padding: 1rem;
  }

  .pie-chart-wrapper {
    flex-direction: column;
  }

  .summary-cards {
    grid-template-columns: 1fr;
  }
}
</style>
