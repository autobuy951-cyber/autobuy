<template>
  <div class="login-container">
    <div class="login-panel">
      <div class="login-header">
        <h1>Autobuy</h1>
        <p class="subtitle">Regisztráció</p>
      </div>

      <!-- Regisztrációs form -->
      <form @submit.prevent="handleRegister" class="login-form" v-if="!registered">
        <div class="form-group">
          <label for="nev">Név:</label>
          <input
            type="text"
            id="nev"
            v-model="form.Nev"
            placeholder="Teljes név"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="email">Email:</label>
          <input
            type="email"
            id="email"
            v-model="form.Email"
            placeholder="email@pelda.hu"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="telefon">Telefonszám:</label>
          <input
            type="tel"
            id="telefon"
            v-model="form.Telefonszam"
            placeholder="+36 30 123 4567"
            required
          />
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="igazolvany">Igazolványszám:</label>
            <input
              type="text"
              id="igazolvany"
              v-model="form.igSzam"
              placeholder="123456AB"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="szuletesiDatum">Születési dátum:</label>
            <input
              type="date"
              id="szuletesiDatum"
              v-model="form.SzuletesiDatum"
              required
            />
          </div>
        </div>
        
        <div class="form-group">
          <label for="cim">Cím:</label>
          <input
            type="text"
            id="cim"
            v-model="form.Cim"
            placeholder="Irányítószám, Város, Utca házszám"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="jelszo">Jelszó:</label>
          <input
            type="password"
            id="jelszo"
            v-model="form.Jelszo"
            placeholder="Min. 6 karakter"
            required
            minlength="6"
          />
        </div>
        
        <div class="form-group">
          <label for="jelszoMegerosites">Jelszó megerősítése:</label>
          <input
            type="password"
            id="jelszoMegerosites"
            v-model="jelszoMegerosites"
            placeholder="Jelszó újra"
            required
          />
        </div>
        
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Regisztráció...' : 'Regisztráció' }}
        </button>
      </form>

      <!-- Sikeres regisztráció üzenet -->
      <div v-else class="success-message">
        <div class="success-icon">✅</div>
        <h3>Sikeres regisztráció!</h3>
        <p>Kérjük, erősítse meg email címét.</p>
        <p class="email-sent">📧 Küldtünk egy megerősítő linket a <strong>{{ form.Email }}</strong> címre.</p>
        <p class="spam-notice">(Ha nem látja, nézze meg a spam/junk mappában is!)</p>
        <button @click="goToLogin" class="btn-secondary">Vissza a bejelentkezéshez</button>
      </div>

      <p v-if="error && !registered" class="message error">{{ error }}</p>
      
      <div class="back-link" v-if="!registered">
        <span>Már van fiókja? </span>
        <router-link to="/">Bejelentkezés</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RegisterPage',
  data() {
    return {
      form: {
        Nev: '',
        Email: '',
        Telefonszam: '',
        igSzam: '',
        SzuletesiDatum: '',
        Cim: '',
        Jelszo: '',
        Jogosultsag: 'customer'
      },
      jelszoMegerosites: '',
      loading: false,
      registered: false,
      error: ''
    }
  },
  methods: {
    async handleRegister() {
      try {
        this.loading = true;
        this.error = '';

        // Jelszó ellenőrzés
        if (this.form.Jelszo !== this.jelszoMegerosites) {
          this.error = 'A két jelszó nem egyezik';
          this.loading = false;
          return;
        }

        if (this.form.Jelszo.length < 6) {
          this.error = 'A jelszónak legalább 6 karakter hosszúnak kell lennie';
          this.loading = false;
          return;
        }

        const response = await fetch('/api/auth/register/customer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.form)
        });

        const data = await response.json();

        if (response.ok) {
          this.registered = true;
        } else {
          // Részletes hibaüzenet megjelenítése
          if (data.message) {
            this.error = data.message;
          } else if (data.error) {
            this.error = data.error;
          } else {
            this.error = 'Hiba történt a regisztráció során. Kérjük, próbálja újra!';
          }
          console.error('Regisztrációs hiba:', data);
        }
      } catch (error) {
        console.error('Error:', error);
        this.error = 'Hálózati hiba történt';
      } finally {
        this.loading = false;
      }
    },
    goToLogin() {
      this.$router.push('/');
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
}

.login-panel {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 500px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #ff4757 0%, #ff6b81 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  color: rgba(255, 255, 255, 0.6);
  font-size: 1rem;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-row .form-group {
  flex: 1;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 6px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 500;
}

.form-group input,
.form-group select {
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-group input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.form-group input:focus {
  outline: none;
  border-color: #ff4757;
  background: rgba(0, 0, 0, 0.4);
}

input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
}

.btn-primary {
  background: linear-gradient(135deg, #ff4757 0%, #ff6b81 100%);
  border: none;
  padding: 14px 24px;
  border-radius: 8px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  margin-top: 10px;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 71, 87, 0.4);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-secondary {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 20px;
  width: 100%;
  font-size: 14px;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.05);
}

.message {
  margin-top: 16px;
  padding: 12px 16px;
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
}

.error {
  background: rgba(255, 71, 87, 0.15);
  border: 1px solid rgba(255, 71, 87, 0.2);
  color: #ff4757;
}

.success-message {
  text-align: center;
  padding: 20px 0;
}

.success-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.success-message h3 {
  color: #2ed573;
  font-size: 24px;
  margin: 0 0 16px 0;
}

.success-message p {
  color: rgba(255, 255, 255, 0.8);
  margin: 8px 0;
}

.email-sent {
  background: rgba(79, 172, 254, 0.1);
  border: 1px solid rgba(79, 172, 254, 0.3);
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
}

.spam-notice {
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
  font-style: italic;
}

.back-link {
  margin-top: 24px;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.back-link a {
  color: #ff4757;
  text-decoration: none;
  font-weight: 500;
}

.back-link a:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .login-panel {
    padding: 24px 20px;
  }
  
  .login-header h1 {
    font-size: 2rem;
  }
  
  .form-row {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
