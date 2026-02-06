<template>
  <div class="login-container">
    <div class="login-panel">
      <div class="login-header">
        <h1>Autobuy</h1>
        <p class="subtitle">Autókölcsönző Rendszer</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="nev">Felhasználónév vagy Email:</label>
          <input
            type="text"
            id="nev"
            v-model="email"
            placeholder="Adja meg a felhasználónevét vagy email címét"
            required
          />
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
    </div>
  </div>
</template>

<script>
import apiConfig from '../api/config.js';

export default {
  name: 'LoginPage',
  data() {
    return {
      email: '',
      password: '',
      message: '',
      isError: false,
      loading: false
    }
  },
  methods: {
    async handleLogin() {
      try {
        this.loading = true;
        this.message = 'Bejelentkezés folyamatban...';
        this.isError = false;

        // Determine if input is email or username
        const isEmail = this.email.includes('@');
        const endpoint = isEmail ? apiConfig.endpoints.auth.loginCustomer : apiConfig.endpoints.auth.login;
        const requestBody = isEmail
          ? { email: this.email, jelszo: this.password }
          : { nev: this.email, jelszo: this.password };

        const response = await fetch(endpoint, {
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
</style>
