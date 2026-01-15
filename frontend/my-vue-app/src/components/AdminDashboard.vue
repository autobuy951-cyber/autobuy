<template>
  <div class="admin-dashboard">
    <header class="dashboard-header">
      <h1>Admin Dashboard</h1>
      <div class="user-info">
        <span>Üdvözöljük, {{ userNev }}</span>
        <button @click="logout" class="logout-btn">Kijelentkezés</button>
      </div>
    </header>

    <nav class="dashboard-nav">
      <button @click="activeTab = 'customers'" :class="{ active: activeTab === 'customers' }">
        Ügyfelek kezelése
      </button>
      <button @click="activeTab = 'cars'" :class="{ active: activeTab === 'cars' }">
        Autók kezelése
      </button>
    </nav>

    <main class="dashboard-content">
      <!-- Ügyfelek hozzáadása -->
      <div v-if="activeTab === 'customers'" class="form-section">
        <h2>Új ügyfél hozzáadása</h2>
        <form @submit.prevent="addCustomer" class="add-form">
          <div class="form-row">
            <div class="form-group">
              <label for="nev">Név:</label>
              <input type="text" id="nev" v-model="customerForm.Nev" required>
            </div>
            <div class="form-group">
              <label for="cim">Cím:</label>
              <input type="text" id="cim" v-model="customerForm.Cim" required>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="telefonszam">Telefonszám:</label>
              <input type="text" id="telefonszam" v-model="customerForm.Telefonszam" required>
            </div>
            <div class="form-group">
              <label for="email">Email:</label>
              <input type="email" id="email" v-model="customerForm.Email" required>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="igSzam">Személyi igazolvány szám:</label>
              <input type="text" id="igSzam" v-model="customerForm.igSzam" required>
            </div>
            <div class="form-group">
              <label for="szuletesiDatum">Születési dátum:</label>
              <input type="date" id="szuletesiDatum" v-model="customerForm.SzuletesiDatum" required>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="jogosultsag">Jogosultság:</label>
              <select id="jogosultsag" v-model="customerForm.Jogosultsag" required>
                <option value="user">Felhasználó</option>
                <option value="employee">Dolgozó</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div class="form-group">
              <label for="jelszo">Jelszó:</label>
              <input type="password" id="jelszo" v-model="customerForm.Jelszo" required>
            </div>
          </div>
          <button type="submit" class="submit-btn">Ügyfél hozzáadása</button>
        </form>
      </div>

      <!-- Autók hozzáadása -->
      <div v-if="activeTab === 'cars'" class="form-section">
        <h2>Új autó hozzáadása</h2>
        <form @submit.prevent="addCar" class="add-form">
          <div class="form-row">
            <div class="form-group">
              <label for="rendszam">Rendszám:</label>
              <input type="text" id="rendszam" v-model="carForm.Rendszam" required>
            </div>
            <div class="form-group">
              <label for="marka">Márka:</label>
              <input type="text" id="marka" v-model="carForm.Marka" required>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="modell">Modell:</label>
              <input type="text" id="modell" v-model="carForm.Modell" required>
            </div>
            <div class="form-group">
              <label for="evjarat">Évjárat:</label>
              <input type="number" id="evjarat" v-model="carForm.Evjarat" required min="1900" max="2030">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="allapot">Állapot:</label>
              <select id="allapot" v-model="carForm.Allapot" required>
                <option value="Új">Új</option>
                <option value="Használt">Használt</option>
                <option value="Sérült">Sérült</option>
              </select>
            </div>
            <div class="form-group">
              <label for="alvazszam">Alvázszám:</label>
              <input type="text" id="alvazszam" v-model="carForm.Alvazszam" required>
            </div>
          </div>
          <button type="submit" class="submit-btn">Autó hozzáadása</button>
        </form>
      </div>
    </main>

    <!-- Üzenetek -->
    <div v-if="message" :class="['message', messageType]">
      {{ message }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminDashboard',
  data() {
    return {
      activeTab: 'customers',
      userNev: localStorage.getItem('nev') || 'Admin',
      message: '',
      messageType: 'success',
      customerForm: {
        Nev: '',
        Cim: '',
        Telefonszam: '',
        Email: '',
        igSzam: '',
        SzuletesiDatum: '',
        Jogosultsag: 'user',
        Jelszo: ''
      },
      carForm: {
        Rendszam: '',
        Marka: '',
        Modell: '',
        Evjarat: '',
        Allapot: 'Új',
        Alvazszam: ''
      }
    }
  },
  mounted() {
    // Ellenőrizzük, hogy be van-e jelentkezve
    const token = localStorage.getItem('token');
    if (!token) {
      this.$router.push('/');
      return;
    }
  },
  methods: {
    async addCustomer() {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/ugyfelek', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(this.customerForm)
        });

        if (response.ok) {
          this.message = 'Ügyfél sikeresen hozzáadva!';
          this.messageType = 'success';
          this.resetCustomerForm();
        } else {
          const error = await response.json();
          this.message = error.error || 'Hiba történt az ügyfél hozzáadásakor';
          this.messageType = 'error';
        }
      } catch (error) {
        console.error('Error:', error);
        this.message = 'Hálózati hiba történt';
        this.messageType = 'error';
      }

      // Üzenet eltüntetése 5 másodperc után
      setTimeout(() => {
        this.message = '';
      }, 5000);
    },

    async addCar() {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/autok', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(this.carForm)
        });

        if (response.ok) {
          this.message = 'Autó sikeresen hozzáadva!';
          this.messageType = 'success';
          this.resetCarForm();
        } else {
          const error = await response.json();
          this.message = error.error || 'Hiba történt az autó hozzáadásakor';
          this.messageType = 'error';
        }
      } catch (error) {
        console.error('Error:', error);
        this.message = 'Hálózati hiba történt';
        this.messageType = 'error';
      }

      // Üzenet eltüntetése 5 másodperc után
      setTimeout(() => {
        this.message = '';
      }, 5000);
    },

    resetCustomerForm() {
      this.customerForm = {
        Nev: '',
        Cim: '',
        Telefonszam: '',
        Email: '',
        igSzam: '',
        SzuletesiDatum: '',
        Jogosultsag: 'user',
        Jelszo: ''
      };
    },

    resetCarForm() {
      this.carForm = {
        Rendszam: '',
        Marka: '',
        Modell: '',
        Evjarat: '',
        Allapot: 'Új',
        Alvazszam: ''
      };
    },

    logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('jogosultsag');
      localStorage.removeItem('nev');
      localStorage.removeItem('userType');
      this.$router.push('/');
    }
  }
}
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%);
  color: #ffffff;
  padding: 20px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dashboard-header h1 {
  margin: 0;
  font-size: 28px;
  background: linear-gradient(135deg, #ff4757 0%, #ffffff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logout-btn {
  background: rgba(255, 71, 87, 0.8);
  border: 1px solid rgba(255, 71, 87, 0.3);
  color: #ffffff;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: rgba(255, 71, 87, 1);
  transform: translateY(-2px);
}

.dashboard-nav {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  justify-content: center;
}

.dashboard-nav button {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #ffffff;
  padding: 12px 24px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 16px;
}

.dashboard-nav button:hover,
.dashboard-nav button.active {
  background: rgba(255, 71, 87, 0.2);
  border-color: rgba(255, 71, 87, 0.3);
  transform: translateY(-2px);
}

.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
}

.form-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  padding: 30px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.form-section h2 {
  margin-bottom: 25px;
  font-size: 24px;
  text-align: center;
  color: #ffffff;
}

.add-form {
  max-width: 800px;
  margin: 0 auto;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  flex: 1;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #e0e0e0;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #ffffff;
  font-size: 16px;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #ff4757;
  background: rgba(255, 255, 255, 0.12);
  box-shadow: 0 0 10px rgba(255, 71, 87, 0.3);
}

.submit-btn {
  width: 100%;
  padding: 15px 30px;
  background: linear-gradient(135deg, #ff4757 0%, #ff3838 100%);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 71, 87, 0.4);
  margin-top: 20px;
}

.submit-btn:hover {
  background: linear-gradient(135deg, #ff3838 0%, #ff2828 100%);
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(255, 71, 87, 0.6);
}

.message {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 25px;
  border-radius: 10px;
  font-weight: 500;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1000;
  max-width: 400px;
}

.message.success {
  color: #51cf66;
  background: rgba(81, 207, 102, 0.1);
  border-color: rgba(81, 207, 102, 0.3);
}

.message.error {
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
  border-color: rgba(255, 107, 107, 0.3);
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
  }

  .dashboard-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }

  .dashboard-nav {
    flex-direction: column;
  }
}
</style>
