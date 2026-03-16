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
            @change="onDateFilterChange"
            placeholder="Dátum keresése..."
          >
        </div>

        <select v-model="filters.status" @change="onStatusFilterChange" class="filter-select">
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
            <th>Tervezett időszak</th>
            <th>Valós elvitel</th>
            <th>Valós visszahozatal</th>
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
              <span :class="['pickup-status', booking.Elvitve ? 'picked-up' : 'not-picked-up']">
                {{ booking.valos_elvitel ? formatDate(booking.valos_elvitel) : 'Még nem Elvive' }}
              </span>
            </td>
            <td>
              <span :class="['return-status', booking.Visszahozva ? 'returned' : 'not-returned']">
                {{ booking.valos_visszahozatal ? formatDate(booking.valos_visszahozatal) : 'Még nem lett visszahozva' }}
              </span>
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
              <button v-if="canDelete" @click="confirmDelete(booking)" class="btn-icon delete" title="Törlés">🗑</button>
            </td>
          </tr>
          <tr v-if="bookings.length === 0">
            <td colspan="9" class="no-data">Nincs megjeleníthető foglalás.</td>
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
               <input type="datetime-local" v-model="form.foglalaskezdete" required>
             </div>
             <div class="form-group">
               <label>Vége</label>
               <input type="datetime-local" v-model="form.foglalas_vege" required>
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
             <button type="submit" class="btn-primary" :disabled="saving">
              <span v-if="saving">Mentés...</span>
              <span v-else>Mentés</span>
            </button>
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
      showCarDropdown: false,
      saving: false
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
    canDelete() {
      const jog = localStorage.getItem('jogosultsag');
      return jog === 'admin' || jog === 'dolgozo';
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
  beforeUnmount() {
    clearTimeout(this._timer);
  },
  methods: {
    async fetchCarsAndCustomers() {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch all cars with NapiAr
        const carsResponse = await fetch('/api/autok?limit=1000', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const carsData = await carsResponse.json();
        this.availableCars = carsData.data || [];

        // Fetch all customers
        const customersResponse = await fetch('/api/ugyfelek?limit=1000', {
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

        const response = await fetch(`/api/foglalasok?${params.toString()}`, {
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
      return date.toLocaleString('hu-HU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    formatPrice(price) {
      return new Intl.NumberFormat('hu-HU').format(price);
    },
    getStatus(booking) {
      const now = new Date();
      const start = new Date(booking.foglalaskezdete);
      const end = new Date(booking.foglalas_vege);

      if (!isNaN(start) && now < start) return 'jovobeli';
      if (!isNaN(end) && now > end) return 'lejart';
      return 'aktiv';
    },
    getStatusLabel(booking) {
      const status = this.getStatus(booking);
      if (status === 'jovobeli') return 'Jövőbeli';
      if (status === 'lejart') return 'Lejárt';
      return 'Aktív';
    },
    toLocalDateTime(isoString) {
      if (!isoString) return '';
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return '';
      const pad = (n) => String(n).padStart(2, '0');
      const year = date.getFullYear();
      const month = pad(date.getMonth() + 1);
      const day = pad(date.getDate());
      const hour = pad(date.getHours());
      const minute = pad(date.getMinutes());
      return `${year}-${month}-${day}T${hour}:${minute}`;
    },
    openCreateModal() {
      this.editingBooking = null;
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const defaultDateTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
      this.form = { 
        auto_id: '', 
        ugyfel_id: '', 
        foglalaskezdete: defaultDateTime, 
        foglalas_vege: defaultDateTime,
        Ar: 0
      };
      this.showModal = true;
    },
    editBooking(booking) {
      this.editingBooking = booking;
      this.form = {
        auto_id: booking.auto_id,
        ugyfel_id: booking.ugyfel_id,
        foglalaskezdete: this.toLocalDateTime(booking.foglalaskezdete),
        foglalas_vege: this.toLocalDateTime(booking.foglalas_vege),
        Ar: booking.Ar || 0
      };
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    async saveBooking() {
      if (this.saving) return;
      this.saving = true;
      try {
        const token = localStorage.getItem('token');
        const url = this.editingBooking
          ? `/api/foglalasok/${this.editingBooking.Foglalasokid}`
          : '/api/foglalasok';
        
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
      } finally {
        this.saving = false;
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
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`/api/foglalasok/${booking.Foglalasokid}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!response.ok) {
            const err = await response.json();
            alert(err.error || 'Hiba történt a törlés során');
            return;
          }
          this.fetchBookings();
        } catch (err) {
          console.error(err);
          alert('Hálózati hiba történt a törlés során');
        }
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

.filter-select {
  flex: 0 0 auto;
  max-width: 150px;
  padding: 14px 40px 14px 16px;
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

.input-group input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
  opacity: 0.6;
}

.input-group input[type="date"]::-webkit-calendar-picker-indicator:hover {
  opacity: 1;
}

.filter-select {
  padding: 14px 44px 14px 18px;
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
  min-width: 140px;
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

.price-cell {
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

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
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

.pickup-status {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.85em;
  font-weight: 500;
}

.pickup-status.picked-up {
  background: rgba(46, 213, 115, 0.15);
  color: #2ed573;
}

.pickup-status.not-picked-up {
  background: rgba(255, 165, 2, 0.15);
  color: #ffa502;
}

.return-status {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.85em;
  font-weight: 500;
}

.return-status.returned {
  background: rgba(46, 213, 115, 0.15);
  color: #2ed573;
}

.return-status.not-returned {
  background: rgba(255, 71, 87, 0.15);
  color: #ff4757;
}

.customer-name {
  font-weight: 600;
  color: white;
}

.dropdown-item .customer-email {
  font-size: 0.8em;
  color: #aaa;
}

/* Reszponzív stílusok mobil eszközökhöz */
@media (max-width: 768px) {
  .booking-manager {
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
  
  .filter-select {
    width: 100%;
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
    min-width: 800px;
    font-size: 13px;
  }
  
  .data-table th,
  .data-table td {
    padding: 10px 8px;
  }
  
  .pagination {
    flex-direction: column;
    gap: 15px;
    text-align: center;
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
  
  .dropdown-list {
    max-height: 150px;
  }
}

@media (max-width: 480px) {
  .booking-manager {
    padding: 8px;
  }
  
  .data-table {
    font-size: 12px;
  }
  
  .status-badge {
    font-size: 0.7em;
    padding: 3px 8px;
  }
  
  .date-range {
    font-size: 0.8em;
    padding: 3px 6px;
  }
  
  .price-cell {
    font-size: 0.9em;
  }
}
</style>
