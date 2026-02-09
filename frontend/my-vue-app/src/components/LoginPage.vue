<template>
  <div class="login-container">
    <div class="login-panel">
      <div class="login-header">
        <h1>Autobuy</h1>
        <p class="subtitle">Autókölcsönző Rendszer</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="nev">
            {{ isEmailInput ? 'Email cím:' : 'Felhasználónév vagy Email:' }}
          </label>
          <input
            type="text"
            id="nev"
            v-model="email"
            :placeholder="isEmailInput ? 'email@pelda.hu' : 'Adja meg a felhasználónevét vagy email címét'"
            required
            @input="checkInputType"
          />
          <small v-if="isEmailInput" class="input-hint">Ügyfél bejelentkezés - Email cím szükséges</small>
        </div>
        <div class="form-group">
          <label for="password">Jelszó:</label>
          <input
            type="password"
            id="password"
            v-model="password"
            placeholder="Adja meg a jelszavát"
            required
          />
        </div>
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Bejelentkezés...' : 'Bejelentkezés' }}
        </button>
      </form>
      <p v-if="message" :class="['message', { 'error': isError, 'success': !isError }]">{{ message }}</p>
      
      <div v-if="needsVerification" class="verification-notice">
        <p>📧 Nem kapta meg a megerősítő emailt?</p>
        <router-link to="/register">Regisztráljon újra</router-link>
      </div>
      
      <div class="forgot-password-link">
        <router-link to="/forgot-password">Elfelejtette jelszavát?</router-link>
      </div>
      
      <div class="register-link">
        <span>Még nincs fiókja? </span>
        <router-link to="/register">Regisztráció</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginPage',
  data() {
    return {
      email: '',
      password: '',
      message: '',
      isError: false,
      loading: false,
      needsVerification: false,
      isEmailInput: false
    }
  },
  methods: {
    checkInputType() {
      this.isEmailInput = this.email.includes('@');
      // Ha változik az input típusa, töröljük az előző hibaüzeneteket
      if (this.needsVerification && !this.isEmailInput) {
        this.needsVerification = false;
      }
    },
    async handleLogin() {
      try {
        this.loading = true;
        this.message = 'Bejelentkezés folyamatban...';
        this.isError = false;

        // Determine if input is email or username
        const isEmail = this.email.includes('@');
        const endpoint = isEmail ? '/api/auth/login/customer' : '/api/auth/login';
        const requestBody = isEmail
          ? { email: this.email, jelszo: this.password }
          : { nev: this.email, jelszo: this.password };

        const response = await fetch(`http://localhost:3000${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (response.ok) {
          this.message = 'Sikeres bejelentkezés! Üdvözöljük!';
          this.isError = false;

          // Store the token and user data
          localStorage.setItem('token', data.token);
          localStorage.setItem('userId', data.userId);
          localStorage.setItem('jogosultsag', data.jogosultsag);
          localStorage.setItem('nev', data.nev || this.email);
          if (isEmail) {
            localStorage.setItem('email', this.email);
            localStorage.setItem('userType', 'customer');
          }

          // Redirect based on role
          setTimeout(() => {
            this.redirectBasedOnRole(data.jogosultsag);
          }, 1000);
        } else {
          this.message = data.message || 'Hibás felhasználónév vagy jelszó';
          this.isError = true;
          
          // Ha az email nincs megerősítve, mutassunk linket
          if (data.needsVerification) {
            this.needsVerification = true;
          }
          
          // Ha ügyfél próbál névvel bejelentkezni, jelezzük, hogy email kell
          if (isEmail === false && response.status === 401) {
            this.message = 'Ügyfeleknek email címmel kell bejelentkezniük, nem felhasználónévvel!';
          }
        }
      } catch (error) {
        console.error('Login error:', error);
        this.message = 'Hálózati hiba történt. Kérjük, próbálja újra!';
        this.isError = true;
      } finally {
        this.loading = false;
      }
    },
    redirectBasedOnRole(jogosultsag) {
      switch (jogosultsag) {
        case 'admin':
          this.$router.push('/admin-dashboard');
          break;
        case 'dolgozo':
          this.$router.push('/employee-dashboard');
          break;
        case 'ugyfel':
          this.$router.push('/customer-dashboard');
          break;
        default:
          this.message = 'Ismeretlen jogosultság!';
          this.isError = true;
      }
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
  max-width: 450px;
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
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 500;
}

.form-group input {
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

.btn-primary {
  background: linear-gradient(135deg, #ff4757 0%, #ff6b81 100%);
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  margin-top: 8px;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 71, 87, 0.4);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.message {
  margin-top: 20px;
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

.success {
  background: rgba(46, 213, 115, 0.15);
  border: 1px solid rgba(46, 213, 115, 0.2);
  color: #2ed573;
}

.forgot-password-link {
  margin-top: 20px;
  text-align: center;
}

.forgot-password-link a {
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s;
}

.forgot-password-link a:hover {
  color: #ff4757;
}

.register-link {
  margin-top: 16px;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.register-link a {
  color: #ff4757;
  text-decoration: none;
  font-weight: 500;
}

.register-link a:hover {
  text-decoration: underline;
}

.verification-notice {
  margin-top: 16px;
  padding: 12px;
  background: rgba(255, 165, 2, 0.1);
  border: 1px solid rgba(255, 165, 2, 0.3);
  border-radius: 8px;
  text-align: center;
}

.verification-notice p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  margin: 0 0 8px 0;
}

.verification-notice a {
  color: #ffa502;
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
}

.verification-notice a:hover {
  text-decoration: underline;
}

.input-hint {
  display: block;
  margin-top: 6px;
  color: #4facfe;
  font-size: 12px;
}

/* Reszponzív stílusok mobil eszközökhöz */
@media (max-width: 480px) {
  .login-container {
    padding: 10px;
    min-height: 100vh;
  }
  
  .login-panel {
    padding: 24px 20px;
    border-radius: 12px;
  }
  
  .login-header h1 {
    font-size: 1.8rem;
  }
  
  .subtitle {
    font-size: 0.9rem;
  }
  
  .form-group input {
    padding: 10px 14px;
    font-size: 16px; /* 16px alatt iOS zoomol */
  }
  
  .btn-primary {
    padding: 12px 20px;
    font-size: 15px;
  }
  
  .message {
    font-size: 13px;
    padding: 10px 12px;
  }
}
</style>
