<template>
  <div class="customer-manager">
    <div class="toolbar">
      <div class="search-filters">
        <div class="input-group">
          <i class="search-icon">🔍</i>
          <input 
            type="text" 
            v-model="filters.search" 
            @input="debouncedFetch" 
            placeholder="Keresés név vagy email alapján..."
          >
        </div>
      </div>

      <button @click="openCreateModal" class="btn-primary">
        <span>+</span> Új Ügyfél
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
            <th @click="sortBy('Nev')">Név <span v-if="sort.by === 'Nev'">{{ sort.order === 'ASC' ? '▲' : '▼' }}</span></th>
            <th>Elérhetőség</th>
            <th>Személyes Adatok</th>
            <th>Jogosultság</th>
            <th class="actions-col">Műveletek</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="customer in customers" :key="customer.ID">
            <td class="name-cell">
              <div class="avatar-small">{{ getMonogram(customer.Nev) }}</div>
              <span>{{ customer.Nev }}</span>
            </td>
            <td>
              <div class="contact-info">
                <span class="email">{{ customer.Email }}</span>
                <span class="phone">{{ customer.Telefonszam }}</span>
              </div>
            </td>
            <td>
              <div class="personal-info">
                <span>{{ customer.igSzam }}</span>
                <span class="address">{{ customer.Cim }}</span>
              </div>
            </td>
            <td>
              <span :class="['role-badge', customer.Jogosultsag]">
                {{ customer.Jogosultsag }}
              </span>
            </td>
            <td class="actions">
              <button @click="editCustomer(customer)" class="btn-icon" title="Szerkesztés">✎</button>
              <button @click="confirmDelete(customer)" class="btn-icon delete" title="Törlés">🗑</button>
            </td>
          </tr>
          <tr v-if="customers.length === 0">
            <td colspan="5" class="no-data">Nincs megjeleníthető ügyfél.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination">
      <div class="pagination-info">
        Összesen: <strong>{{ pagination.total }}</strong> ügyfél
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
        <h2>{{ editingCustomer ? 'Ügyfél szerkesztése' : 'Új ügyfél felvétele' }}</h2>
        
        <form @submit.prevent="saveCustomer" class="modal-form">
          <div class="form-row">
             <div class="form-group">
              <label>Név</label>
              <input type="text" v-model="form.Nev" required>
            </div>
            <div class="form-group">
              <label>Jogosultság</label>
              <select v-model="form.Jogosultsag">
                <option value="ugyfel">Ügyfél</option>
                <option value="admin">Adminisztrátor</option>
                <option value="dolgozo">Dolgozó</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Email</label>
              <input type="email" v-model="form.Email" required>
            </div>
            <div class="form-group">
              <label>Telefonszám</label>
              <input type="text" v-model="form.Telefonszam" required>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Lakcím</label>
              <input type="text" v-model="form.Cim" required>
            </div>
          </div>

           <div class="form-row">
            <div class="form-group">
              <label>Szig. Szám</label>
              <input type="text" v-model="form.igSzam" required>
            </div>
            <div class="form-group">
              <label>Születési Dátum</label>
              <input type="date" v-model="form.SzuletesiDatum" required>
            </div>
          </div>

           <div class="form-row" v-if="!editingCustomer">
            <div class="form-group">
              <label>Jelszó</label>
              <input type="password" v-model="form.Jelszo" required>
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
  name: 'CustomerManager',
  data() {
    return {
      customers: [],
      loading: false,
      showModal: false,
      editingCustomer: null,
      filters: {
        search: ''
      },
      sort: {
        by: 'Nev',
        order: 'ASC'
      },
      pagination: {
        current: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      },
      form: {
        Nev: '',
        Email: '',
        Telefonszam: '',
        Cim: '',
        igSzam: '',
        SzuletesiDatum: '',
        Jogosultsag: 'ugyfel',
        Jelszo: ''
      }
    }
  },
  mounted() {
    this.fetchCustomers();
  },
  methods: {
    getMonogram(name) {
      if(!name) return '?';
      return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    },
    async fetchCustomers() {
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
        
        const response = await fetch(`http://localhost:3000/api/ugyfelek?${params.toString()}`, {
           headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Hiba az adatok lekérésekor');

        const data = await response.json();
        this.customers = data.data;
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
        this.fetchCustomers();
      }, 300);
    },
    changePage(page) {
      if (page >= 1 && page <= this.pagination.totalPages) {
        this.pagination.current = page;
        this.fetchCustomers();
      }
    },
    sortBy(field) {
       if (this.sort.by === field) {
        this.sort.order = this.sort.order === 'ASC' ? 'DESC' : 'ASC';
      } else {
        this.sort.by = field;
        this.sort.order = 'ASC';
      }
      this.fetchCustomers();
    },
    openCreateModal() {
      this.editingCustomer = null;
      this.resetForm();
      this.showModal = true;
    },
    editCustomer(customer) {
      this.editingCustomer = customer;
      this.form = { ...customer, Jelszo: '' }; // Password reset not shown in edit
      this.showModal = true;
    },
    resetForm() {
       this.form = {
        Nev: '',
        Email: '',
        Telefonszam: '',
        Cim: '',
        igSzam: '',
        SzuletesiDatum: '',
        Jogosultsag: 'ugyfel',
        Jelszo: ''
      };
    },
    closeModal() {
      this.showModal = false;
    },
    async saveCustomer() {
      try {
         const token = localStorage.getItem('token');
         const url = this.editingCustomer 
            ? `http://localhost:3000/api/ugyfelek/${this.editingCustomer.ID}`
            : 'http://localhost:3000/api/ugyfelek';
         
         const method = this.editingCustomer ? 'PUT' : 'POST';

         // If editing and password is empty, remove it from payload
         const payload = { ...this.form };
         if (this.editingCustomer && !payload.Jelszo) {
           delete payload.Jelszo;
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
           this.fetchCustomers();
         } else {
           const err = await response.json();
           alert(err.error || 'Hiba történt');
         }
      } catch (err) {
        console.error(err);
      }
    },
    async confirmDelete(customer) {
      if (confirm(`Biztosan törölni szeretnéd a(z) ${customer.Nev} nevű ügyfelet?`)) {
        try {
           const token = localStorage.getItem('token');
           await fetch(`http://localhost:3000/api/ugyfelek/${customer.ID}`, {
             method: 'DELETE',
             headers: { 'Authorization': `Bearer ${token}` }
           });
           this.fetchCustomers();
        } catch (err) {
           console.error(err);
        }
      }
    }
  }
}
</script>

<style scoped>
.customer-manager {
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
  background: #2ed573;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: white;
  font-weight: bold;
}

.contact-info {
  display: flex;
  flex-direction: column;
  font-size: 0.9em;
}

.contact-info .email {
  color: #a4b0be;
}

.personal-info {
  display: flex;
  flex-direction: column;
  font-size: 0.9em;
}

.personal-info .address {
  opacity: 0.7;
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

.role-badge.user {
  background: rgba(46, 213, 115, 0.2);
  color: #2ed573;
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
</style>
