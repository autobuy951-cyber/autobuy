<template>
  <div class="pickup-manager">
    <div class="toolbar">
      <div class="search-filters">
        <div class="input-group">
          <i class="search-icon">👤</i>
          <input
            type="text"
            v-model="filters.nameSearch"
            @input="debouncedFetch"
            placeholder="Ügyfél név keresése..."
          >
        </div>

        <div class="input-group">
          <i class="search-icon">📅</i>
          <input
            type="date"
            v-model="filters.dateSearch"
            @change="onDateFilterChange"
            placeholder="Dátum keresése..."
          >
        </div>

        <select v-model="filters.status" @change="onStatusFilterChange" class="filter-select">
          <option value="">Minden státusz</option>
          <option value="elvitelre_var">Elvitelre vár</option>
          <option value="elvitve">Elvitve</option>
          <option value="jovobeli">Jövőbeli</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Foglalások betöltése...</p>
    </div>

    <!-- Data Table -->
    <div v-else class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Foglalás ID</th>
            <th>Ügyfél</th>
            <th>Autó</th>
            <th>Tervezett elvitel</th>
            <th>Valós elvitel</th>
            <th>Tervezett visszahozatal</th>
            <th>Státusz</th>
            <th class="actions-col">Műveletek</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="booking in bookings" :key="booking.Foglalasokid">
            <td class="id-cell">#{{ booking.Foglalasokid }}</td>
            <td>
               <div class="user-info">
                 <span class="name">{{ booking.Ugyfel?.Nev || 'Ismeretlen' }}</span>
               </div>
            </td>
            <td>
              <div class="car-info">
                <span class="brand">{{ booking.Auto?.Marka }} {{ booking.Auto?.Modell }}</span>
                <span class="plate">{{ booking.Auto?.Rendszam }}</span>
              </div>
            </td>
            <td>
              <span class="date-cell">{{ formatDate(booking.foglalaskezdete) }}</span>
            </td>
            <td>
              <span :class="['date-cell', booking.valos_elvitel ? 'actual' : 'pending']">
                {{ booking.valos_elvitel ? formatDate(booking.valos_elvitel) : '-' }}
              </span>
            </td>
            <td>
              <span class="date-cell">{{ formatDate(booking.foglalas_vege) }}</span>
            </td>
            <td>
              <span :class="['status-badge', getPickupStatus(booking)]">
                {{ getPickupStatusLabel(booking) }}
              </span>
            </td>
            <td class="actions">
              <button 
                v-if="!booking.Elvitve && canPickup(booking)" 
                @click="openPickupModal(booking)" 
                class="btn-action pickup"
                title="Elvitel rögzítése"
              >
                🚗 Elvitel
              </button>
              <span v-else-if="booking.Elvitve" class="picked-up-text">✅ Elvitve</span>
              <span v-else class="not-ready-text">⏳ Még nem elérhető</span>
            </td>
          </tr>
          <tr v-if="bookings.length === 0">
            <td colspan="8" class="no-data">Nincs megjeleníthető foglalás.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination">
      <div class="pagination-info">
        Összesen: <strong>{{ pagination.total }}</strong> foglalás
      </div>
      <div class="pagination-controls">
        <button 
          @click="changePage(pagination.current - 1)" 
          :disabled="pagination.current === 1"
          class="btn-page"
        >
          &laquo;
        </button>
        <span class="page-current">{{ pagination.current }} / {{ pagination.totalPages }}</span>
        <button 
          @click="changePage(pagination.current + 1)" 
          :disabled="pagination.current === pagination.totalPages"
          class="btn-page"
        >
          &raquo;
        </button>
      </div>
    </div>

    <!-- Pickup Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h2>🚗 Elvitel rögzítése</h2>
        <div class="pickup-info" v-if="selectedBooking">
          <div class="info-row">
            <span class="label">Ügyfél:</span>
            <span class="value">{{ selectedBooking.Ugyfel?.Nev }}</span>
          </div>
          <div class="info-row">
            <span class="label">Autó:</span>
            <span class="value">{{ selectedBooking.Auto?.Marka }} {{ selectedBooking.Auto?.Modell }} ({{ selectedBooking.Auto?.Rendszam }})</span>
          </div>
          <div class="info-row">
            <span class="label">Tervezett elvitel:</span>
            <span class="value">{{ formatDate(selectedBooking.foglalaskezdete) }}</span>
          </div>
        </div>
        
        <form @submit.prevent="recordPickup">
          <div class="form-group">
            <label>Valós elvitel dátuma</label>
            <input type="date" v-model="pickupForm.valos_elvitel" required>
          </div>
          
          <div class="pickup-notice">
            <p>⚠️ Az elvitel rögzítése után a foglalás státusza "Elvitve" lesz.</p>
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn-secondary">Mégse</button>
            <button type="submit" class="btn-primary" :disabled="saving">
              <span v-if="saving">Rögzítés...</span>
              <span v-else>✅ Elvitel rögzítése</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PickupManager',
  data() {
    return {
      bookings: [],
      loading: false,
      showModal: false,
      selectedBooking: null,
      saving: false,
      filters: {
        nameSearch: '',
        dateSearch: '',
        status: ''
      },
      pagination: {
        current: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      },
      pickupForm: {
        valos_elvitel: ''
      }
    }
  },
  mounted() {
    this.fetchBookings();
    // Alapértelmezett dátum a mai nap
    this.pickupForm.valos_elvitel = new Date().toISOString().split('T')[0];
  },
  beforeUnmount() {
    clearTimeout(this._timer);
  },
  methods: {
    async fetchBookings() {
      this.loading = true;
      try {
        const token = localStorage.getItem('token');
        const params = new URLSearchParams({
          page: this.pagination.current,
          limit: this.pagination.limit,
          sort_by: 'Letrehozasdatuma',
          sort_order: 'DESC'
        });

        if (this.filters.nameSearch) params.append('name_search', this.filters.nameSearch);
        if (this.filters.dateSearch) params.append('date_search', this.filters.dateSearch);

        const response = await fetch(`http://localhost:3000/api/foglalasok?${params.toString()}`, {
           headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Hiba az adatok lekérésekor');

        const data = await response.json();
        this.bookings = data.data;
        this.pagination.total = data.total;
        this.pagination.totalPages = data.totalPages;

      } catch (error) {
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
    debouncedFetch() {
      clearTimeout(this._timer);
      this._timer = setTimeout(() => {
        this.pagination.current = 1;
        this.fetchBookings();
      }, 300);
    },
    onDateFilterChange() {
      this.pagination.current = 1;
      this.fetchBookings();
    },
    onStatusFilterChange() {
      this.pagination.current = 1;
      this.fetchBookings();
    },
    changePage(page) {
      if (page >= 1 && page <= this.pagination.totalPages) {
        this.pagination.current = page;
        this.fetchBookings();
      }
    },
    formatDate(dateStr) {
      if (!dateStr) return '-';
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleDateString('hu-HU');
    },
    canPickup(booking) {
      // Csak akkor lehet elviteli, ha a mai nap vagy korábbi a tervezett elvitel
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const plannedStart = new Date(booking.foglalaskezdete);
      return today >= plannedStart;
    },
    getPickupStatus(booking) {
      if (booking.Elvitve) return 'picked-up';
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const plannedStart = new Date(booking.foglalaskezdete);
      if (today < plannedStart) return 'future';
      return 'waiting';
    },
    getPickupStatusLabel(booking) {
      if (booking.Elvitve) return 'Elvitve';
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const plannedStart = new Date(booking.foglalaskezdete);
      if (today < plannedStart) return 'Jövőbeli';
      return 'Elvitelre vár';
    },
    openPickupModal(booking) {
      this.selectedBooking = booking;
      this.pickupForm.valos_elvitel = new Date().toISOString().split('T')[0];
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.selectedBooking = null;
    },
    async recordPickup() {
      if (!this.selectedBooking || this.saving) return;
      
      this.saving = true;
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `http://localhost:3000/api/foglalasok/${this.selectedBooking.Foglalasokid}/pickup`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              valos_elvitel: this.pickupForm.valos_elvitel
            })
          }
        );

        if (response.ok) {
          this.closeModal();
          this.fetchBookings();
          alert('Elvitel sikeresen rögzítve!');
        } else {
          const err = await response.json();
          alert(err.error || 'Hiba történt az elvitel rögzítésekor');
        }
      } catch (err) {
        console.error(err);
        alert('Hálózati hiba történt');
      } finally {
        this.saving = false;
      }
    }
  }
}
</script>

<style scoped>
.pickup-manager {
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.search-filters {
  display: flex;
  gap: 12px;
  flex: 1;
}

.input-group {
  position: relative;
  flex: 1;
  max-width: 300px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.5;
  pointer-events: none;
}

.input-group input {
  width: 100%;
  padding: 10px 10px 10px 36px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
  color: white;
  font-size: 14px;
}

.filter-select {
  padding: 10px 36px 10px 16px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  background: #000000 !important;
  color: #ffffff !important;
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ffffff' d='M6 9L1 4h10z'/%3E%3C/svg%3E") !important;
  background-repeat: no-repeat !important;
  background-position: right 12px center !important;
  appearance: none;
}

.loading-state {
  text-align: center;
  padding: 40px;
  color: rgba(255, 255, 255, 0.7);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #ff4757;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.data-table th, .data-table td {
  padding: 14px;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  vertical-align: middle;
}

.data-table th {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
}

.id-cell {
  font-family: monospace;
  color: #a0a0a0;
}

.user-info .name {
  font-weight: 500;
}

.car-info {
  display: flex;
  flex-direction: column;
}

.car-info .brand {
  font-weight: 600;
}

.car-info .plate {
  font-size: 0.85em;
  opacity: 0.7;
  font-family: monospace;
}

.date-cell {
  font-size: 0.9em;
}

.date-cell.actual {
  color: #2ed573;
  font-weight: 600;
}

.date-cell.pending {
  color: rgba(255, 255, 255, 0.5);
}

.status-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8em;
  font-weight: 500;
  text-transform: uppercase;
}

.status-badge.picked-up {
  background: rgba(46, 213, 115, 0.15);
  color: #2ed573;
  border: 1px solid rgba(46, 213, 115, 0.2);
}

.status-badge.waiting {
  background: rgba(255, 165, 2, 0.15);
  color: #ffa502;
  border: 1px solid rgba(255, 165, 2, 0.2);
}

.status-badge.future {
  background: rgba(55, 66, 250, 0.15);
  color: #3742fa;
  border: 1px solid rgba(55, 66, 250, 0.2);
}

.actions {
  display: flex;
  gap: 8px;
}

.btn-action {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 0.85em;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-action.pickup {
  background: linear-gradient(135deg, #2ed573 0%, #7bed9f 100%);
  color: white;
}

.btn-action.pickup:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(46, 213, 115, 0.4);
}

.picked-up-text {
  color: #2ed573;
  font-size: 0.85em;
  font-weight: 500;
}

.not-ready-text {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.85em;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: rgba(255, 255, 255, 0.3);
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.btn-page {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
}

.btn-page:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal {
  background: #1e1e1e;
  padding: 30px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  width: 90%;
  max-width: 500px;
}

.modal h2 {
  margin: 0 0 20px 0;
  color: white;
}

.pickup-info {
  background: rgba(255, 255, 255, 0.05);
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-row .label {
  color: rgba(255, 255, 255, 0.6);
}

.info-row .value {
  color: white;
  font-weight: 500;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #ccc;
}

.form-group input {
  width: 100%;
  padding: 10px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
}

.pickup-notice {
  background: rgba(255, 165, 2, 0.1);
  border: 1px solid rgba(255, 165, 2, 0.3);
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.pickup-notice p {
  margin: 0;
  color: #ffa502;
  font-size: 0.9em;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-secondary {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
}

.btn-primary {
  background: linear-gradient(135deg, #ff4757 0%, #ff6b81 100%);
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Reszponzív stílusok mobil eszközökhöz */
@media (max-width: 768px) {
  .pickup-manager {
    padding: 10px;
  }
  
  .toolbar {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .search-box {
    width: 100%;
  }
  
  .search-box input {
    width: 100%;
  }
  
  .table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  .data-table {
    min-width: 700px;
    font-size: 13px;
  }
  
  .modal {
    width: 95%;
    padding: 20px;
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .modal-actions {
    flex-direction: column-reverse;
    gap: 10px;
  }
  
  .modal-actions .btn-primary,
  .modal-actions .btn-secondary {
    width: 100%;
  }
}
</style>
