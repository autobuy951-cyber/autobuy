<template>
  <div class="booking-manager">
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
            @change="fetchBookings"
            placeholder="Dátum keresése..."
          >
        </div>

        <select v-model="filters.status" @change="fetchBookings" class="filter-select">
          <option value="">Minden státusz</option>
          <option value="aktiv">Aktív</option>
          <option value="lejart">Lejárt</option>
          <option value="jovobeli">Jövőbeli</option>
        </select>
      </div>

      <button @click="openCreateModal" class="btn-primary">
        <span>+</span> Új Foglalás
      </button>
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
            <th>Időszak</th>
            <th>Ár</th>
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
              <div class="date-range">
                <span class="start">{{ formatDate(booking.foglalaskezdete) }}</span>
                <span class="arrow">→</span>
                <span class="end">{{ formatDate(booking.foglalas_vege) }}</span>
              </div>
            </td>
            <td>
              <span class="price-cell">{{ formatPrice(booking.Ar) }} Ft</span>
            </td>
            <td>
              <span :class="['status-badge', getStatus(booking)]">
                {{ getStatusLabel(booking) }}
              </span>
            </td>
            <td class="actions">
              <button @click="editBooking(booking)" class="btn-icon" title="Szerkesztés">✎</button>
              <button v-if="isAdmin" @click="confirmDelete(booking)" class="btn-icon delete" title="Törlés">🗑</button>
            </td>
          </tr>
          <tr v-if="bookings.length === 0">
            <td colspan="6" class="no-data">Nincs megjeleníthető foglalás.</td>
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

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h2>{{ editingBooking ? 'Foglalás szerkesztése' : 'Új foglalás rögzítése' }}</h2>
        <form @submit.prevent="saveBooking">
           <div class="form-group">
             <label>Autó</label>
             <div class="custom-select-wrapper" v-click-outside="() => showCarDropdown = false">
               <input 
                 type="text" 
                 v-model="carSearchQuery" 
                 @focus="showCarDropdown = true"
                 placeholder="Keresés rendszám, márka vagy modell alapján..."
                 class="search-dropdown-input"
               >
               <input type="hidden" v-model="form.auto_id" required>
               
               <div v-if="showCarDropdown" class="dropdown-list">
                 <div 
                   v-for="car in filteredCars" 
                   :key="car.AutoID" 
                   @click="selectCar(car)"
                   class="dropdown-item"
                 >
                   <span class="car-name">{{ car.Marka }} {{ car.Modell }}</span>
                   <span class="car-plate">{{ car.Rendszam }}</span>
                 </div>
                 <div v-if="filteredCars.length === 0" class="dropdown-item no-result">
                   Nincs találat.
                 </div>
               </div>
             </div>
           </div>
           <div class="form-group">
             <label>Ügyfél</label>
             <div class="custom-select-wrapper" v-click-outside="() => showCustomerDropdown = false">
               <input 
                 type="text" 
                 v-model="customerSearchQuery" 
                 @focus="showCustomerDropdown = true"
                 placeholder="Kezdje el gépelni a nevet..."
                 class="search-dropdown-input"
               >
               <input type="hidden" v-model="form.ugyfel_id" required> <!-- Hidden input for validation if needed, or rely on form check -->
               
               <div v-if="showCustomerDropdown" class="dropdown-list">
                 <div 
                   v-for="customer in filteredCustomers" 
                   :key="customer.ID" 
                   @click="selectCustomer(customer)"
                   class="dropdown-item"
                 >
                   <span class="customer-name">{{ customer.Nev }}</span>
                   <span class="customer-email">{{ customer.Email }}</span>
                 </div>
                 <div v-if="filteredCustomers.length === 0" class="dropdown-item no-result">
                   Nincs találat.
                 </div>
               </div>
             </div>
           </div>
           <div class="form-row">
             <div class="form-group">
               <label>Kezdet</label>
               <input type="date" v-model="form.foglalaskezdete" required>
             </div>
             <div class="form-group">
               <label>Vége</label>
               <input type="date" v-model="form.foglalas_vege" required>
             </div>
           </div>
           <div class="form-group">
             <label>Ár (Ft)</label>
             <div class="price-calculation">
               <input type="number" v-model="calculatedPrice" readonly class="readonly-price">
               <div v-if="selectedCarDailyRate && rentalDays > 0" class="price-breakdown">
                 <span class="breakdown-text">{{ rentalDays }} nap × {{ formatPrice(selectedCarDailyRate) }} Ft/nap</span>
               </div>
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
  name: 'BookingManager',
  directives: {
    'click-outside': {
      mounted(el, binding) {
        el.clickOutsideEvent = function(event) {
          if (!(el === event.target || el.contains(event.target))) {
            binding.value(event, el);
          }
        };
        document.body.addEventListener('click', el.clickOutsideEvent);
      },
      unmounted(el) {
        document.body.removeEventListener('click', el.clickOutsideEvent);
      }
    }
  },
  data() {
    return {
      bookings: [],
      availableCars: [],
      availableCustomers: [],
      loading: false,
      showModal: false,
      editingBooking: null,
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
      form: {
        auto_id: '',
        ugyfel_id: '',
        foglalaskezdete: '',
        foglalas_vege: '',
        Ar: 0
      },
      customerSearchQuery: '',
      showCustomerDropdown: false,
      carSearchQuery: '',
      showCarDropdown: false
    }
  },
  computed: {
    filteredCustomers() {
      if (!this.customerSearchQuery || this.customerSearchQuery.trim() === '') return this.availableCustomers;
      const query = this.customerSearchQuery.toLowerCase().trim();
      return this.availableCustomers.filter(customer =>
        customer.Nev && customer.Nev.toLowerCase().includes(query)
      );
    },
    filteredCars() {
      if (!this.carSearchQuery || this.carSearchQuery.trim() === '') return this.availableCars;
      const query = this.carSearchQuery.toLowerCase().trim();
      // Normalize query by removing spaces and hyphens for license plate matching
      const normalizedQuery = query.replace(/[\s-]/g, '');
      
      return this.availableCars.filter(car => {
        // For license plate, normalize both the search and the actual plate
        const normalizedRendszam = car.Rendszam ? car.Rendszam.toLowerCase().replace(/[\s-]/g, '') : '';
        const rendszamMatch = normalizedRendszam.includes(normalizedQuery);
        
        // For brand and model, use regular search
        const markaMatch = car.Marka && car.Marka.toLowerCase().includes(query);
        const modellMatch = car.Modell && car.Modell.toLowerCase().includes(query);
        
        // Also search in combined "Marka Modell" string (e.g., "Opel C" matches "Opel Corsa")
        const combinedText = `${car.Marka || ''} ${car.Modell || ''}`.toLowerCase();
        const combinedMatch = combinedText.includes(query);
        
        return rendszamMatch || markaMatch || modellMatch || combinedMatch;
      });
    },
    selectedCarDailyRate() {
      if (!this.form.auto_id) return 0;
      const car = this.availableCars.find(c => c.AutoID === this.form.auto_id);
      return car ? (car.NapiAr || 0) : 0;
    },
    rentalDays() {
      if (!this.form.foglalaskezdete || !this.form.foglalas_vege) return 0;
      const start = new Date(this.form.foglalaskezdete);
      const end = new Date(this.form.foglalas_vege);
      const diffTime = Math.abs(end - start);
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return days > 0 ? days : 0;
    },
    calculatedPrice() {
      return this.rentalDays * this.selectedCarDailyRate;
    },
    isAdmin() {
      return localStorage.getItem('jogosultsag') === 'admin';
    }
  },
  watch: {
    // Watch for modal opening/editing to reset or set search query
    editingBooking(newVal) {
      if (newVal && newVal.Ugyfel) {
        this.customerSearchQuery = newVal.Ugyfel.Nev;
      }
      if (newVal && newVal.Auto) {
        this.carSearchQuery = `${newVal.Auto.Marka} ${newVal.Auto.Modell} (${newVal.Auto.Rendszam})`;
      }
    },
    // Also watch showModal to clear query on new booking
    showModal(isOpen) {
      if (isOpen && !this.editingBooking) {
        this.customerSearchQuery = '';
        this.carSearchQuery = '';
      }
    },
    calculatedPrice(newPrice) {
      this.form.Ar = newPrice;
    }
  },
  mounted() {
    this.fetchBookings();
    this.fetchCarsAndCustomers();
  },
  methods: {
    async fetchCarsAndCustomers() {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch all cars with NapiAr
        const carsResponse = await fetch('http://localhost:3000/api/autok?limit=1000', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const carsData = await carsResponse.json();
        this.availableCars = carsData.data || [];

        // Fetch all customers
        const customersResponse = await fetch('http://localhost:3000/api/ugyfelek?limit=1000', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const customersData = await customersResponse.json();
        this.availableCustomers = customersData.data || [];
      } catch (error) {
        console.error('Hiba az autók/ügyfelek betöltésekor:', error);
      }
    },
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

        if (this.filters.status) params.append('status', this.filters.status);
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
    changePage(page) {
       if (page >= 1 && page <= this.pagination.totalPages) {
        this.pagination.current = page;
        this.fetchBookings();
      }
    },
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString('hu-HU');
    },
    formatPrice(price) {
      return new Intl.NumberFormat('hu-HU').format(price);
    },
    getStatus(booking) {
      const today = new Date();
      const end = new Date(booking.foglalas_vege);
      const start = new Date(booking.foglalaskezdete);
      
      if (today < start) return 'future';
      if (today > end) return 'expired';
      return 'active';
    },
    getStatusLabel(booking) {
      const status = this.getStatus(booking);
      if (status === 'future') return 'Jövőbeli';
      if (status === 'expired') return 'Lejárt';
      return 'Aktív';
    },
    openCreateModal() {
      this.editingBooking = null;
      this.form = { 
        auto_id: '', 
        ugyfel_id: '', 
        foglalaskezdete: '', 
        foglalas_vege: '',
        Ar: 0
      };
      this.showModal = true;
    },
    editBooking(booking) {
      this.editingBooking = booking;
      this.form = {
        auto_id: booking.auto_id,
        ugyfel_id: booking.ugyfel_id,
        foglalaskezdete: booking.foglalaskezdete,
        foglalas_vege: booking.foglalas_vege,
        Ar: booking.Ar || 0
      };
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    async saveBooking() {
      try {
        const token = localStorage.getItem('token');
        const url = this.editingBooking
          ? `http://localhost:3000/api/foglalasok/${this.editingBooking.Foglalasokid}`
          : 'http://localhost:3000/api/foglalasok';
        
        const method = this.editingBooking ? 'PUT' : 'POST';

        const response = await fetch(url, {
          method: method,
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(this.form)
        });

        if (response.ok) {
          this.closeModal();
          this.fetchBookings();
        } else {
          const err = await response.json();
          alert(err.error || 'Hiba történt');
        }
      } catch (err) {
        console.error(err);
        alert('Hálózati hiba történt');
      }
     },
    selectCustomer(customer) {
      this.form.ugyfel_id = customer.ID;
      this.customerSearchQuery = customer.Nev;
      this.showCustomerDropdown = false;
    },
    selectCar(car) {
      this.form.auto_id = car.AutoID;
      this.carSearchQuery = `${car.Marka} ${car.Modell} (${car.Rendszam})`;
      this.showCarDropdown = false;
    },
    async confirmDelete(booking) {
      if (confirm(`Biztosan törölni szeretnéd a(z) #${booking.Foglalasokid} foglalást?`)) {
         const token = localStorage.getItem('token');
         await fetch(`http://localhost:3000/api/foglalasok/${booking.Foglalasokid}`, {
           method: 'DELETE',
           headers: { 'Authorization': `Bearer ${token}` }
         });
         this.fetchBookings();
      }
    }
  }
}
</script>

<style scoped>
.booking-manager {
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

.input-group input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
  opacity: 0.8;
}

.input-group input[type="date"]::-webkit-calendar-picker-indicator:hover {
  opacity: 1;
}


.filter-select {
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
  color: white;
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
}

.id-cell {
  font-family: monospace;
  color: #a0a0a0;
}

.customer-email {
  font-size: 0.85em;
  color: rgba(255, 255, 255, 0.5);
}

.car-name {
  font-weight: 600;
  color: white;
}

.car-plate {
  font-size: 0.85em;
  color: rgba(255, 255, 255, 0.5);
  font-family: monospace;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: rgba(255, 255, 255, 0.3);
}

.user-info {
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

.date-range {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9em;
  background: rgba(255, 255, 255, 0.05);
  padding: 4px 10px;
  border-radius: 4px;
  width: fit-content;
}

.arrow {
  color: rgba(255, 255, 255, 0.4);
}

.price, .price-cell {
  font-weight: 600;
  color: #2ed573;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8em;
  font-weight: 500;
  text-transform: uppercase;
}

.status-badge.active {
  background: rgba(46, 213, 115, 0.15);
  color: #2ed573;
  border: 1px solid rgba(46, 213, 115, 0.2);
}

.status-badge.expired {
  background: rgba(255, 255, 255, 0.1);
  color: #aaa;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.status-badge.future {
  background: rgba(55, 66, 250, 0.15);
  color: #3742fa;
  border: 1px solid rgba(55, 66, 250, 0.2);
}

.btn-icon {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  font-size: 1.1em;
  padding: 6px;
  border-radius: 4px;
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
  max-width: 500px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #ccc;
}

.form-group input, .form-group select {
  width: 100%;
  padding: 10px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
}

.form-group input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
  opacity: 0.8;
}

.form-group input[type="date"]::-webkit-calendar-picker-indicator:hover {
  opacity: 1;
}


.price-calculation {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.readonly-price {
  background: rgba(46, 213, 115, 0.1) !important;
  border: 1px solid rgba(46, 213, 115, 0.3) !important;
  color: #2ed573 !important;
  font-weight: 600;
  cursor: not-allowed;
}

.price-breakdown {
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  border-left: 3px solid #2ed573;
}

.breakdown-text {
  font-size: 0.9em;
  color: rgba(255, 255, 255, 0.7);
  font-family: monospace;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-row .form-group {
  flex: 1;
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
.custom-select-wrapper {
  position: relative;
}

.search-dropdown-input {
  width: 100%;
  padding: 10px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
}

.dropdown-list {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  background: #2d2d2d;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  margin-top: 5px;
  z-index: 1001;
  box-shadow: 0 4px 15px rgba(0,0,0,0.5);
}

.dropdown-item {
  padding: 10px;
  cursor: pointer;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.dropdown-item:last-child {
  border-bottom: none;
}

.customer-name {
  font-weight: 600;
  color: white;
}

.customer-email {
  font-size: 0.8em;
  color: #aaa;
}
</style>
