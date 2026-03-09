<template>
  <div class="customer-dashboard">
    <header class="dashboard-header">
      <h1>Ügyfél Dashboard</h1>
      <div class="user-info">
        <span>Üdvözöljük, {{ userNev }}</span>
        <button @click="logout" class="logout-btn">
          🚪 Kijelentkezés
        </button>
      </div>
    </header>

    <nav class="dashboard-nav">
      <button @click="activeTab = 'cars'" :class="{ active: activeTab === 'cars' }">
        Elérhető autók
      </button>
      <button @click="activeTab = 'reservations'" :class="{ active: activeTab === 'reservations' }">
        Foglalásaim
      </button>
    </nav>

    <main class="dashboard-content">
      <!-- Elérhető autók -->
      <div v-if="activeTab === 'cars'" class="cars-section">
        <h2>Elérhető autók</h2>
        
        <!-- Filter Bar -->
        <div class="filter-bar">
          <div class="search-input brand-select-wrapper">
            <span class="search-icon">🔽</span>
            <select v-model="filters.marka" @change="onBrandChange">
              <option value="">Összes márka</option>
              <option v-for="brand in uniqueBrands" :key="brand" :value="brand">
                {{ brand }}
              </option>
            </select>
          </div>
          
          <!-- Modell kereső - combobox stílus -->
          <div class="search-input combobox-wrapper">
            <span class="search-icon">🚗</span>
            <input 
              type="text" 
              v-model="filters.modell" 
              placeholder="Modell keresése..."
              @focus="showModelDropdown = true"
              @blur="hideModelDropdown"
              autocomplete="off"
            >
            <div v-if="showModelDropdown && availableModels.length > 0" class="combobox-dropdown">
              <div 
                v-for="model in availableModels" 
                :key="model"
                @mousedown.prevent="selectModel(model)"
                class="combobox-option"
              >
                {{ model }}
              </div>
            </div>
          </div>
          
          <!-- Rendszám kereső - combobox stílus -->
          <div class="search-input combobox-wrapper">
            <span class="search-icon">🔢</span>
            <input 
              type="text" 
              v-model="filters.rendszam" 
              placeholder="Rendszám keresése..."
              @focus="showPlateDropdown = true"
              @blur="hidePlateDropdown"
              autocomplete="off"
            >
            <div v-if="showPlateDropdown && availablePlates.length > 0" class="combobox-dropdown">
              <div 
                v-for="plate in availablePlates" 
                :key="plate"
                @mousedown.prevent="selectPlate(plate)"
                class="combobox-option"
              >
                {{ plate }}
              </div>
            </div>
          </div>
        </div>

        <div v-if="filteredCars.length === 0" class="no-cars">
          <p>Nincs a keresésnek megfelelő autó.</p>
        </div>
        <div v-else>
          <!-- Pagination Controls (Top) -->
          <div v-if="totalPages > 1" class="pagination top-pagination">
            <button 
              @click="changePage(currentPage - 1)" 
              :disabled="currentPage === 1" 
              class="page-btn nav-btn"
            >
              &laquo; Előző
            </button>
            <div class="page-numbers">
                <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
            </div>
            <button 
              @click="changePage(currentPage + 1)" 
              :disabled="currentPage === totalPages" 
              class="page-btn nav-btn"
            >
              Következő &raquo;
            </button>
          </div>

          <div class="cars-grid">
            <div v-for="car in paginatedCars" :key="car.AutoID" class="car-card">
              <div class="car-image-container">
                <img :src="getCarImage(car)" :alt="car.Marka" class="car-image" />
              </div>
              <div class="car-content">
                <div class="car-header">
                  <h3>{{ car.Marka }} {{ car.Modell }}</h3>
                  <span class="year">{{ car.Evjarat }}</span>
                </div>
                <div class="car-details">
                  <p><strong>Rendszám:</strong> {{ car.Rendszam }}</p>
                  <p><strong>Állapot:</strong> {{ getStatusLabel(car.Allapot) }}</p>
                  <p><strong>Napi ár:</strong> {{ formatPrice(car.NapiAr || 0) }} Ft</p>
                  <p v-if="car.Megjegyzes" class="car-notes">
                    <strong>📌 Megjegyzés:</strong> {{ car.Megjegyzes }}
                  </p>
                </div>
                <button @click="showReservationModal(car)" class="reserve-btn">
                  Foglalás
                </button>
              </div>
            </div>
          </div>

          <!-- Pagination Controls (Bottom) -->
          <div v-if="totalPages > 1" class="pagination bottom-pagination">
            <button 
              @click="changePage(currentPage - 1)" 
              :disabled="currentPage === 1" 
              class="page-btn nav-btn"
            >
              &laquo; Előző
            </button>
            
            <div class="page-numbers">
                <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
            </div>

            <button 
              @click="changePage(currentPage + 1)" 
              :disabled="currentPage === totalPages" 
              class="page-btn nav-btn"
            >
              Következő &raquo;
            </button>
          </div>
        </div>
      </div>

      <!-- Foglalásaim -->
      <div v-if="activeTab === 'reservations'" class="reservations-section">
        <h2>Foglalásaim</h2>
        <div v-if="reservations.length === 0" class="no-reservations">
          <p>Még nincs foglalása.</p>
        </div>
        <div v-else class="reservations-list">
          <div v-for="reservation in reservations" :key="reservation.Foglalasokid" class="reservation-card">
            <div class="car-image-container">
               <img :src="getCarImage(reservation.Auto)" :alt="reservation.Auto?.Marka" class="car-image" />
            </div>
            <div class="reservation-content">
              <div class="reservation-header">
                <h3>{{ reservation.Auto?.Marka }} {{ reservation.Auto?.Modell }}</h3>
                <span class="status" :class="getReservationStatusClass(reservation)">
                  {{ getReservationStatusText(reservation) }}
                </span>
              </div>
              <div class="reservation-details">
              <p><strong>Rendszám:</strong> {{ reservation.Auto?.Rendszam }}</p>
              <p><strong>Tervezett elvitel:</strong> {{ formatDate(reservation.foglalaskezdete) }}</p>
              <p v-if="reservation.valos_elvitel">
                <strong>Valós elvitel:</strong> {{ formatDate(reservation.valos_elvitel) }}
              </p>
              <p v-if="reservation.foglalas_vege">
                <strong>Tervezett visszahozatal:</strong> {{ formatDate(reservation.foglalas_vege) }}
              </p>
              <p v-if="reservation.valos_visszahozatal">
                <strong>Valós visszahozatal:</strong> {{ formatDate(reservation.valos_visszahozatal) }}
              </p>
              <p v-if="reservation.Ar" class="reservation-price">
                <strong>Fizetendő összeg:</strong> {{ formatPrice(reservation.Ar) }} Ft
              </p>
            </div>
            <div class="reservation-actions">
              <button v-if="canEdit(reservation)" @click="openEditModal(reservation)" class="edit-btn">
                ✏️ Szerkesztés
              </button>
              <button v-if="canCancel(reservation)" @click="openCancelModal(reservation.Foglalasokid)" class="cancel-btn">
                Lemondás
              </button>
            </div>
          </div> <!-- Close reservation-content -->
        </div> <!-- Close reservation-card -->
      </div>
    </div>
    </main>

    <!-- Foglalás modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <h3>Autó foglalása</h3>
        <div class="modal-car-info">
          <h4>{{ selectedCar?.Marka }} {{ selectedCar?.Modell }} ({{ selectedCar?.Evjarat }})</h4>
          <p><strong>Rendszám:</strong> {{ selectedCar?.Rendszam }}</p>
        </div>
        <div v-if="selectedCar" class="price-info">
          <p><strong>Napi ár:</strong> {{ formatPrice(selectedCar.NapiAr) }} Ft</p>
          <p v-if="reservationForm.returnDate" class="total-price">
            <strong>Fizetendő összeg ({{ rentalDays }} nap):</strong> {{ formatPrice(totalPrice) }} Ft
          </p>
        </div>
        <form @submit.prevent="makeReservation" class="reservation-form">
          <div class="form-group">
            <label for="startDate">Kezdés dátuma:</label>
            <input
              type="date"
              id="startDate"
              v-model="reservationForm.startDate"
              :min="minStartDate"
              :max="maxDate"
              required
            />
          </div>
          <div class="form-group">
            <label for="returnDate">Visszahozás dátuma:</label>
            <input
              type="date"
              id="returnDate"
              v-model="reservationForm.returnDate"
              :min="minReturnDate"
              :max="maxDate"
              required
            />
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeModal" class="cancel-modal-btn">Mégse</button>
            <button type="submit" class="confirm-reserve-btn">Foglalás</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Foglalás modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <h3>Foglalás szerkesztése</h3>
        <div class="modal-car-info">
          <h4>{{ editingReservation?.Auto?.Marka }} {{ editingReservation?.Auto?.Modell }}</h4>
          <p><strong>Rendszám:</strong> {{ editingReservation?.Auto?.Rendszam }}</p>
        </div>
        <div v-if="editingReservation && editingReservation.Auto" class="price-info">
          <p><strong>Napi ár:</strong> {{ formatPrice(editingReservation.Auto.NapiAr) }} Ft</p>
          <p v-if="editForm.returnDate"><strong>Eredeti ár:</strong> {{ formatPrice(editingReservation.Ar) }} Ft</p>
          <p v-if="editForm.returnDate" class="total-price">
            <strong>Új fizetendő összeg ({{ editRentalDays }} nap):</strong> {{ formatPrice(editTotalPrice) }} Ft
          </p>
        </div>
        <form @submit.prevent="updateReservation" class="reservation-form">
          <div class="form-group">
            <label for="editStartDate">Kezdés dátuma:</label>
            <input
              type="date"
              id="editStartDate"
              v-model="editForm.startDate"
              :min="minStartDate"
              required
            />
          </div>
          <div class="form-group">
            <label for="editReturnDate">Visszahozás dátuma:</label>
            <input
              type="date"
              id="editReturnDate"
              v-model="editForm.returnDate"
              :min="editForm.startDate || minStartDate"
              required
            />
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeEditModal" class="cancel-modal-btn">Mégse</button>
            <button type="submit" class="confirm-reserve-btn">Frissítés</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Cancel Confirmation Modal -->
    <div v-if="showCancelModal" class="modal-overlay" @click="closeCancelModal">
      <div class="modal-content modal-confirm" @click.stop>
        <h3>Foglalás lemondása</h3>
        <p>Biztosan lemondja a foglalást? Ez a művelet nem vonható vissza.</p>
        <div class="modal-actions">
          <button type="button" @click="closeCancelModal" class="cancel-modal-btn">Mégsem</button>
          <button type="button" @click="confirmCancelReservation" class="confirm-delete-btn">Igen, lemondás</button>
        </div>
      </div>
    </div>

    <!-- Üzenetek -->
    <div v-if="message" :class="['message', messageType]">
      {{ message }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'CustomerDashboard',
  data() {
    return {
      activeTab: 'cars',
      userNev: localStorage.getItem('nev') || 'Ügyfél',
      availableCars: [],
      reservations: [],
      message: '',
      messageType: 'success',
      showModal: false,
      selectedCar: null,
      reservationForm: {
        startDate: '',
        returnDate: ''
      },
      showEditModal: false,
      editingReservation: null,
      editForm: {
        startDate: '',
        returnDate: ''
      },
      showCancelModal: false,
      cancelingReservationId: null,
      filters: {
        modell: '',
        rendszam: '',
        marka: ''
      },
      showModelDropdown: false,
      showPlateDropdown: false,
      currentPage: 1,
      itemsPerPage: 20
    }
  },
  watch: {
    filters: {
      handler() {
        this.currentPage = 1;
      },
      deep: true
    }
  },
  computed: {
    paginatedCars() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredCars.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredCars.length / this.itemsPerPage);
    },
    filteredCars() {
      return this.availableCars.filter(car => {
        // Model filter
        const modelTerm = this.filters.modell.toLowerCase();
        const matchesModel = car.Modell.toLowerCase().includes(modelTerm);

        // License plate filter
        const plateTerm = this.filters.rendszam.toLowerCase();
        const matchesPlate = car.Rendszam.toLowerCase().includes(plateTerm);
        
        // Brand filter
        const matchesBrand = this.filters.marka === '' || car.Marka === this.filters.marka;

        return matchesModel && matchesPlate && matchesBrand;
      });
    },
    uniqueBrands() {
      const brands = new Set(this.availableCars.map(car => car.Marka));
      return Array.from(brands).sort();
    },
    // Elérhető modellek a kiválasztott márkához (vagy az összes ha nincs márka)
    availableModels() {
      let cars = this.availableCars;
      // Ha van márka kiválasztva, csak azokból az autókból vesszük a modelleket
      if (this.filters.marka) {
        cars = cars.filter(car => car.Marka === this.filters.marka);
      }
      // Szűrés a már beírt modell részletre
      const models = new Set(cars.map(car => car.Modell));
      let result = Array.from(models).sort();
      // Ha van beírt szöveg, szűrjük a listát
      if (this.filters.modell) {
        result = result.filter(model => 
          model.toLowerCase().includes(this.filters.modell.toLowerCase())
        );
      }
      return result;
    },
    // Elérhető rendszámok a kiválasztott márkához és modellekhez
    availablePlates() {
      let cars = this.availableCars;
      // Ha van márka kiválasztva
      if (this.filters.marka) {
        cars = cars.filter(car => car.Marka === this.filters.marka);
      }
      // Ha van modell kiválasztva/beírva
      if (this.filters.modell) {
        cars = cars.filter(car => 
          car.Modell.toLowerCase().includes(this.filters.modell.toLowerCase())
        );
      }
      const plates = new Set(cars.map(car => car.Rendszam));
      let result = Array.from(plates).sort();
      // Ha van beírt szöveg, szűrjük a listát
      if (this.filters.rendszam) {
        result = result.filter(plate => 
          plate.toLowerCase().includes(this.filters.rendszam.toLowerCase())
        );
      }
      return result;
    },
    minStartDate() {
      return new Date().toISOString().split('T')[0];
    },
    minReturnDate() {
      if (this.reservationForm.startDate) {
        return this.reservationForm.startDate;
      }
      const today = new Date();
      today.setDate(today.getDate() + 1);
      return today.toISOString().split('T')[0];
    },
    maxDate() {
      const today = new Date();
      today.setFullYear(today.getFullYear() + 1);
      return today.toISOString().split('T')[0];
    },
    rentalDays() {
      if (!this.reservationForm.startDate || !this.reservationForm.returnDate) return 0;
      const start = new Date(this.reservationForm.startDate);
      const end = new Date(this.reservationForm.returnDate);
      const diffTime = end - start;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    },
    totalPrice() {
      if (!this.selectedCar || !this.rentalDays) return 0;
      return (this.selectedCar.NapiAr || 0) * this.rentalDays;
    },
    editRentalDays() {
      if (!this.editForm.startDate || !this.editForm.returnDate) return 0;
      const start = new Date(this.editForm.startDate);
      const end = new Date(this.editForm.returnDate);
      const diffTime = end - start;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    },
    editTotalPrice() {
      if (!this.editingReservation || !this.editingReservation.Auto || !this.editRentalDays) return 0;
      return (this.editingReservation.Auto.NapiAr || 0) * this.editRentalDays;
    }
  },
  mounted() {
    // Ellenőrizzük, hogy be van-e jelentkezve
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    if (!token || userType !== 'customer') {
      this.$router.push('/');
      return;
    }

    this.loadAvailableCars();
    this.loadReservations();
  },
  methods: {
    // Márka változás - töröljük a modell és rendszám filtereket
    onBrandChange() {
      this.filters.modell = '';
      this.filters.rendszam = '';
    },
    
    // Modell kiválasztása a dropdownból
    selectModel(model) {
      this.filters.modell = model;
      this.showModelDropdown = false;
    },
    
    // Rendszám kiválasztása a dropdownból
    selectPlate(plate) {
      this.filters.rendszam = plate;
      this.showPlateDropdown = false;
    },
    
    // Dropdown-ok elrejtése (blur eseményre)
    hideModelDropdown() {
      setTimeout(() => {
        this.showModelDropdown = false;
      }, 200);
    },
    
    hidePlateDropdown() {
      setTimeout(() => {
        this.showPlateDropdown = false;
      }, 200);
    },
    
    async loadAvailableCars() {
      try {
        const response = await fetch('/api/autok/elerheto');
        if (response.ok) {
          this.availableCars = await response.json();
        } else {
          this.showMessage('Hiba történt az autók betöltésekor', 'error');
        }
      } catch (error) {
        console.error('Error loading cars:', error);
        this.showMessage('Hálózati hiba történt', 'error');
      }
    },

    async loadReservations() {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/foglalasok', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const result = await response.json();
          this.reservations = result.data || result; // Handle both paginated and direct array
        } else {
          this.showMessage('Hiba történt a foglalások betöltésekor', 'error');
        }
      } catch (error) {
        console.error('Error loading reservations:', error);
        this.showMessage('Hálózati hiba történt', 'error');
      }
    },

    showReservationModal(car) {
      this.selectedCar = car;
      this.showModal = true;
      this.reservationForm.startDate = '';
      this.reservationForm.returnDate = '';
    },

    closeModal() {
      this.showModal = false;
      this.selectedCar = null;
      this.reservationForm.startDate = '';
      this.reservationForm.returnDate = '';
    },

    async makeReservation() {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');

        const response = await fetch('/api/foglalasok', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            UgyfelId: userId,
            AutoId: this.selectedCar.AutoID,
            FoglalasDatuma: this.reservationForm.startDate,
            VisszahozasDatuma: this.reservationForm.returnDate
          })
        });

        if (response.ok) {
          this.showMessage('Foglalás sikeresen létrehozva!', 'success');
          this.closeModal();
          this.loadAvailableCars(); // Frissítjük az elérhető autók listáját
          this.loadReservations(); // Frissítjük a foglalások listáját
        } else {
          const error = await response.json();
          this.showMessage(error.error || 'Hiba történt a foglaláskor', 'error');
        }
      } catch (error) {
        console.error('Error making reservation:', error);
        this.showMessage('Hálózati hiba történt', 'error');
      }
    },

    async returnCar(reservationId) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/foglalasok/${reservationId}/return`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          this.showMessage('Autó sikeresen visszahozva!', 'success');
          this.loadAvailableCars();
          this.loadReservations();
        } else {
          const error = await response.json();
          this.showMessage(error.error || 'Hiba történt a visszahozáskor', 'error');
        }
      } catch (error) {
      }
    },

    openCancelModal(reservationId) {
      this.showCancelModal = true;
      this.cancelingReservationId = reservationId;
    },

    closeCancelModal() {
      this.showCancelModal = false;
      this.cancelingReservationId = null;
    },

    async confirmCancelReservation() {
      if (!this.cancelingReservationId) return;
      
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/foglalasok/${this.cancelingReservationId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          this.showMessage('Foglalás sikeresen lemondva!', 'success');
          this.closeCancelModal();
          this.loadAvailableCars();
          this.loadReservations();
        } else {
          const error = await response.json();
          this.showMessage(error.error || 'Hiba történt a lemondáskor', 'error');
        }
      } catch (error) {
        console.error('Error canceling reservation:', error);
        this.showMessage('Hálózati hiba történt', 'error');
      }
    },

    getReservationStatusClass(reservation) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const end = new Date(reservation.foglalas_vege);
      const start = new Date(reservation.foglalaskezdete);
      
      if (reservation.Visszahozva) return 'returned';
      if (today < start) return 'future';
      if (today > end) return 'expired';
      return 'active';
    },
    
    getReservationStatusText(reservation) {
      const statusClass = this.getReservationStatusClass(reservation);
      switch (statusClass) {
        case 'returned': return 'Visszahozva';
        case 'future': return 'Kiadásra vár';
        case 'expired': return 'Lejárt';
        default: return 'Aktív';
      }
    },
    
    canCancel(reservation) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const start = new Date(reservation.foglalaskezdete);
      
      // Csak akkor lehet lemondani, ha még nem kezdődött el és nincs visszahozva
      return !reservation.Visszahozva && today < start;
    },

    canEdit(reservation) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const start = new Date(reservation.foglalaskezdete);
      
      // Csak akkor lehet szerkeszteni, ha még nem kezdődött el és nincs visszahozva vagy elvive
      return !reservation.Visszahozva && !reservation.Elvitve && today < start;
    },

    openEditModal(reservation) {
      this.editingReservation = reservation;
      this.editForm.startDate = reservation.foglalaskezdete;
      this.editForm.returnDate = reservation.foglalas_vege;
      this.showEditModal = true;
    },

    closeEditModal() {
      this.showEditModal = false;
      this.editingReservation = null;
      this.editForm.startDate = '';
      this.editForm.returnDate = '';
    },

    async updateReservation() {
      if (!this.editingReservation) return;

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/foglalasok/${this.editingReservation.Foglalasokid}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            foglalaskezdete: this.editForm.startDate,
            foglalas_vege: this.editForm.returnDate
          })
        });

        if (response.ok) {
          this.showMessage('Foglalás sikeresen frissítve!', 'success');
          this.closeEditModal();
          this.loadReservations();
          this.loadAvailableCars();
        } else {
          const error = await response.json();
          this.showMessage(error.error || 'Hiba történt a frissítéskor', 'error');
        }
      } catch (error) {
        console.error('Error updating reservation:', error);
        this.showMessage('Hálózati hiba történt', 'error');
      }
    },

    getStatusLabel(allapot) {
      const labels = {
        'elerheto': '✅ Elérhető',
        'szervizben': '🔧 Szervizben',
        'foglalt': '🚗 Foglalt',
        'serult': '⚠️ Sérült'
      };
      return labels[allapot] || allapot || 'Ismeretlen';
    },

    formatPrice(price) {
      if (!price) return '0';
      return price.toLocaleString('hu-HU');
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('hu-HU');
    },

    showMessage(message, type = 'success') {
      this.message = message;
      this.messageType = type;
      setTimeout(() => {
        this.message = '';
      }, 5000);
    },

    logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('jogosultsag');
      localStorage.removeItem('nev');
      localStorage.removeItem('userType');
      this.$router.push('/');
    },

    getCarImage(brandOrCar) {
      // Ha objektumot kapunk (autó), és van KepURL-je, azt használjuk
      if (typeof brandOrCar === 'object' && brandOrCar !== null) {
        if (brandOrCar.KepURL && brandOrCar.KepURL.trim() !== '') {
          return brandOrCar.KepURL;
        }
        // Ha nincs KepURL, akkor a márkát nézzük
        return this.getCarImage(brandOrCar.Marka);
      }

      // Ha stringet kapunk (márka), akkor a placeholder logika fut
      const brand = brandOrCar;

      if (!brand) return 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000'; // Default car image

      const normalizedBrand = brand.toLowerCase();
      
      const images = {
        'opel': 'https://images.unsplash.com/photo-1552503932-353d712ce627?auto=format&fit=crop&q=80&w=1000',
        'suzuki': 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=1000',
        'bmw': 'https://images.unsplash.com/photo-1555215695-3004980adade?auto=format&fit=crop&q=80&w=1000',
        'audi': 'https://images.unsplash.com/photo-1603584173870-7b299f589389?auto=format&fit=crop&q=80&w=1000',
        'mercedes': 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=1000',
        'toyota': 'https://images.unsplash.com/photo-1629897048514-3dd7415194cc?auto=format&fit=crop&q=80&w=1000',
        'ford': 'https://images.unsplash.com/photo-1551830820-330a71b99659?auto=format&fit=crop&q=80&w=1000',
        'volkswagen': 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=1000', // Reusing suzuki image as placeholder if needed, or find real VW
        'vw': 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=1000'
      };

      // Check if we have a direct match or partial match
      for (const key in images) {
        if (normalizedBrand.includes(key)) {
          return images[key];
        }
      }

      return 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1000'; // Fallback luxurious car
    },

    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }
}
</script>

<style scoped src="./CustomerDashboard.css"></style>
