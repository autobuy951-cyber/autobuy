<template>
  <div class="login-container">
    <div class="login-panel">
      <div class="login-header">
        <h1>Autobuy</h1>
        <p class="subtitle">Email megerősítés</p>
      </div>

      <!-- Betöltés -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Email megerősítése folyamatban...</p>
      </div>

      <!-- Sikeres megerősítés -->
      <div v-else-if="verified" class="success-message">
        <div class="success-icon">✅</div>
        <h3>Email sikeresen megerősítve!</h3>
        <p>Fiókja most már aktív. Bejelentkezhet az oldalra.</p>
        <button @click="goToLogin" class="btn-secondary">Bejelentkezés</button>
      </div>

      <!-- Hiba -->
      <div v-else-if="error" class="error-message">
        <div class="error-icon">❌</div>
        <h3>Hiba történt</h3>
        <p>{{ error }}</p>
        <button @click="goToLogin" class="btn-secondary">Vissza a bejelentkezéshez</button>
      </div>

      <!-- Érvénytelen link -->
      <div v-else class="info-message">
        <div class="info-icon">⚠️</div>
        <h3>Érvénytelen link</h3>
        <p>Az email megerősítő link érvénytelen vagy hiányzik.</p>
        <button @click="goToLogin" class="btn-secondary">Vissza a bejelentkezéshez</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VerifyEmail',
  data() {
    return {
      loading: false,
      verified: false,
      error: ''
    }
  },
  async mounted() {
    const token = this.$route.query.token;
    const email = this.$route.query.email;
    
    if (token && email) {
      await this.verifyEmail(email, token);
    }
  },
  methods: {
    async verifyEmail(email, token) {
      try {
        this.loading = true;
        
        const response = await fetch('http://localhost:3000/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, token })
        });

        const data = await response.json();

        if (response.ok) {
          this.verified = true;
        } else {
          this.error = data.error || 'Érvénytelen vagy lejárt megerősítő link';
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
  max-width: 450px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
}

.login-header {
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

.loading-state {
  padding: 40px 0;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #ff4757;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.success-message,
.error-message,
.info-message {
  padding: 20px 0;
}

.success-icon,
.error-icon,
.info-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.success-message h3 {
  color: #2ed573;
  font-size: 24px;
  margin: 0 0 16px 0;
}

.error-message h3 {
  color: #ff4757;
  font-size: 24px;
  margin: 0 0 16px 0;
}

.info-message h3 {
  color: #ffa502;
  font-size: 24px;
  margin: 0 0 16px 0;
}

.success-message p,
.error-message p,
.info-message p {
  color: rgba(255, 255, 255, 0.8);
  margin: 8px 0;
}

.btn-secondary {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 24px;
  font-size: 14px;
  transition: all 0.3s;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.05);
}

@media (max-width: 480px) {
  .login-panel {
    padding: 24px 20px;
  }
  
  .login-header h1 {
    font-size: 2rem;
  }
}
</style>
