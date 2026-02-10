<template>
  <div class="car-manager">
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
        
        <select v-model="filters.marka" @change="fetchCars" class="filter-select">
          <option value="">Minden márka</option>
          <option v-for="marka in brandOptions" :key="marka" :value="marka">{{ marka }}</option>
        </select>

        <select v-model="filters.status" @change="fetchCars" class="filter-select">
          <option value="">Minden státusz</option>
          <option value="elerheto">Elérhető</option>
          <option value="foglalt">Foglalt</option>
          <option value="szervizben">Szervizben</option>
          <option value="serult">Sérült</option>
        </select>
      </div>

      <button @click="openCreateModal" class="btn-primary">
        <span>+</span> Új Autó
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
            <th @click="sortBy('Rendszam')">Rendszám <span v-if="sort.by === 'Rendszam'">{{ sort.order === 'ASC' ? '▲' : '▼' }}</span></th>
            <th @click="sortBy('Marka')">Márka/Modell <span v-if="sort.by === 'Marka'">{{ sort.order === 'ASC' ? '▲' : '▼' }}</span></th>
            <th>Alvázszám</th>
            <th @click="sortBy('Evjarat')">Évjárat <span v-if="sort.by === 'Evjarat'">{{ sort.order === 'ASC' ? '▲' : '▼' }}</span></th>
            <th>Napi Ár</th>
            <th>Állapot</th>
            <th>Bérelhető</th>
            <th>Megjegyzés</th>
            <th class="actions-col">Műveletek</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="car in cars" :key="car.AutoID">
            <td class="font-mono">{{ car.Rendszam }}</td>
            <td>
              <div class="car-model">
                <div v-if="car.KepURL" class="car-thumb">
                  <img :src="car.KepURL" alt="Auto" />
                </div>
                <div>
                  <span class="brand">{{ car.Marka }}</span>
                  <span class="model">{{ car.Modell }}</span>
                </div>
              </div>
            </td>
            <td class="font-mono chassis-number">{{ car.Alvazszam }}</td>
            <td>{{ car.Evjarat }}</td>
            <td class="price">{{ formatPrice(car.NapiAr || 0) }} Ft</td>
            <td>
              <span :class="['status-badge', getStatusClass(car)]">
                {{ getStatusLabel(car) }}
              </span>
            </td>
            <td>
              <span :class="['rentable-badge', car.berleheto ? 'rentable-yes' : 'rentable-no']">
                {{ car.berleheto ? '✓ Igen' : '✗ Nem' }}
              </span>
            </td>
            <td>
              <span v-if="car.Megjegyzes" class="car-notes" :title="car.Megjegyzes">
                📝 {{ truncateText(car.Megjegyzes, 30) }}
              </span>
              <span v-else class="no-notes">-</span>
            </td>
            <td class="actions">
              <button @click="editCar(car)" class="btn-icon" title="Szerkesztés">✎</button>
              <button @click="confirmDelete(car)" class="btn-icon delete" title="Törlés">🗑</button>
            </td>
          </tr>
          <tr v-if="cars.length === 0">
            <td colspan="9" class="no-data">Nincs megjeleníthető adat.</td>
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

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h2>{{ editingCar ? 'Autó szerkesztése' : 'Új autó felvétele' }}</h2>
        
        <form @submit.prevent="saveCar" class="modal-form">
          <div class="form-row">
            <div class="form-group">
              <label>Rendszám</label>
              <input type="text" v-model="form.Rendszam" required>
            </div>
            <div class="form-group">
              <label>Évjárat</label>
              <input type="number" v-model="form.Evjarat" required min="1900" max="2030">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Márka</label>
              <select v-model="form.Marka" required>
                <option value="">Válassz márkát</option>
                <option v-for="brand in brandOptions" :key="brand" :value="brand">{{ brand }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Modell</label>
              <input type="text" v-model="form.Modell" required>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Napi Ár (Ft)</label>
              <input type="number" v-model="form.NapiAr" required min="0">
            </div>
            <div class="form-group">
              <label>Állapot</label>
              <select v-model="form.Allapot" required>
                <option value="elerheto">Elérhető</option>
                <option value="szervizben">Szervizben</option>
                <option value="foglalt">Foglalt</option>
                <option value="serult">Sérült</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Alvázszám</label>
              <input type="text" v-model="form.Alvazszam" required>
            </div>
            <div class="form-group">
              <label>Bérelhető</label>
              <select v-model="form.berleheto">
                <option :value="true">Igen</option>
                <option :value="false">Nem</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Kép feltöltése (Opcionális)</label>
            <div class="file-upload-container">
              <input type="file" @change="handleFileUpload" accept="image/*" class="file-input">
              <div v-if="previewImage || form.KepURL" class="image-preview-container">
                <img :src="previewImage || form.KepURL" alt="Preview" class="image-preview">
                <button @click="removeImage" type="button" class="remove-image-btn" title="Kép törlése">
                  🗑
                </button>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Megjegyzés</label>
            <textarea v-model="form.Megjegyzes" rows="3"></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn-secondary">Mégse</button>
            <button type="submit" class="btn-primary">Mentés</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CarManager',
  data() {
    return {
      cars: [],
      loading: false,
      showModal: false,
      editingCar: null,
      filters: {
        search: '',
        marka: '',
        status: ''
      },
      sort: {
        by: 'AutoID', // Default sort
        order: 'DESC'
      },
      pagination: {
        current: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      },
      selectedFile: null,
      previewImage: null,
      brandOptions: ['Toyota', 'BMW', 'Mercedes', 'Audi', 'Ford', 'Opel', 'Suzuki', 'Kia', 'Hyundai', 'Volkswagen'],
      form: {
        Rendszam: '',
        Marka: '',
        Modell: '',
        Evjarat: new Date().getFullYear(),
        NapiAr: 0,
        elerheto: true,
        berleheto: true,
        Allapot: 'elerheto',
        Alvazszam: '',
        KepURL: '',
        Megjegyzes: ''
      }
    }
  },
  mounted() {
    this.fetchCars();
  },
  methods: {
    async fetchCars() {
      this.loading = true;
      try {
        const token = localStorage.getItem('token');
        const params = new URLSearchParams({
          page: this.pagination.current,
          limit: this.pagination.limit,
          sort_by: this.sort.by,
          sort_order: this.sort.order
        });

        if (this.filters.search) params.append('search', this.filters.search);
        if (this.filters.marka) params.append('marka', this.filters.marka);
        if (this.filters.status) {
          if (this.filters.status === 'elerheto') {
            params.append('elerheto', 'true');
          } else if (this.filters.status === 'foglalt') {
            params.append('elerheto', 'false');
          }
        }
        
        // Backend API hívás
        const response = await fetch(`http://localhost:3000/api/autok?${params.toString()}`, {
           headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Hiba az adatok lekérésekor');

        const data = await response.json();
        this.cars = data.data; // Backend response structure matched
        this.pagination.total = data.total;
        this.pagination.totalPages = data.totalPages;

      } catch (error) {
        console.error(error);
        // Toast notification vagy hibaüzenet
      } finally {
        this.loading = false;
      }
    },
    debouncedFetch() {
      // Egyszerű debounce implementáció
      clearTimeout(this._timer);
      this._timer = setTimeout(() => {
        this.pagination.current = 1;
        this.fetchCars();
      }, 300);
    },
    changePage(page) {
      if (page >= 1 && page <= this.pagination.totalPages) {
        this.pagination.current = page;
        this.fetchCars();
      }
    },
    sortBy(field) {
      if (this.sort.by === field) {
        this.sort.order = this.sort.order === 'ASC' ? 'DESC' : 'ASC';
      } else {
        this.sort.by = field;
        this.sort.order = 'ASC';
      }
      this.fetchCars();
    },
    formatPrice(price) {
      return new Intl.NumberFormat('hu-HU').format(price);
    },
    truncateText(text, maxLength) {
      if (!text) return '';
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    },
    getStatusClass(car) {
      const statusMap = {
        'elerheto': 'available',
        'szervizben': 'maintenance',
        'foglalt': 'rented',
        'serult': 'damaged'
      };
      return statusMap[car.Allapot] || (car.elerheto ? 'available' : 'rented');
    },
    getStatusLabel(car) {
      const labelMap = {
        'elerheto': 'Elérhető',
        'szervizben': 'Szervizben',
        'foglalt': 'Foglalt',
        'serult': 'Sérült'
      };
      return labelMap[car.Allapot] || (car.elerheto ? 'Elérhető' : 'Foglalt');
    },
    openCreateModal() {
      this.editingCar = null;
      this.selectedFile = null;
      this.previewImage = null;
      this.form = {
        Rendszam: '',
        Marka: '',
        Modell: '',
        Evjarat: new Date().getFullYear(),
        NapiAr: 0,
        elerheto: true,
        berleheto: true,
        Alvazszam: '',
        Megjegyzes: ''
      };
      this.showModal = true;
    },
    editCar(car) {
      this.editingCar = car;
      this.selectedFile = null;
      this.previewImage = null;
      this.form = { ...car };
      this.showModal = true;
    },
    confirmDelete(car) {
      if (confirm(`Biztosan törölni szeretnéd a(z) ${car.Rendszam} rendszámú autót?`)) {
        this.deleteCar(car.AutoID);
      }
    },
    async deleteCar(id) {
       // Delete logic
       try {
         const token = localStorage.getItem('token');
         await fetch(`http://localhost:3000/api/autok/${id}`, {
           method: 'DELETE',
           headers: { 'Authorization': `Bearer ${token}` }
         });
         this.fetchCars();
       } catch (err) {
         console.error(err);
       }
    },
    closeModal() {
      this.showModal = false;
    },
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      this.selectedFile = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewImage = e.target.result;
      };
      reader.readAsDataURL(file);
    },
    removeImage() {
      this.selectedFile = null;
      this.previewImage = null;
      this.form.KepURL = '';
      // Reset the file input
      const fileInput = this.$el.querySelector('.file-input');
      if (fileInput) {
        fileInput.value = '';
      }
    },
    async saveCar() {
      try {
        const token = localStorage.getItem('token');
        const url = this.editingCar 
          ? `http://localhost:3000/api/autok/${this.editingCar.AutoID}`
          : 'http://localhost:3000/api/autok';
        
        const method = this.editingCar ? 'PUT' : 'POST';

        // Use FormData for file upload
        const formData = new FormData();
        
        // Append all form fields
        for (const key in this.form) {
          if (this.form[key] !== null && this.form[key] !== undefined) {
             formData.append(key, this.form[key]);
          }
        }

        // Append file if selected
        if (this.selectedFile) {
          formData.append('kep', this.selectedFile);
        }

        // Remove Content-Type header to let browser set boundary
        const response = await fetch(url, {
          method: method,
          headers: { 
            'Authorization': `Bearer ${token}`
            // Content-Type NOT set for FormData
          },
          body: formData
        });

        if(response.ok) {
          this.closeModal();
          this.fetchCars();
        } else {
          const err = await response.json();
          alert(err.error || 'Hiba történt');
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
.car-manager {
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
  flex-wrap: wrap;
  gap: 16px;
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

.btn-primary {
  background: linear-gradient(135deg, #ff4757 0%, #ff6b81 100%);
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: transform 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 71, 87, 0.4);
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
  cursor: pointer;
  user-select: none;
  transition: color 0.2s;
}

.data-table th:hover {
  color: white;
}

.font-mono {
  font-family: monospace;
  font-size: 1.1em;
  letter-spacing: 1px;
}

.chassis-number {
  font-size: 0.85em;
  color: rgba(255, 255, 255, 0.7);
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.car-notes {
  font-size: 0.85em;
  color: rgba(255, 255, 255, 0.8);
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: help;
}

.no-notes {
  color: rgba(255, 255, 255, 0.3);
}

.car-model {
  display: flex;
  align-items: center;
  gap: 12px;
}

.car-thumb {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.car-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.car-model .brand {
  font-weight: 600;
}

.car-model .model {
  font-size: 0.9em;
  opacity: 0.7;
}

.price {
  font-weight: 600;
  color: #2ed573;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.85em;
  font-weight: 500;
}

.status-badge.available {
  background: rgba(46, 213, 115, 0.15);
  color: #2ed573;
  border: 1px solid rgba(46, 213, 115, 0.2);
}

.status-badge.rented {
  background: rgba(255, 71, 87, 0.15);
  color: #ff4757;
  border: 1px solid rgba(255, 71, 87, 0.2);
}

.status-badge.maintenance {
  background: rgba(255, 165, 2, 0.15);
  color: #ffa502;
  border: 1px solid rgba(255, 165, 2, 0.2);
}

.status-badge.damaged {
  background: rgba(116, 125, 140, 0.15);
  color: #747d8c;
  border: 1px solid rgba(116, 125, 140, 0.2);
}

.rentable-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.85em;
  font-weight: 500;
}

.rentable-badge.rentable-yes {
  background: rgba(46, 213, 115, 0.15);
  color: #2ed573;
  border: 1px solid rgba(46, 213, 115, 0.2);
}

.rentable-badge.rentable-no {
  background: rgba(255, 71, 87, 0.15);
  color: #ff4757;
  border: 1px solid rgba(255, 71, 87, 0.2);
}

.actions {
  display: flex;
  gap: 8px;
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

.btn-icon.delete:hover {
  background: rgba(255, 71, 87, 0.2);
  color: #ff4757;
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
  max-width: 700px;
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

.form-row {
  display: flex;
  gap: 16px;
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 10px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  font-size: 14px;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
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

.file-upload-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.file-input {
  color: #fff;
}

.image-preview-container {
  position: relative;
  display: inline-block;
}

.image-preview {
  width: 100%;
  max-width: 200px;
  height: 150px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.2);
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(255, 71, 87, 0.9);
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s;
}

.remove-image-btn:hover {
  background: rgba(255, 71, 87, 1);
  transform: scale(1.1);
}

/* Reszponzív stílusok mobil eszközökhöz */
@media (max-width: 768px) {
  .car-manager {
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
  
  .btn-primary {
    width: 100%;
    justify-content: center;
  }
  
  .cars-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .car-card {
    border-radius: 16px;
  }
  
  .car-image {
    height: 180px;
  }
  
  .modal {
    width: 95%;
    padding: 20px;
    max-width: none;
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
    justify-content: center;
  }
  
  .image-preview {
    max-width: 100%;
    height: 200px;
  }
}

@media (max-width: 480px) {
  .car-details h3 {
    font-size: 18px;
  }
  
  .price-tag {
    font-size: 16px;
  }
  
  .car-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .car-actions button {
    width: 100%;
  }
}
</style>
