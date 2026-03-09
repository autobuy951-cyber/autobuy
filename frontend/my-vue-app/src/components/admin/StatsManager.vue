<template>
  <div class="stats-dashboard">
    <div class="dashboard-header">
      <div class="header-content">
        <h1>📊 Statisztikák</h1>
        <p class="subtitle">Részletes kimutatások és elemzések</p>
      </div>
      <div class="header-actions">
        <button @click="fetchStats" class="btn-refresh" :disabled="loading">
          <span v-if="loading" class="btn-spinner"></span>
          <span v-else>🔄 Frissítés</span>
        </button>
        <span class="last-updated">{{ lastUpdated }}</span>
      </div>
    </div>

    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>Adatok betöltése...</p>
    </div>

    <div v-else class="dashboard-content">
      <div class="kpi-section">
        <div class="kpi-card primary" @mouseenter="hoverCard" @mouseleave="unhoverCard">
          <div class="kpi-bg-icon">💰</div>
          <div class="kpi-content">
            <span class="kpi-label">Összes bevétel</span>
            <span class="kpi-value">{{ formatPrice(stats.bevetelek.osszes) }} Ft</span>
            <span class="kpi-trend positive">↑ Teljes időszak</span>
          </div>
        </div>

        <div class="kpi-card success" @mouseenter="hoverCard" @mouseleave="unhoverCard">
          <div class="kpi-bg-icon">📅</div>
          <div class="kpi-content">
            <span class="kpi-label">Éves bevétel</span>
            <span class="kpi-value">{{ formatPrice(stats.bevetelek.eves) }} Ft</span>
            <span class="kpi-trend">{{ currentYear }}</span>
          </div>
        </div>

        <div class="kpi-card warning" @mouseenter="hoverCard" @mouseleave="unhoverCard">
          <div class="kpi-bg-icon">📆</div>
          <div class="kpi-content">
            <span class="kpi-label">Havi bevétel</span>
            <span class="kpi-value">{{ formatPrice(stats.bevetelek.havi) }} Ft</span>
            <span class="kpi-trend">{{ currentMonthName }}</span>
          </div>
        </div>

        <div class="kpi-card info" @mouseenter="hoverCard" @mouseleave="unhoverCard">
          <div class="kpi-bg-icon">🚗</div>
          <div class="kpi-content">
            <span class="kpi-label">Elérhető autók</span>
            <span class="kpi-value">{{ stats.elerhetoAuto }} / {{ stats.osszesAuto }}</span>
            <span class="kpi-trend">{{ Math.round((stats.elerhetoAuto / stats.osszesAuto) * 100) || 0 }}% elérhető</span>
          </div>
        </div>
      </div>

      <div class="charts-section">
        <div class="chart-card main-chart">
          <div class="chart-header">
            <h3>📈 Havi bevétel - {{ currentYear }}</h3>
            <div class="chart-legend">
              <span class="legend-item">
                <span class="legend-dot" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"></span>
                Bevétel
              </span>
            </div>
          </div>
          <div class="chart-body">
            <div class="bar-chart-container">
              <div class="y-axis">
                <span v-for="n in 5" :key="n">{{ formatShortPrice(maxRevenue * (6 - n) / 5) }}</span>
              </div>
              <div class="bars-wrapper">
                <div class="grid-lines">
                  <div v-for="n in 5" :key="n" class="grid-line"></div>
                </div>
                <div class="bars">
                  <div 
                    v-for="(month, index) in stats.haviBontas" 
                    :key="index"
                    class="bar-column"
                    @mouseenter="showTooltip($event, month)"
                    @mouseleave="hideTooltip"
                  >
                    <div class="bar-container">
                      <div 
                        class="bar" 
                        :style="{ height: getBarHeight(month.bevetel) + '%' }"
                        :class="{ 'has-value': month.bevetel > 0 }"
                      ></div>
                    </div>
                    <span class="month-label">{{ month.honap }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="secondary-section">
        <div class="stats-card bookings-card">
          <h3>📋 Foglalások</h3>
          <div class="stat-list">
            <div class="stat-row">
              <div class="stat-icon blue">📊</div>
              <div class="stat-info">
                <span class="stat-name">Összes foglalás</span>
                <span class="stat-value">{{ stats.osszesFoglalas }}</span>
              </div>
            </div>
            <div class="stat-row">
              <div class="stat-icon green">✅</div>
              <div class="stat-info">
                <span class="stat-name">Aktív foglalások</span>
                <span class="stat-value">{{ stats.aktivFoglalas }}</span>
              </div>
            </div>
            <div class="stat-row">
              <div class="stat-icon yellow">⏳</div>
              <div class="stat-info">
                <span class="stat-name">Jövőbeli foglalások</span>
                <span class="stat-value">{{ stats.jovobeliFoglalas }}</span>
              </div>
            </div>
            <div class="stat-row">
              <div class="stat-icon gray">📁</div>
              <div class="stat-info">
                <span class="stat-name">Lejárt foglalások</span>
                <span class="stat-value">{{ stats.lejartFoglalas }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="stats-card cars-card">
          <h3>🏆 Top 5 Autó</h3>
          <div class="top-cars-list">
            <div 
              v-for="(car, index) in stats.legnepszerubbAutok" 
              :key="car.autoId"
              class="top-car-item"
              :class="{ 'top-3': index < 3 }"
            >
              <div class="rank-badge" :class="'rank-' + (index + 1)">{{ index + 1 }}</div>
              <div class="car-details">
                <span class="car-name">{{ car.marka }} {{ car.modell }}</span>
                <span class="car-meta">{{ car.rendszam }} • {{ car.foglalasokSzama }} foglalás</span>
              </div>
              <div class="car-revenue">
                <span class="revenue-value">{{ formatShortPrice(car.osszesBevetel) }}</span>
              </div>
            </div>
            <div v-if="stats.legnepszerubbAutok.length === 0" class="no-data">
              Nincs adat
            </div>
          </div>
        </div>

        <div class="stats-card customers-card">
          <h3>👥 Ügyfelek</h3>
          <div class="big-number">
            <span class="number">{{ stats.osszesUgyfel }}</span>
            <span class="label">Regisztrált ügyfél</span>
          </div>
          <div class="mini-stats">
            <div class="mini-stat">
              <span class="mini-value">{{ stats.osszesFoglalas }}</span>
              <span class="mini-label">Foglalás</span>
            </div>
            <div class="mini-stat">
              <span class="mini-value">{{ stats.osszesAuto }}</span>
              <span class="mini-label">Autó</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="tooltip.visible" class="tooltip" :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }">
      <div class="tooltip-header">{{ tooltip.month }}. hónap</div>
      <div class="tooltip-value">{{ formatPrice(tooltip.value) }} Ft</div>
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
      currentMonthName: new Date().toLocaleString('hu-HU', { month: 'long' }),
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
      maxRevenue: 1,
      tooltip: {
        visible: false,
        x: 0,
        y: 0,
        month: '',
        value: 0
      }
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
        const response = await fetch('/api/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Hiba az adatok lekérésekor');

        const data = await response.json();
        this.stats = data;
        
        const max = Math.max(...data.haviBontas.map(m => m.bevetel), 1);
        this.maxRevenue = Math.ceil(max / 10000) * 10000;
        
        const now = new Date();
        this.lastUpdated = now.toLocaleString('hu-HU');
      } catch (error) {
        console.error('Hiba a statisztikák betöltésekor:', error);
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
      return Math.max((revenue / this.maxRevenue) * 100, 2);
    },
    showTooltip(event, month) {
      this.tooltip = {
        visible: true,
        x: event.clientX + 10,
        y: event.clientY - 60,
        month: month.honap,
        value: month.bevetel
      };
    },
    hideTooltip() {
      this.tooltip.visible = false;
    },
    hoverCard(e) {
      e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
    },
    unhoverCard(e) {
      e.currentTarget.style.transform = 'translateY(0) scale(1)';
    }
  }
}
</script>

<style scoped>
.stats-dashboard {
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
  background: linear-gradient(135deg, #1a1f2e 0%, #0d1117 100%);
  min-height: 100vh;
  border-radius: 24px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-content h1 {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  margin: 8px 0 0 0;
  color: rgba(255, 255, 255, 0.5);
  font-size: 16px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.btn-refresh {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-refresh:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.last-updated {
  color: rgba(255, 255, 255, 0.4);
  font-size: 14px;
}

.loading-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: rgba(255, 255, 255, 0.7);
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.kpi-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.kpi-card {
  position: relative;
  padding: 28px;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.kpi-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.3s;
}

.kpi-card:hover::before {
  opacity: 1;
}

.kpi-card.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.kpi-card.success {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.kpi-card.warning {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.kpi-card.info {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.kpi-bg-icon {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 80px;
  opacity: 0.15;
}

.kpi-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
}

.kpi-label {
  font-size: 14px;
  font-weight: 500;
  opacity: 0.9;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.kpi-value {
  font-size: 28px;
  font-weight: 700;
  color: white;
  margin-bottom: 8px;
}

.kpi-trend {
  font-size: 13px;
  opacity: 0.8;
}

.kpi-trend.positive {
  display: flex;
  align-items: center;
  gap: 4px;
}

.charts-section {
  margin-bottom: 32px;
}

.chart-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 28px;
  backdrop-filter: blur(10px);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.chart-header h3 {
  margin: 0;
  font-size: 20px;
  color: white;
  font-weight: 600;
}

.chart-legend {
  display: flex;
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.chart-body {
  height: 320px;
}

.bar-chart-container {
  display: flex;
  height: 100%;
  gap: 16px;
}

.y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 8px 0;
  color: rgba(255, 255, 255, 0.4);
  font-size: 12px;
  min-width: 50px;
  text-align: right;
}

.bars-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
}

.grid-lines {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 8px 0;
  pointer-events: none;
}

.grid-line {
  width: 100%;
  height: 1px;
  background: rgba(255, 255, 255, 0.05);
}

.bars {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
  position: relative;
  z-index: 1;
}

.bar-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.bar-column:hover {
  transform: scale(1.1);
  z-index: 10;
}

.bar-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-end;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px 8px 0 0;
  overflow: hidden;
}

.bar {
  width: 100%;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px 8px 0 0;
  transition: all 0.3s ease;
  min-height: 2px;
  opacity: 0.7;
}

.bar.has-value {
  opacity: 1;
}

.bar:hover {
  filter: brightness(1.2);
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.5);
}

.month-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 500;
}

.secondary-section {
  display: grid;
  grid-template-columns: 1fr 1.5fr 1fr;
  gap: 24px;
}

.stats-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 24px;
  backdrop-filter: blur(10px);
}

.stats-card h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: white;
  font-weight: 600;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.stat-row:hover {
  background: rgba(255, 255, 255, 0.06);
  transform: translateX(4px);
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.stat-icon.blue { background: rgba(102, 126, 234, 0.2); }
.stat-icon.green { background: rgba(17, 153, 142, 0.2); }
.stat-icon.yellow { background: rgba(240, 147, 251, 0.2); }
.stat-icon.gray { background: rgba(255, 255, 255, 0.1); }

.stat-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.stat-name {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: white;
}

.top-cars-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.top-car-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.top-car-item:hover {
  background: rgba(255, 255, 255, 0.06);
  transform: translateX(4px);
}

.rank-badge {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
}

.rank-badge.rank-1 {
  background: linear-gradient(135deg, #ffd700 0%, #ffb700 100%);
  color: #1a1f2e;
}

.rank-badge.rank-2 {
  background: linear-gradient(135deg, #c0c0c0 0%, #a0a0a0 100%);
  color: #1a1f2e;
}

.rank-badge.rank-3 {
  background: linear-gradient(135deg, #cd7f32 0%, #b87333 100%);
  color: white;
}

.car-details {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.car-name {
  font-weight: 600;
  color: white;
  font-size: 14px;
}

.car-meta {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.car-revenue {
  text-align: right;
}

.revenue-value {
  font-weight: 700;
  color: #38ef7d;
  font-size: 14px;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: rgba(255, 255, 255, 0.4);
}

.big-number {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 0;
}

.big-number .number {
  font-size: 56px;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.big-number .label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 8px;
}

.mini-stats {
  display: flex;
  gap: 16px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.mini-stat {
  flex: 1;
  text-align: center;
}

.mini-value {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: white;
}

.mini-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.tooltip {
  position: fixed;
  background: rgba(30, 30, 40, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px 16px;
  pointer-events: none;
  z-index: 1000;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
}

.tooltip-header {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 4px;
}

.tooltip-value {
  font-size: 16px;
  font-weight: 700;
  color: white;
}

@media (max-width: 1200px) {
  .secondary-section {
    grid-template-columns: 1fr 1fr;
  }
  
  .customers-card {
    grid-column: span 2;
  }
}

@media (max-width: 768px) {
  .stats-dashboard {
    padding: 16px;
  }
  
  .dashboard-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .header-content h1 {
    font-size: 24px;
  }
  
  .kpi-section {
    grid-template-columns: 1fr;
  }
  
  .secondary-section {
    grid-template-columns: 1fr;
  }
  
  .customers-card {
    grid-column: span 1;
  }
  
  .bar-chart-container {
    gap: 8px;
  }
  
  .bars {
    gap: 4px;
  }
  
  .month-label {
    font-size: 10px;
  }
}
</style>