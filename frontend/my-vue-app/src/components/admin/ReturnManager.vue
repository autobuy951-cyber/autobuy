<template>
  <div class="return-manager">
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
          <option value="visszahozatalra_var">Visszahozatalra vár</option>
          <option value="visszahozva">Visszahozva</option>
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
            <th>Elvitel</th>
            <th>Tervezett visszahozatal</th>
            <th>Valós visszahozatal</th>
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
              <span class="date-cell">{{ formatDate(booking.valos_elvitel || booking.foglalaskezdete) }}</span>
            </td>
            <td>
              <span class="date-cell">{{ formatDate(booking.foglalas_vege) }}</span>
            </td>
            <td>
              <span :class="['date-cell', booking.valos_visszahozatal ? 'actual' : 'pending']">
                {{ booking.valos_visszahozatal ? formatDate(booking.valos_visszahozatal) : '-' }}
              </span>
            </td>
            <td>
              <span :class="['status-badge', getReturnStatus(booking)]">
                {{ getReturnStatusLabel(booking) }}
              </span>
            </td>
            <td class="actions">
              <button 
                v-if="canReturn(booking)" 
                @click="openReturnModal(booking)" 
                class="btn-action return"
                title="Visszahozatal rögzítése"
              >
                🔄 Visszahozatal
              </button>
              <span v-else-if="booking.Visszahozva" class="returned-text">✅ Visszahozva</span>
              <span v-else-if="!booking.Elvitve" class="not-ready-text">⏳ Még el sem vitték</span>
              <span v-else class="not-ready-text">-</span>
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

    <!-- Return Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h2>🔄 Visszahozatal rögzítése</h2>
        <div class="return-info" v-if="selectedBooking">
          <div class="info-row">
            <span class="label">Ügyfél:</span>
            <span class="value">{{ selectedBooking.Ugyfel?.Nev }}</span>
          </div>
          <div class="info-row">
            <span class="label">Autó:</span>
            <span class="value">{{ selectedBooking.Auto?.Marka }} {{ selectedBooking.Auto?.Modell }} ({{ selectedBooking.Auto?.Rendszam }})</span>
          </div>
          <div class="info-row">
            <span class="label">Elvitel dátuma:</span>
            <span class="value">{{ formatDate(selectedBooking.valos_elvitel) }}</span>
          </div>
          <div class="info-row">
            <span class="label">Tervezett visszahozatal:</span>
            <span class="value">{{ formatDate(selectedBooking.foglalas_vege) }}</span>
          </div>
        </div>
        
        <form @submit.prevent="recordReturn">
          <div class="form-row">
            <div class="form-group">
              <label>Valós visszahozatal dátuma</label>
              <input type="date" v-model="returnForm.valos_visszahozatal" required>
            </div>
            <div class="form-group">
              <label>Kilométer állás</label>
              <input type="number" v-model="returnForm.kilometer_veg" placeholder="Pl. 15000" min="0">
            </div>
          </div>

          <div class="form-group">
            <label>Autó állapota visszahozatal után</label>
            <select v-model="returnForm.autoAllapot" required>
              <option value="elerheto">✅ Elérhető (kölcsönözhető)</option>
              <option value="szervizben">🔧 Szervizben (nem kölcsönözhető)</option>
              <option value="serult">⚠️ Sérült (nem kölcsönözhető)</option>
            </select>
            <p class="form-hint">
              Ha az autó sérült vagy szervizben van, az nem lesz elérhető kölcsönzésre.
            </p>
          </div>

          <div class="form-group">
            <label>📝 Megjegyzés (opcionális)</label>
            <textarea 
              v-model="returnForm.megjegyzes" 
              rows="3" 
              placeholder="Pl. karcolás a bal első sárvédőn, belső tiszta, stb..."
            ></textarea>
            <p class="form-hint">
              Írjon be minden fontos megjegyzést az autó állapotáról, sérüléseiről vagy egyéb észrevételeiről.
            </p>
          </div>
          
          <div class="return-notice">
            <p>⚠️ A visszahozatal rögzítése után:</p>
            <ul>
              <li>A foglalás státusza "Visszahozva" lesz</li>
              <li>Az autó újra elérhetővé válik más foglalásokhoz</li>
            </ul>
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn-secondary">Mégse</button>
            <button type="submit" class="btn-primary" :disabled="saving">
              <span v-if="saving">Rögzítés...</span>
              <span v-else>✅ Visszahozatal rögzítése</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReturnManager',
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
      returnForm: {
        valos_visszahozatal: '',
        kilometer_veg: '',
        autoAllapot: 'elerheto',  // Alapértelmezett: elérhető
        megjegyzes: ''
      }
    }
  },
  mounted() {
    this.fetchBookings();
    this.returnForm.valos_visszahozatal = new Date().toISOString().split('T')[0];
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
    canReturn(booking) {
      // Csak akkor lehet visszahozatalt rögzíteni, ha elvitték, de még nincs visszahozva
      return booking.Elvitve && !booking.Visszahozva;
    },
    getReturnStatus(booking) {
      if (booking.Visszahozva) return 'returned';
      if (!booking.Elvitve) return 'not-picked-up';
      return 'waiting';
    },
    getReturnStatusLabel(booking) {
      if (booking.Visszahozva) return 'Visszahozva';
      if (!booking.Elvitve) return 'Elvitelre vár';
      return 'Visszahozatalra vár';
    },
    openReturnModal(booking) {
      this.selectedBooking = booking;
      this.returnForm.valos_visszahozatal = new Date().toISOString().split('T')[0];
      this.returnForm.kilometer_veg = '';
      this.returnForm.autoAllapot = 'elerheto';  // Alapértelmezett: elérhető
      this.returnForm.megjegyzes = '';  // Megjegyzés ürítése
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.selectedBooking = null;
    },
    async recordReturn() {
      if (!this.selectedBooking || this.saving) return;
      
      this.saving = true;
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `http://localhost:3000/api/foglalasok/${this.selectedBooking.Foglalasokid}/record-return`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              valos_visszahozatal: this.returnForm.valos_visszahozatal,
              kilometer_veg: this.returnForm.kilometer_veg || 0,
              auto_allapot: this.returnForm.autoAllapot,
              megjegyzes: this.returnForm.megjegyzes
            })
          }
        );

        if (response.ok) {
          this.closeModal();
          this.fetchBookings();
          alert('Visszahozatal sikeresen rögzítve!');
        } else {
          const err = await response.json();
          alert(err.error || 'Hiba történt a visszahozatal rögzítésekor');
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
.return-manager {
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

.status-badge.returned {
  background: rgba(46, 213, 115, 0.15);
  color: #2ed573;
  border: 1px solid rgba(46, 213, 115, 0.2);
}

.status-badge.waiting {
  background: rgba(255, 165, 2, 0.15);
  color: #ffa502;
  border: 1px solid rgba(255, 165, 2, 0.2);
}

.status-badge.not-picked-up {
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

.btn-action.return {
  background: linear-gradient(135deg, #3742fa 0%, #5352ed 100%);
  color: white;
}

.btn-action.return:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(55, 66, 250, 0.4);
}

.returned-text {
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

.return-info {
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

.form-row {
  display: flex;
  gap: 16px;
}

.form-row .form-group {
  flex: 1;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #ccc;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  font-family: inherit;
  resize: vertical;
}

.form-group textarea {
  min-height: 80px;
}

.form-group select {
  width: 100%;
  padding: 10px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  cursor: pointer;
}

.form-group select option {
  background: #000000;
  color: #ffffff;
}

.form-hint {
  margin: 8px 0 0 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
}

.return-notice {
  background: rgba(255, 165, 2, 0.1);
  border: 1px solid rgba(255, 165, 2, 0.3);
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.return-notice p {
  margin: 0 0 8px 0;
  color: #ffa502;
  font-size: 0.9em;
}

.return-notice ul {
  margin: 0;
  padding-left: 20px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85em;
}

.return-notice li {
  margin-bottom: 4px;
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
  .return-manager {
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
  
  .form-row {
    flex-direction: column;
    gap: 10px;
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
