<template>
  <div class="customer-dashboard">
    <header class="dashboard-header">
      <h1>Ügyfél Dashboard</h1>
      <div class="user-info">
        <span>Üdvözöljük, {{ userNev }}</span>
        <button @click="logout" class="logout-btn">Kijelentkezés</button>
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
          <div class="brand-select">
            <select v-model="filters.marka">
              <option value="">Összes márka</option>
              <option v-for="brand in uniqueBrands" :key="brand" :value="brand">
                {{ brand }}
              </option>
            </select>
          </div>
          <div class="search-input">
            <span class="search-icon">🚗</span>
            <input 
              type="text" 
              v-model="filters.modell" 
              placeholder="Modell keresése..."
            >
          </div>
          <div class="search-input">
            <span class="search-icon">ABC</span>
            <input 
              type="text" 
              v-model="filters.rendszam" 
              placeholder="Rendszám keresése..."
            >
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
                  <p><strong>Állapot:</strong> {{ car.Allapot }}</p>
                  <p><strong>Alvázszám:</strong> {{ car.Alvazszam }}</p>
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
                <span class="status" :class="reservation.Visszahozva ? 'returned' : 'active'">
                  {{ reservation.Visszahozva ? 'Visszahozva' : 'Aktív' }}
                </span>
              </div>
              <div class="reservation-details">
              <p><strong>Rendszám:</strong> {{ reservation.Auto?.Rendszam }}</p>
              <p><strong>Foglalás dátuma:</strong> {{ formatDate(reservation.foglalaskezdete) }}</p>
              <p v-if="reservation.foglalas_vege">
                <strong>Visszahozás dátuma:</strong> {{ formatDate(reservation.foglalas_vege) }}
              </p>
              <p v-if="reservation.Ar" class="reservation-price">
                <strong>Fizetendő összeg:</strong> {{ formatPrice(reservation.Ar) }} Ft
              </p>
            </div>
            <div v-if="!reservation.Visszahozva && reservation.status === 'jovobeli'" class="reservation-actions">
              <button @click="cancelReservation(reservation.Foglalasokid)" class="cancel-btn">
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
      filters: {
        modell: '',
        rendszam: '',
        marka: ''
      },
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
    rentalDays() {
      if (!this.reservationForm.startDate || !this.reservationForm.returnDate) return 0;
      const start = new Date(this.reservationForm.startDate);
      const end = new Date(this.reservationForm.returnDate);
      const diffTime = end - start;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 mert beleértjük az első napot is
      return diffDays > 0 ? diffDays : 0;
    },
    totalPrice() {
      if (!this.selectedCar || !this.rentalDays) return 0;
      return (this.selectedCar.NapiAr || 0) * this.rentalDays;
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
    async loadAvailableCars() {
      try {
        const response = await fetch('http://localhost:3000/api/autok/elerheto');
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
        const response = await fetch('http://localhost:3000/api/foglalasok', {
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

        const response = await fetch('http://localhost:3000/api/foglalasok', {
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
        const response = await fetch(`http://localhost:3000/api/foglalasok/${reservationId}/return`, {
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

    async cancelReservation(reservationId) {
      if (!confirm('Biztosan lemondja a foglalást?')) {
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/foglalasok/${reservationId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          this.showMessage('Foglalás sikeresen lemondva!', 'success');
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
