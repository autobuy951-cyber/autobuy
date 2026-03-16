<template>
  <div class="employee-manager">
    <div class="toolbar">
      <div class="search-filters">
        <div class="input-group">
          <i class="search-icon">🔍</i>
          <input 
            type="text" 
            v-model="filters.search" 
            @input="debouncedFetch" 
            placeholder="Keresés név alapján..."
          >
        </div>
        
        <select v-model="filters.jogosultsag" @change="fetchEmployees" class="filter-select">
          <option value="">Minden jogosultság</option>
          <option value="admin">Admin</option>
          <option value="dolgozo">Dolgozó</option>
        </select>
      </div>

      <button @click="openCreateModal" class="btn-primary">
        <span>+</span> Új Dolgozó
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Adatok betöltése...</p>
    </div>

    <!-- Data Table -->
    <div v-else class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th @click="sortBy('nev')">Név <span v-if="sort.by === 'nev'">{{ sort.order === 'ASC' ? '▲' : '▼' }}</span></th>
            <th>Jogosultság</th>
            <th class="actions-col">Műveletek</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="employee in employees" :key="employee.id">
            <td class="name-cell">
              <div class="avatar-small">{{ getMonogram(employee.nev) }}</div>
              <span>{{ employee.nev }}</span>
            </td>
            <td>
              <span :class="['role-badge', employee.jogosultsag]">
                {{ employee.jogosultsag }}
              </span>
            </td>
            <td class="actions">
              <button @click="editEmployee(employee)" class="btn-icon" title="Szerkesztés">✎</button>
              <button @click="confirmDelete(employee)" class="btn-icon delete" title="Törlés">🗑</button>
            </td>
          </tr>
          <tr v-if="employees.length === 0">
            <td colspan="3" class="no-data">Nincs megjeleníthető dolgozó.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination">
      <div class="pagination-info">
        Összesen: <strong>{{ pagination.total }}</strong> dolgozó
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
        <h2>{{ editingEmployee ? 'Dolgozó szerkesztése' : 'Új dolgozó felvétele' }}</h2>
        
        <form @submit.prevent="saveEmployee" class="modal-form">
          <div class="form-row">
            <div class="form-group">
              <label>Név</label>
              <input type="text" v-model="form.nev" required>
            </div>
            <div class="form-group">
              <label>Jogosultság</label>
              <select v-model="form.jogosultsag">
                <option value="dolgozo">Dolgozó</option>
                <option value="admin">Adminisztrátor</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>{{ editingEmployee ? 'Új jelszó (opcionális)' : 'Jelszó' }}</label>
              <input 
                type="password" 
                v-model="form.jelszo" 
                :required="!editingEmployee"
                :placeholder="editingEmployee ? 'Hagyd üresen, ha nem változtatsz' : ''"
              >
            </div>
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
  name: 'EmployeeManager',
  data() {
    return {
      employees: [],
      loading: false,
      showModal: false,
      editingEmployee: null,
      filters: {
        search: '',
        jogosultsag: ''
      },
      sort: {
        by: 'nev',
        order: 'ASC'
      },
      pagination: {
        current: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      },
      form: {
        nev: '',
        jelszo: '',
        jogosultsag: 'dolgozo'
      }
    }
  },
  mounted() {
    this.fetchEmployees();
  },
  beforeUnmount() {
    clearTimeout(this._timer);
  },
  methods: {
    async fetchEmployees() {
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
        if (this.filters.jogosultsag) params.append('jogosultsag', this.filters.jogosultsag);

        const response = await fetch(`/api/dolgozok?${params.toString()}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Hiba az adatok lekérésekor');

        const data = await response.json();
        this.employees = data.data || [];
        this.pagination.total = data.total || 0;
        this.pagination.totalPages = data.totalPages || 0;

      } catch (error) {
        console.error('Hiba a dolgozók betöltésekor:', error);
      } finally {
        this.loading = false;
      }
    },
    debouncedFetch() {
      clearTimeout(this._timer);
      this._timer = setTimeout(() => {
        this.pagination.current = 1;
        this.fetchEmployees();
      }, 300);
    },
    sortBy(field) {
      if (this.sort.by === field) {
        this.sort.order = this.sort.order === 'ASC' ? 'DESC' : 'ASC';
      } else {
        this.sort.by = field;
        this.sort.order = 'ASC';
      }
      this.fetchEmployees();
    },
    changePage(page) {
      if (page >= 1 && page <= this.pagination.totalPages) {
        this.pagination.current = page;
        this.fetchEmployees();
      }
    },
    getMonogram(name) {
      if (!name) return '?';
      return name.charAt(0).toUpperCase();
    },
    openCreateModal() {
      this.editingEmployee = null;
      this.form = { nev: '', jelszo: '', jogosultsag: 'dolgozo' };
      this.showModal = true;
    },
    editEmployee(employee) {
      this.editingEmployee = employee;
      this.form = { 
        nev: employee.nev, 
        jelszo: '', 
        jogosultsag: employee.jogosultsag 
      };
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.editingEmployee = null;
    },
    async saveEmployee() {
      try {
         const token = localStorage.getItem('token');
         const url = this.editingEmployee 
           ? `/api/dolgozok/${this.editingEmployee.id}` 
           : '/api/dolgozok';
         const method = this.editingEmployee ? 'PUT' : 'POST';

         const payload = { ...this.form };
         if (this.editingEmployee && !payload.jelszo) {
           delete payload.jelszo;
         }

         const response = await fetch(url, {
           method: method,
           headers: { 
             'Authorization': `Bearer ${token}`,
             'Content-Type': 'application/json'
           },
           body: JSON.stringify(payload)
         });

         if(response.ok) {
           this.closeModal();
           this.fetchEmployees();
         } else {
           const err = await response.json();
           alert(err.error || 'Hiba történt');
         }
      } catch (err) {
        console.error(err);
      }
    },
    async confirmDelete(employee) {
      if (confirm(`Biztosan törölni szeretnéd a(z) ${employee.nev} nevű dolgozót?`)) {
        try {
           const token = localStorage.getItem('token');
           await fetch(`/api/dolgozok/${employee.id}`, {
             method: 'DELETE',
             headers: { 'Authorization': `Bearer ${token}` }
           });
           this.fetchEmployees();
        } catch (err) {
           console.error(err);
        }
      }
    }
  }
}
</script>

<style scoped>
.employee-manager {
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
  flex: 2;
  max-width: 500px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;
}

.input-group:focus-within {
  max-width: 650px;
  z-index: 1000;
  transform: scale(1.05);
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  opacity: 0.6;
  pointer-events: none;
  transition: all 0.3s ease;
}

.input-group input {
  width: 100%;
  padding: 16px 20px 16px 52px;
  border-radius: 16px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.4);
  color: white;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.input-group input::placeholder {
  color: rgba(255, 255, 255, 0.5);
  font-weight: 400;
}

.input-group input:hover {
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.5);
}

.input-group input:focus {
  outline: none;
  border-color: #667eea;
  background: rgba(0, 0, 0, 0.6);
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.2), 0 8px 30px rgba(102, 126, 234, 0.3);
}

.input-group:focus-within .search-icon {
  opacity: 1;
  transform: translateY(-50%) scale(1.2);
  color: #667eea;
}

.filter-select {
  flex: 0 0 auto;
  max-width: 150px;
  padding: 14px 40px 14px 16px;
  border-radius: 14px;
  border: 2px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.3) !important;
  color: #ffffff !important;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24'%3E%3Cpath fill='%23ffffff' fill-opacity='0.6' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E") !important;
  background-repeat: no-repeat !important;
  background-position: right 14px center !important;
  appearance: none;
}

.filter-select:hover {
  border-color: rgba(255, 255, 255, 0.15);
  background: rgba(0, 0, 0, 0.4) !important;
}

.filter-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.15);
}

.filter-select option {
  background: #1a1f2e;
  color: white;
  padding: 12px;
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
  cursor: pointer;
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 500;
}

.avatar-small {
  width: 32px;
  height: 32px;
  background: #3742fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: white;
  font-weight: bold;
}

.role-badge {
  text-transform: uppercase;
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 4px;
  background: rgba(255,255,255,0.1);
}

.role-badge.admin {
  background: rgba(255, 71, 87, 0.2);
  color: #ff4757;
}

.role-badge.dolgozo {
  background: rgba(55, 66, 250, 0.2);
  color: #3742fa;
}

.actions {
  display: flex;
  gap: 8px;
  align-items: center;
  min-height: 50px;
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

.no-data {
  text-align: center;
  padding: 40px;
  color: rgba(255, 255, 255, 0.3);
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
  color: white;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
}

.form-group {
  flex: 1;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #ccc;
  font-size: 14px;
}

.form-group input, .form-group select {
  width: 100%;
  padding: 10px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
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

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.05);
}

@media (max-width: 768px) {
  .employee-manager {
    padding: 10px;
  }
  
  .toolbar {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .search-filters {
    flex-direction: column;
    gap: 10px;
  }
  
  .input-group {
    max-width: 100%;
  }
  
  .input-group:focus-within {
    max-width: 100%;
    transform: none;
  }
  
  .filter-select {
    width: 100%;
    max-width: 100%;
  }
  
  .btn-primary {
    width: 100%;
    justify-content: center;
  }
  
  .table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  .data-table {
    min-width: 600px;
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