<template>
  <div class="customer-history">
    <div class="history-header">
      <h2>📋 Ügyfél Előzmények</h2>
      <p class="subtitle">Ügyfél foglalási történetének megtekintése</p>
    </div>

    <!-- Ügyfél keresés -->
    <div class="search-section">
      <div class="search-box">
        <i class="search-icon">🔍</i>
        <input 
          type="text" 
          v-model="searchQuery" 
          @input="debouncedSearch"
          placeholder="Keresés ügyfél név alapján..."
        >
      </div>
    </div>

    <!-- Ügyfél lista (keresés eredménye) -->
    <div v-if="showSearchResults && searchResults.length > 0" class="search-results">
      <div class="results-header">
        <h3>Találatok:</h3>
        <button @click="showSearchResults = false" class="btn-close">✕</button>
      </div>
      <div class="results-list">
        <div 
          v-for="customer in searchResults" 
          :key="customer.ID"
          @click="selectCustomer(customer)"
          class="result-item"
        >
          <span class="customer-name">{{ customer.Nev }}</span>
          <span class="customer-phone">{{ customer.Telefonszam }}</span>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Adatok betöltése...</p>
    </div>

    <!-- Ügyfél adatok és történet -->
    <div v-else-if="selectedCustomer" class="customer-details">
      <!-- Ügyfél kártya -->
      <div class="customer-card">
        <div class="customer-avatar">
          {{ getMonogram(selectedCustomer.ugyfel.nev) }}
        </div>
        <div class="customer-info">
          <h3>{{ selectedCustomer.ugyfel.nev }}</h3>
          <p><strong>📧 Email:</strong> {{ selectedCustomer.ugyfel.email }}</p>
          <p><strong>📱 Telefon:</strong> {{ selectedCustomer.ugyfel.telefon }}</p>
          <p v-if="selectedCustomer.ugyfel.cim"><strong>📍 Cím:</strong> {{ selectedCustomer.ugyfel.cim }}</p>
          <p v-if="selectedCustomer.ugyfel.igSzam"><strong>🆔 Ig. szám:</strong> {{ selectedCustomer.ugyfel.igSzam }}</p>
        </div>
        <div class="customer-stats">
          <div class="stat-box">
            <span class="stat-number">{{ selectedCustomer.stats.osszesFoglalas }}</span>
            <span class="stat-label">Összes foglalás</span>
          </div>
          <div class="stat-box">
            <span class="stat-number">{{ selectedCustomer.stats.befejezettFoglalas }}</span>
            <span class="stat-label">Befejezett</span>
          </div>
          <div class="stat-box">
            <span class="stat-number">{{ formatPrice(selectedCustomer.stats.osszesKoltseg) }} Ft</span>
            <span class="stat-label">Összes költség</span>
          </div>
        </div>
      </div>

      <!-- Foglalások lista -->
      <div class="bookings-section">
        <h3>🚗 Foglalási Történet</h3>
        
        <div v-if="selectedCustomer.foglalasok.length === 0" class="no-bookings">
          <p>Ennek az ügyfélnek még nincs foglalása.</p>
        </div>

        <div v-else class="bookings-list">
          <div 
            v-for="booking in selectedCustomer.foglalasok" 
            :key="booking.foglalasId"
            class="booking-card"
          >
            <div class="booking-header">
              <div class="booking-id">#{{ booking.foglalasId }}</div>
              <div class="booking-status" :class="getBookingStatusClass(booking)">
                {{ getBookingStatusLabel(booking) }}
              </div>
            </div>

            <div class="booking-content">
              <!-- Autó adatok -->
              <div class="car-section" v-if="booking.auto">
                <div class="car-icon">🚗</div>
                <div class="car-details">
                  <h4>{{ booking.auto.marka }} {{ booking.auto.modell }}</h4>
                  <p class="car-plate">Rendszám: {{ booking.auto.rendszam }}</p>
                  <p class="car-year">Évjárat: {{ booking.auto.evjarat }}</p>
                  <p class="car-status">Autó állapota: 
                    <span :class="['auto-status', booking.auto.allapot]">{{ getAutoStatusLabel(booking.auto.allapot) }}</span>
                  </p>
                </div>
              </div>

              <!-- Időpontok -->
              <div class="dates-section">
                <div class="date-row">
                  <span class="date-label">Tervezett időszak:</span>
                  <span class="date-value">{{ formatDate(booking.tervezettKezdet) }} - {{ formatDate(booking.tervezettVeg) }}</span>
                </div>
                <div class="date-row" v-if="booking.valosElvitel">
                  <span class="date-label">Valós elvitel:</span>
                  <span class="date-value actual">{{ formatDate(booking.valosElvitel) }}</span>
                </div>
                <div class="date-row" v-if="booking.valosVisszahozatal">
                  <span class="date-label">Valós visszahozatal:</span>
                  <span class="date-value actual">{{ formatDate(booking.valosVisszahozatal) }}</span>
                </div>
              </div>

              <!-- Ár -->
              <div class="price-section">
                <span class="price-label">Fizetett összeg:</span>
                <span class="price-value">{{ formatPrice(booking.ar) }} Ft</span>
              </div>

              <!-- Megjegyzés -->
              <div v-if="booking.megjegyzes" class="booking-note note-text">
                📝 {{ booking.megjegyzes }}
              </div>
              <div v-else-if="!booking.elvitve" class="booking-note">
                ⏳ Még nem vette át az autót
              </div>
              <div v-else-if="!booking.visszahozva" class="booking-note active">
                🚗 Jelenleg kölcsönzés alatt
              </div>
              <div v-else class="booking-note completed">
                ✅ Befejezett kölcsönzés
              </div>
            </div>
          </div>
        </div>
      </div>

      <button @click="clearSelection" class="btn-back">← Vissza a kereséshez</button>
    </div>

    <!-- Kezdeti állapot -->
    <div v-else class="initial-state">
      <div class="info-box">
        <p>🔍 Kezdje el gépelni az ügyfél nevét a kereséshez</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CustomerHistory',
  data() {
    return {
      searchQuery: '',
      searchResults: [],
      showSearchResults: false,
      selectedCustomer: null,
      loading: false
    }
  },
  beforeUnmount() {
    clearTimeout(this._timer);
  },
  methods: {
    debouncedSearch() {
      clearTimeout(this._timer);
      this._timer = setTimeout(() => {
        this.searchCustomers();
      }, 300);
    },
    async searchCustomers() {
      if (!this.searchQuery || this.searchQuery.length < 2) {
        this.searchResults = [];
        this.showSearchResults = false;
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `http://localhost:3000/api/ugyfelek/search?q=${encodeURIComponent(this.searchQuery)}&limit=10`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );

        if (response.ok) {
          this.searchResults = await response.json();
          this.showSearchResults = true;
        }
      } catch (error) {
        console.error('Hiba a keresés során:', error);
      }
    },
    async selectCustomer(customer) {
      this.loading = true;
      this.showSearchResults = false;
      this.searchQuery = customer.Nev;

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `http://localhost:3000/api/ugyfelek/${customer.ID}/history`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );

        if (response.ok) {
          this.selectedCustomer = await response.json();
        } else {
          alert('Hiba történt az adatok betöltésekor');
        }
      } catch (error) {
        console.error('Hiba:', error);
        alert('Hálózati hiba történt');
      } finally {
        this.loading = false;
      }
    },
    clearSelection() {
      this.selectedCustomer = null;
      this.searchQuery = '';
      this.searchResults = [];
    },
    getMonogram(name) {
      if (!name) return '?';
      return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    },
    formatDate(dateStr) {
      if (!dateStr) return '-';
      return new Date(dateStr).toLocaleDateString('hu-HU');
    },
    formatPrice(price) {
      if (!price) return '0';
      return new Intl.NumberFormat('hu-HU').format(price);
    },
    getBookingStatusClass(booking) {
      if (booking.visszahozva) return 'completed';
      if (booking.elvitve) return 'active';
      return 'pending';
    },
    getBookingStatusLabel(booking) {
      if (booking.visszahozva) return 'Befejezett';
      if (booking.elvitve) return 'Aktív';
      return 'Várakozik';
    },
    getAutoStatusLabel(allapot) {
      const labels = {
        'elerheto': 'Elérhető',
        'szervizben': 'Szervizben',
        'foglalt': 'Foglalt',
        'serult': 'Sérült'
      };
      return labels[allapot] || allapot;
    }
  }
}
</script>

<style scoped>
.customer-history {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.history-header {
  margin-bottom: 24px;
}

.history-header h2 {
  margin: 0 0 8px 0;
  color: #ffffff;
  font-size: 24px;
}

.subtitle {
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

/* Keresés */
.search-section {
  margin-bottom: 24px;
}

.search-box {
  position: relative;
  max-width: 500px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
}

.search-box input {
  width: 100%;
  padding: 12px 12px 12px 40px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
  color: white;
  font-size: 16px;
}

.search-box input:focus {
  outline: none;
  border-color: #4facfe;
}

/* Keresési eredmények */
.search-results {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.results-header h3 {
  margin: 0;
  color: white;
  font-size: 16px;
}

.btn-close {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  font-size: 18px;
  padding: 4px;
}

.btn-close:hover {
  color: white;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.result-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(4px);
}

.customer-name {
  color: white;
  font-weight: 500;
}

.customer-phone {
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
}

/* Loading */
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

/* Ügyfél kártya */
.customer-card {
  display: flex;
  gap: 24px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.customer-avatar {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}

.customer-info {
  flex: 1;
}

.customer-info h3 {
  margin: 0 0 12px 0;
  color: white;
  font-size: 22px;
}

.customer-info p {
  margin: 6px 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.customer-stats {
  display: flex;
  gap: 16px;
}

.stat-box {
  background: rgba(0, 0, 0, 0.2);
  padding: 16px 20px;
  border-radius: 12px;
  text-align: center;
  min-width: 100px;
}

.stat-number {
  display: block;
  font-size: 20px;
  font-weight: 700;
  color: white;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 4px;
}

/* Foglalások */
.bookings-section h3 {
  color: white;
  margin: 0 0 16px 0;
  font-size: 18px;
}

.no-bookings {
  text-align: center;
  padding: 40px;
  color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.bookings-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.booking-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.booking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.2);
}

.booking-id {
  font-family: monospace;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.booking-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.booking-status.pending {
  background: rgba(255, 165, 2, 0.15);
  color: #ffa502;
}

.booking-status.active {
  background: rgba(55, 66, 250, 0.15);
  color: #3742fa;
}

.booking-status.completed {
  background: rgba(46, 213, 115, 0.15);
  color: #2ed573;
}

.booking-content {
  padding: 16px;
}

/* Autó szekció */
.car-section {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.car-icon {
  font-size: 40px;
}

.car-details h4 {
  margin: 0 0 8px 0;
  color: white;
  font-size: 18px;
}

.car-details p {
  margin: 4px 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
}

.car-plate, .car-year {
  font-family: monospace;
}

.auto-status {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.auto-status.elerheto {
  background: rgba(46, 213, 115, 0.15);
  color: #2ed573;
}

.auto-status.szervizben, .auto-status.serult {
  background: rgba(255, 71, 87, 0.15);
  color: #ff4757;
}

.auto-status.foglalt {
  background: rgba(255, 165, 2, 0.15);
  color: #ffa502;
}

/* Dátumok */
.dates-section {
  margin-bottom: 16px;
}

.date-row {
  display: flex;
  justify-content: space-between;
  margin: 6px 0;
  font-size: 14px;
}

.date-label {
  color: rgba(255, 255, 255, 0.5);
}

.date-value {
  color: rgba(255, 255, 255, 0.9);
}

.date-value.actual {
  color: #4facfe;
  font-weight: 500;
}

/* Ár */
.price-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  margin-bottom: 12px;
}

.price-label {
  color: rgba(255, 255, 255, 0.6);
}

.price-value {
  font-size: 18px;
  font-weight: 700;
  color: #2ed573;
}

/* Megjegyzések */
.booking-note {
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 13px;
  text-align: center;
}

.booking-note.active {
  background: rgba(55, 66, 250, 0.1);
  color: #3742fa;
}

.booking-note.completed {
  background: rgba(46, 213, 115, 0.1);
  color: #2ed573;
}

.booking-note.note-text {
  background: rgba(255, 165, 2, 0.1);
  color: #ffa502;
  text-align: left;
  border-left: 3px solid #ffa502;
}

/* Vissza gomb */
.btn-back {
  margin-top: 24px;
  padding: 12px 24px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Kezdeti állapot */
.initial-state {
  text-align: center;
  padding: 60px 20px;
}

.info-box {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 30px;
  color: rgba(255, 255, 255, 0.6);
}

/* Responsive */
@media (max-width: 768px) {
  .customer-history {
    padding: 10px;
  }
  
  .search-section {
    margin-bottom: 20px;
  }
  
  .customer-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 15px;
  }

  .customer-stats {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .stat-item {
    min-width: 80px;
  }

  .car-section {
    flex-direction: column;
  }
  
  .car-image {
    width: 100%;
    height: 160px;
  }
  
  .section-header h2 {
    font-size: 18px;
  }
  
  .reservation-card,
  .history-card {
    padding: 15px;
  }
  
  .reservation-header,
  .history-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .modal {
    width: 95%;
    padding: 20px;
    max-height: 90vh;
    overflow-y: auto;
  }
}

@media (max-width: 480px) {
  .customer-avatar {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }
  
  .customer-name {
    font-size: 16px;
  }
  
  .timeline-content {
    padding: 12px;
  }
  
  .timeline-date {
    font-size: 11px;
  }
}
</style>
