<template>
  <div class="login-container">
    <!-- Háttér effektek -->
    <div class="bg-effects">
      <div class="bg-blob blob-1"></div>
      <div class="bg-blob blob-2"></div>
      <div class="bg-blob blob-3"></div>
    </div>
    
    <div class="login-panel animate-fade-in">
      <!-- Logo és cím -->
      <div class="login-header">
        <div class="logo">
          <span class="logo-icon">🚗</span>
        </div>
        <h1>AutoBuy</h1>
        <p class="subtitle">Autókölcsönző Rendszer</p>
        <div class="role-indicator" :class="detectedRole">
          <span class="role-dot"></span>
          {{ roleText }}
        </div>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="nev">
            <span class="label-icon">👤</span>
            {{ isEmailInput ? 'Email cím' : 'Felhasználónév vagy Email' }}
          </label>
          <input
            type="text"
            id="nev"
            v-model="email"
            :placeholder="isEmailInput ? 'email@pelda.hu' : 'Adja meg a felhasználónevét vagy email címét'"
            required
            @input="checkInputType"
            class="input-field"
          />
          <small v-if="isEmailInput" class="input-hint">
            <span class="hint-icon">💡</span>
            Ügyfél bejelentkezés észlelve
          </small>
        </div>
        
        <div class="form-group">
          <label for="password">
            <span class="label-icon">🔒</span>
            Jelszó
          </label>
          <div class="password-input-wrapper">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="password"
              placeholder="Adja meg a jelszavát"
              required
              class="input-field"
            />
            <button 
              type="button" 
              class="toggle-password"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>
        
        <button type="submit" class="btn-login" :class="detectedRole" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          <span v-else class="btn-text">Bejelentkezés</span>
          <span class="btn-icon">→</span>
        </button>
      </form>
      
      <p v-if="message" :class="['message', { 'error': isError, 'success': !isError }]">
        <span class="message-icon">{{ isError ? '⚠️' : '✅' }}</span>
        {{ message }}
      </p>
      
      <div v-if="needsVerification" class="verification-notice">
        <p>📧 Nem kapta meg a megerősítő emailt?</p>
        <router-link to="/register">Regisztráljon újra</router-link>
      </div>
      
      <div class="links-section">
        <div class="forgot-password-link">
          <router-link to="/forgot-password">
            <span>🔑</span> Elfelejtette jelszavát?
          </router-link>
        </div>
        
        <div class="register-link">
          <span>Még nincs fiókja?</span>
          <router-link to="/register">Regisztráció</router-link>
        </div>
      </div>
    </div>
    
    <!-- Verzió info -->
    <div class="version-info">v2.0 Pro</div>
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
      loading: false,
      needsVerification: false,
      isEmailInput: false,
      showPassword: false
    }
  },
  computed: {
    detectedRole() {
      if (this.isEmailInput) return 'customer';
      return 'employee';
    },
    roleText() {
      if (this.isEmailInput) return 'Ügyfél mód';
      return 'Dolgozó / Admin mód';
    }
  },
  methods: {
    checkInputType() {
      this.isEmailInput = this.email.includes('@');
      if (this.needsVerification && !this.isEmailInput) {
        this.needsVerification = false;
      }
    },
    async handleLogin() {
      try {
        this.loading = true;
        this.message = 'Bejelentkezés folyamatban...';
        this.isError = false;

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

          localStorage.setItem('token', data.token);
          localStorage.setItem('userId', data.userId);
          localStorage.setItem('jogosultsag', data.jogosultsag);
          localStorage.setItem('nev', data.nev || this.email);
          if (isEmail) {
            localStorage.setItem('email', this.email);
            localStorage.setItem('userType', 'customer');
          }

          setTimeout(() => {
            this.redirectBasedOnRole(data.jogosultsag);
          }, 1000);
        } else {
          this.message = data.message || 'Hibás felhasználónév vagy jelszó';
          this.isError = true;
          
          if (data.needsVerification) {
            this.needsVerification = true;
          }
          
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
  position: relative;
  overflow: hidden;
}

/* Háttér effektek */
.bg-effects {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
}

.bg-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
  animation: float 20s infinite ease-in-out;
}

.blob-1 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.2));
  top: -100px;
  left: -100px;
  animation-delay: 0s;
}

.blob-2 {
  width: 350px;
  height: 350px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(59, 130, 246, 0.15));
  bottom: -50px;
  right: -50px;
  animation-delay: -7s;
}

.blob-3 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.1));
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: -14s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(30px, -30px) scale(1.05); }
  50% { transform: translate(-20px, 20px) scale(0.95); }
  75% { transform: translate(20px, 30px) scale(1.02); }
}

/* Fő panel */
.login-panel {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(30px);
  border-radius: 24px;
  padding: 48px;
  width: 100%;
  max-width: 440px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  position: relative;
  z-index: 1;
}

.login-header {
  text-align: center;
  margin-bottom: 36px;
}

.logo {
  margin-bottom: 16px;
}

.logo-icon {
  font-size: 48px;
  display: block;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.login-header h1 {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
}

.subtitle {
  color: rgba(255, 255, 255, 0.5);
  font-size: 1rem;
  margin: 0 0 16px 0;
}

/* Szerepkör jelző */
.role-indicator {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 50px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.role-indicator.customer {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.role-indicator.employee {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.role-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: pulse-dot 2s infinite;
}

.role-indicator.customer .role-dot {
  background: #10b981;
  box-shadow: 0 0 10px #10b981;
}

.role-indicator.employee .role-dot {
  background: #3b82f6;
  box-shadow: 0 0 10px #3b82f6;
}

@keyframes pulse-dot {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.7; }
}

/* Form */
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
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.label-icon {
  font-size: 16px;
}

.input-field {
  width: 100%;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  font-size: 15px;
  transition: all 0.3s ease;
}

.input-field::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.input-field:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(79, 172, 254, 0.5);
  box-shadow: 0 0 20px rgba(79, 172, 254, 0.15);
}

.password-input-wrapper {
  position: relative;
}

.password-input-wrapper .input-field {
  padding-right: 50px;
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.toggle-password:hover {
  opacity: 1;
}

.input-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  color: #34d399;
  font-size: 12px;
}

.hint-icon {
  font-size: 14px;
}

/* Bejelentkezés gomb - dinamikus színek */
.btn-login {
  width: 100%;
  padding: 16px 24px;
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
  overflow: hidden;
}

.btn-login::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.btn-login:hover::before {
  left: 100%;
}

/* Ügyfél (zöld) */
.btn-login.customer {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
}

.btn-login.customer:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(16, 185, 129, 0.5);
}

/* Dolgozó (kék) */
.btn-login.employee {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
}

.btn-login.employee:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(59, 130, 246, 0.5);
}

.btn-login:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-icon {
  transition: transform 0.3s ease;
}

.btn-login:hover:not(:disabled) .btn-icon {
  transform: translateX(4px);
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Üzenetek */
.message {
  margin-top: 20px;
  padding: 14px 18px;
  border-radius: 12px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.message.error {
  background: rgba(255, 71, 87, 0.1);
  border: 1px solid rgba(255, 71, 87, 0.2);
  color: #ff6b6b;
}

.message.success {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  color: #34d399;
}

.message-icon {
  font-size: 18px;
}

/* Linkek szekció */
.links-section {
  margin-top: 28px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.forgot-password-link {
  text-align: center;
  margin-bottom: 16px;
}

.forgot-password-link a {
  color: rgba(255, 255, 255, 0.5);
  text-decoration: none;
  font-size: 14px;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.forgot-password-link a:hover {
  color: #60a5fa;
}

.register-link {
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.register-link a {
  color: #fbbf24;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.register-link a:hover {
  color: #f59e0b;
  text-shadow: 0 0 20px rgba(251, 191, 36, 0.5);
}

/* Megerősítés figyelmeztetés */
.verification-notice {
  margin-top: 16px;
  padding: 16px;
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.2);
  border-radius: 12px;
  text-align: center;
}

.verification-notice p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  margin: 0 0 8px 0;
}

.verification-notice a {
  color: #fbbf24;
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
  transition: color 0.3s;
}

.verification-notice a:hover {
  color: #f59e0b;
}

/* Verzió info */
.version-info {
  position: fixed;
  bottom: 20px;
  right: 20px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
  font-weight: 500;
  letter-spacing: 1px;
}

/* Reszponzív */
@media (max-width: 480px) {
  .login-container {
    padding: 16px;
  }
  
  .login-panel {
    padding: 32px 24px;
    border-radius: 20px;
  }
  
  .login-header h1 {
    font-size: 2rem;
  }
  
  .logo-icon {
    font-size: 40px;
  }
  
  .input-field {
    padding: 12px 14px;
    font-size: 16px;
  }
  
  .btn-login {
    padding: 14px 20px;
  }
}
</style>
