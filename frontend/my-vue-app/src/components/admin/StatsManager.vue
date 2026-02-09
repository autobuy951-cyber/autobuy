<template>
  <div class="stats-manager">
    <!-- Header -->
    <div class="stats-header">
      <h2>📊 Statisztikák és Kimutatások</h2>
      <p class="stats-subtitle">Áttekintés az üzleti teljesítményről</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Statisztikák betöltése...</p>
    </div>

    <div v-else class="stats-content">
      <!-- Fő számok - KPI kártyák -->
      <div class="kpi-grid">
        <div class="kpi-card revenue">
          <div class="kpi-icon">💰</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ formatPrice(stats.bevetelek.mai) }} Ft</span>
            <span class="kpi-label">Mai bevétel</span>
          </div>
        </div>
        
        <div class="kpi-card revenue-month">
          <div class="kpi-icon">📅</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ formatPrice(stats.bevetelek.havi) }} Ft</span>
            <span class="kpi-label">Havi bevétel</span>
          </div>
        </div>
        
        <div class="kpi-card revenue-year">
          <div class="kpi-icon">📆</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ formatPrice(stats.bevetelek.eves) }} Ft</span>
            <span class="kpi-label">Éves bevétel</span>
          </div>
        </div>
        
        <div class="kpi-card revenue-total">
          <div class="kpi-icon">💎</div>
          <div class="kpi-content">
            <span class="kpi-value">{{ formatPrice(stats.bevetelek.osszes) }} Ft</span>
            <span class="kpi-label">Összes bevétel</span>
          </div>
        </div>
      </div>

      <!-- Foglalások és autók statisztikája -->
      <div class="stats-row">
        <div class="stats-card">
          <h3>🚗 Autók állapota</h3>
          <div class="stat-items">
            <div class="stat-item">
              <span class="stat-value">{{ stats.osszesAuto }}</span>
              <span class="stat-label">Összes autó</span>
            </div>
            <div class="stat-item available">
              <span class="stat-value">{{ stats.elerhetoAuto }}</span>
              <span class="stat-label">Elérhető</span>
            </div>
            <div class="stat-item rented">
              <span class="stat-value">{{ stats.osszesAuto - stats.elerhetoAuto }}</span>
              <span class="stat-label">Foglalt/Kölcsönözve</span>
            </div>
          </div>
        </div>

        <div class="stats-card">
          <h3>📋 Foglalások</h3>
          <div class="stat-items">
            <div class="stat-item">
              <span class="stat-value">{{ stats.osszesFoglalas }}</span>
              <span class="stat-label">Összes foglalás</span>
            </div>
            <div class="stat-item active">
              <span class="stat-value">{{ stats.aktivFoglalas }}</span>
              <span class="stat-label">Aktív</span>
            </div>
            <div class="stat-item future">
              <span class="stat-value">{{ stats.jovobeliFoglalas }}</span>
              <span class="stat-label">Jövőbeli</span>
            </div>
            <div class="stat-item expired">
              <span class="stat-value">{{ stats.lejartFoglalas }}</span>
              <span class="stat-label">Lejárt</span>
            </div>
          </div>
        </div>

        <div class="stats-card">
          <h3>👥 Ügyfelek</h3>
          <div class="stat-items">
            <div class="stat-item">
              <span class="stat-value">{{ stats.osszesUgyfel }}</span>
              <span class="stat-label">Összes ügyfél</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Havi bevétel grafikon -->
      <div class="stats-card chart-card">
        <h3>📈 Havi bevétel - {{ currentYear }}</h3>
        <div class="chart-container">
          <div class="bar-chart">
            <div 
              v-for="(month, index) in stats.haviBontas" 
              :key="index"
              class="bar-item"
            >
              <div class="bar-wrapper">
                <div 
                  class="bar" 
                  :style="{ height: getBarHeight(month.bevetel) + '%' }"
                  :title="formatPrice(month.bevetel) + ' Ft'"
                ></div>
              </div>
              <span class="bar-label">{{ month.honap }}</span>
              <span class="bar-value">{{ formatShortPrice(month.bevetel) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Legnépszerűbb autók -->
      <div class="stats-card">
        <h3>🏆 Legnépszerűbb autók (Top 5)</h3>
        <div class="top-cars-list">
          <div 
            v-for="(car, index) in stats.legnepszerubbAutok" 
            :key="car.autoId"
            class="top-car-item"
          >
            <div class="rank">#{{ index + 1 }}</div>
            <div class="car-info">
              <span class="car-name">{{ car.marka }} {{ car.modell }}</span>
              <span class="car-plate">{{ car.rendszam }}</span>
            </div>
            <div class="car-stats">
              <div class="stat">
                <span class="stat-count">{{ car.foglalasokSzama }}</span>
                <span class="stat-text">foglalás</span>
              </div>
              <div class="stat">
                <span class="stat-revenue">{{ formatPrice(car.osszesBevetel) }} Ft</span>
                <span class="stat-text">bevétel</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Frissítés gomb -->
      <div class="refresh-section">
        <button @click="fetchStats" class="btn-refresh" :disabled="loading">
          🔄 Statisztikák frissítése
        </button>
        <span class="last-updated">Utoljára frissítve: {{ lastUpdated }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StatsManager',
  data() {
    return {
      loading: false,
      lastUpdated: '-',
      currentYear: new Date().getFullYear(),
      stats: {
        osszesAuto: 0,
        elerhetoAuto: 0,
        osszesFoglalas: 0,
        aktivFoglalas: 0,
        lejartFoglalas: 0,
        jovobeliFoglalas: 0,
        osszesUgyfel: 0,
        bevetelek: {
          mai: 0,
          havi: 0,
          eves: 0,
          osszes: 0
        },
        haviBontas: [],
        legnepszerubbAutok: []
      },
      maxRevenue: 0
    }
  },
  mounted() {
    this.fetchStats();
  },
  methods: {
    async fetchStats() {
      this.loading = true;
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Hiba az adatok lekérésekor');

        const data = await response.json();
        this.stats = data;
        
        // Maximum bevétel kiszámítása a grafikonhoz
        this.maxRevenue = Math.max(...data.haviBontas.map(m => m.bevetel), 1);
        
        // Időbélyeg frissítése
        const now = new Date();
        this.lastUpdated = now.toLocaleString('hu-HU');
      } catch (error) {
        console.error('Hiba a statisztikák betöltésekor:', error);
        alert('Nem sikerült betölteni a statisztikákat');
      } finally {
        this.loading = false;
      }
    },
    formatPrice(price) {
      if (!price) return '0';
      return new Intl.NumberFormat('hu-HU').format(price);
    },
    formatShortPrice(price) {
      if (!price) return '0';
      if (price >= 1000000) {
        return (price / 1000000).toFixed(1) + 'M';
      } else if (price >= 1000) {
        return (price / 1000).toFixed(0) + 'k';
      }
      return price.toString();
    },
    getBarHeight(revenue) {
      if (!revenue || this.maxRevenue === 0) return 0;
      return Math.max((revenue / this.maxRevenue) * 100, 5); // Min 5% magasság
    }
  }
}
</script>

<style scoped>
.stats-manager {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.stats-header {
  margin-bottom: 30px;
}

.stats-header h2 {
  margin: 0 0 8px 0;
  color: #ffffff;
  font-size: 28px;
}

.stats-subtitle {
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.loading-state {
  text-align: center;
  padding: 60px;
  color: rgba(255, 255, 255, 0.7);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: #ff4757;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* KPI Kártyák */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.kpi-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.kpi-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.kpi-icon {
  font-size: 40px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.kpi-content {
  display: flex;
  flex-direction: column;
}

.kpi-value {
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
}

.kpi-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 4px;
}

.kpi-card.revenue .kpi-icon { background: rgba(46, 213, 115, 0.2); }
.kpi-card.revenue-month .kpi-icon { background: rgba(55, 66, 250, 0.2); }
.kpi-card.revenue-year .kpi-icon { background: rgba(255, 165, 2, 0.2); }
.kpi-card.revenue-total .kpi-icon { background: rgba(255, 71, 87, 0.2); }

/* Stats Row */
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stats-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stats-card h3 {
  margin: 0 0 20px 0;
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
}

.stat-items {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  min-width: 80px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
}

.stat-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 4px;
}

.stat-item.available .stat-value { color: #2ed573; }
.stat-item.rented .stat-value { color: #ff4757; }
.stat-item.active .stat-value { color: #2ed573; }
.stat-item.future .stat-value { color: #3742fa; }
.stat-item.expired .stat-value { color: #ff4757; }

/* Chart Card */
.chart-card {
  margin-bottom: 30px;
}

.chart-container {
  height: 300px;
  padding: 20px 0;
}

.bar-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 100%;
  gap: 10px;
}

.bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 40px;
}

.bar-wrapper {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: flex-end;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px 8px 0 0;
  overflow: hidden;
}

.bar {
  width: 100%;
  background: linear-gradient(180deg, #ff4757 0%, #ff6b81 100%);
  border-radius: 8px 8px 0 0;
  transition: all 0.3s ease;
  min-height: 5px;
}

.bar:hover {
  background: linear-gradient(180deg, #ff6b81 0%, #ff4757 100%);
  filter: brightness(1.2);
}

.bar-label {
  margin-top: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
}

.bar-value {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 2px;
}

/* Top Cars List */
.top-cars-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.top-car-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.2s;
}

.top-car-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(4px);
}

.rank {
  font-size: 24px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.3);
  width: 40px;
  text-align: center;
}

.top-car-item:nth-child(1) .rank { color: #ffd700; }
.top-car-item:nth-child(2) .rank { color: #c0c0c0; }
.top-car-item:nth-child(3) .rank { color: #cd7f32; }

.car-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.car-name {
  font-weight: 600;
  color: #ffffff;
  font-size: 16px;
}

.car-plate {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  font-family: monospace;
}

.car-stats {
  display: flex;
  gap: 30px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.stat-count {
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
}

.stat-revenue {
  font-size: 16px;
  font-weight: 600;
  color: #2ed573;
}

.stat-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

/* Refresh Section */
.refresh-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-refresh {
  background: linear-gradient(135deg, #3742fa 0%, #5352ed 100%);
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-refresh:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(55, 66, 250, 0.4);
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.last-updated {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

/* Responsive */
@media (max-width: 768px) {
  .kpi-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-row {
    grid-template-columns: 1fr;
  }
  
  .bar-chart {
    gap: 4px;
  }
  
  .bar-label {
    font-size: 10px;
  }
  
  .top-car-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .car-stats {
    width: 100%;
    justify-content: space-between;
  }
}

/* Reszponzív stílusok mobil eszközökhöz - további optimalizálások */
@media (max-width: 768px) {
  .stats-manager {
    padding: 10px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  
  .stat-card {
    padding: 15px;
  }
  
  .stat-value {
    font-size: 24px;
  }
  
  .stat-label {
    font-size: 12px;
  }
  
  .charts-container {
    grid-template-columns: 1fr;
  }
  
  .chart-card {
    padding: 15px;
  }
  
  .chart-card h3 {
    font-size: 16px;
  }
  
  .filter-controls {
    flex-direction: column;
    gap: 10px;
  }
  
  .filter-group {
    width: 100%;
  }
  
  .filter-group select {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .bar-chart {
    gap: 2px;
  }
  
  .bar-label {
    font-size: 9px;
    transform: rotate(-45deg);
    transform-origin: left center;
  }
}
</style>
