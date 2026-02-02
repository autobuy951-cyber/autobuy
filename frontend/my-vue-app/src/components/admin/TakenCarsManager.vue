<template>
  <div class="taken-cars-manager">
    <div class="toolbar">
      <div class="search-filters">
        <div class="input-group">
          <i class="search-icon">🔍</i>
          <input
            type="text"
            v-model="filters.search"
            @input="debouncedFetch"
            placeholder="Keresés rendszám alapján..."
          >
        </div>

        <select v-model="filters.status" @change="fetchTakenCars" class="filter-select">
          <option value="">Minden státusz</option>
          <option value="aktiv">Aktív</option>
          <option value="lezart">Lezárt</option>
        </select>
      </div>

      <button @click="openCreateModal" class="btn-primary">
        <span>+</span> Új Elvitt Autó
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Betöltés...</p>
    </div>

    <!-- Data Table -->
    <div v-else class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Rendszám</th>
            <th>Elvitel Dátuma</th>
            <th>Vissza Dátuma</th>
            <th>Kilométer Kezdet</th>
            <th>Kilométer Vég</th>
            <th>Státusz</th>
            <th class="actions-col">Műveletek</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in takenCars" :key="record.Id">
            <td class="font-mono">{{ record.Auto?.Rendszam || 'N/A' }}</td>
            <td>{{ formatDate(record.elvitel) }}</td>
            <td>{{ record.vissza ? formatDate(record.vissza) : '-' }}</td>
            <td>{{ record.Kilometer_kezdet }}</td>
            <td>{{ record.Kilometer_veg || '-' }}</td>
            <td>
              <span :class="['status-badge', record.vissza ? 'returned' : 'active']">
                {{ record.vissza ? 'Lezárt' : 'Aktív' }}
              </span>
            </td>
            <td class="actions">
              <button v-if="!record.vissza" @click="openReturnModal(record)" class="btn-icon" title="Visszaadás">↩</button>
            </td>
          </tr>
          <tr v-if="takenCars.length === 0">
            <td colspan="7" class="no-data">Nincs megjeleníthető adat.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination">
      <div class="pagination-info">
        Összesen: <strong>{{ pagination.total }}</strong> találat
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

    <!-- Create Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="closeCreateModal">
      <div class="modal">
        <h2>Új Elvitt Autó Rögzítése</h2>
        <form @submit.prevent="submitCreate" class="modal-form">
          <div class="form-group">
            <label>Autó</label>
            <select v-model="createForm.auto_id" required>
              <option value="">Válassz autót...</option>
              <option v-for="car in availableCars" :key="car.AutoID" :value="car.AutoID">
                {{ car.Marka }} {{ car.Modell }} ({{ car.Rendszam }})
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Elvitel Dátuma</label>
            <input type="date" v-model="createForm.elvitel" required>
          </div>

          <div class="form-group">
            <label>Kilométer Kezdet</label>
            <input type="number" v-model="createForm.Kilometer_kezdet" required min="0">
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeCreateModal" class="btn-secondary">Mégse</button>
            <button type="submit" class="btn-primary">Rögzítés</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Return Modal -->
    <div v-if="showReturnModal" class="modal-overlay" @click.self="closeReturnModal">
      <div class="modal">
        <h2>Autó Visszaadása</h2>
        <form @submit.prevent="submitReturn" class="modal-form">
          <div class="form-group">
            <label>Rendszám</label>
            <input type="text" :value="selectedRecord?.Auto?.Rendszam || ''" readonly class="readonly-input">
          </div>

          <div class="form-group">
            <label>Visszaadás Dátuma</label>
            <input type="date" v-model="returnForm.vissza" required>
          </div>

          <div class="form-group">
            <label>Kilométer Állás</label>
            <input type="number" v-model="returnForm.Kilometer_veg" required min="0">
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeReturnModal" class="btn-secondary">Mégse</button>
            <button type="submit" class="btn-primary">Visszaadás</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TakenCarsManager',
  data() {
    return {
      takenCars: [],
      availableCars: [],
      loading: false,
      showReturnModal: false,
      showCreateModal: false,
      selectedRecord: null,
      filters: {
        search: '',
        status: ''
      },
      pagination: {
        current: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      },
      returnForm: {
        vissza: new Date().toISOString().slice(0, 10),
        Kilometer_veg: 0
      },
      createForm: {
        auto_id: '',
        elvitel: new Date().toISOString().slice(0, 10),
        Kilometer_kezdet: 0
      }
    }
  },
  mounted() {
    this.fetchTakenCars();
    this.fetchAvailableCars();
  },
  methods: {
    async fetchTakenCars() {
      this.loading = true;
      try {
        const token = localStorage.getItem('token');
        const params = new URLSearchParams({
          page: this.pagination.current,
          limit: this.pagination.limit
        });

        if (this.filters.search) params.append('search', this.filters.search);
        if (this.filters.status) params.append('status', this.filters.status);

        const response = await fetch(`http://localhost:3000/api/autokibe?${params.toString()}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Hiba az adatok lekérésekor');

        const data = await response.json();
        this.takenCars = data.data || [];
        this.pagination.total = data.total;
        this.pagination.totalPages = data.totalPages || Math.ceil(data.total / this.pagination.limit);

      } catch (error) {
        console.error('Hiba az elvitt autók betöltésekor:', error);
      } finally {
        this.loading = false;
      }
    },
    debouncedFetch() {
      clearTimeout(this._timer);
      this._timer = setTimeout(() => {
        this.pagination.current = 1;
        this.fetchTakenCars();
      }, 300);
    },
    changePage(page) {
      if (page >= 1 && page <= this.pagination.totalPages) {
        this.pagination.current = page;
        this.fetchTakenCars();
      }
    },
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString('hu-HU');
    },
    openReturnModal(record) {
      this.selectedRecord = record;
      this.returnForm = {
        vissza: new Date().toISOString().slice(0, 10),
        Kilometer_veg: record.Kilometer_kezdet || 0
      };
      this.showReturnModal = true;
    },
    closeReturnModal() {
      this.showReturnModal = false;
      this.selectedRecord = null;
    },
    async fetchAvailableCars() {
      try {
        const token = localStorage.getItem('token');

        // Fetch all cars that are available (elerheto: true)
        const carsResponse = await fetch('http://localhost:3000/api/autok?limit=1000&elerheto=true', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const carsData = await carsResponse.json();
        this.availableCars = carsData.data || [];
      } catch (error) {
        console.error('Hiba az elérhető autók betöltésekor:', error);
      }
    },
    openCreateModal() {
      this.createForm = {
        auto_id: '',
        elvitel: new Date().toISOString().slice(0, 10),
        Kilometer_kezdet: 0
      };
      this.showCreateModal = true;
    },
    closeCreateModal() {
      this.showCreateModal = false;
    },
    async submitCreate() {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/autokibe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(this.createForm)
        });

        if (response.ok) {
          this.closeCreateModal();
          this.fetchTakenCars();
          this.fetchAvailableCars(); // Refresh available cars
        } else {
          const err = await response.json();
          alert(err.error || 'Hiba történt az autó elvitelének rögzítésekor');
        }
      } catch (err) {
        console.error(err);
        alert('Hálózati hiba történt');
      }
    },
    async submitReturn() {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/autokibe/${this.selectedRecord.Id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(this.returnForm)
        });

        if (response.ok) {
          this.closeReturnModal();
          this.fetchTakenCars();
          this.fetchAvailableCars(); // Refresh available cars after return
        } else {
          const err = await response.json();
          alert(err.error || 'Hiba történt a visszaadás során');
        }
      } catch (err) {
        console.error(err);
        alert('Hálózati hiba történt');
      }
    }
  }
}
</script>

<style scoped>
.taken-cars-manager {
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
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
  color: white;
  cursor: pointer;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: rgba(255, 255, 255, 0.6);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top: 4px solid #ff4757;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.table-container {
  overflow-x: auto;
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
}

.data-table th {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
}

.font-mono {
  font-family: monospace;
  font-size: 1.1em;
  letter-spacing: 1px;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.85em;
  font-weight: 500;
}

.status-badge.active {
  background: rgba(255, 71, 87, 0.15);
  color: #ff4757;
  border: 1px solid rgba(255, 71, 87, 0.2);
}

.status-badge.returned {
  background: rgba(46, 213, 115, 0.15);
  color: #2ed573;
  border: 1px solid rgba(46, 213, 115, 0.2);
}

.btn-icon {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  font-size: 1.1em;
  padding: 6px;
  border-radius: 4px;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
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

.page-current {
  margin: 0 12px;
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
  margin-top: 0;
  margin-bottom: 24px;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.form-group input {
  padding: 10px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  font-size: 14px;
}

.readonly-input {
  background: rgba(0, 0, 0, 0.5) !important;
  cursor: not-allowed;
}

.form-group input:focus {
  outline: none;
  border-color: #ff4757;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
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
  transition: transform 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 71, 87, 0.4);
}

.no-data {
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
}
</style>