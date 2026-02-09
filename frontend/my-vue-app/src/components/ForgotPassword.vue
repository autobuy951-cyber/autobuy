<template>
  <div class="login-container">
    <div class="login-panel">
      <div class="login-header">
        <h1>Autobuy</h1>
        <p class="subtitle">Jelszó visszaállítás</p>
      </div>

      <form @submit.prevent="handleSubmit" class="login-form" v-if="!sent">
        <div class="form-group">
          <label for="email">Email cím:</label>
          <input
            type="email"
            id="email"
            v-model="email"
            placeholder="Adja meg az email címét"
            required
          />
        </div>
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Küldés...' : 'Visszaállítási link küldése' }}
        </button>
      </form>

      <div v-else class="success-message">
        <p>✅ {{ message }}</p>
        <p class="dev-link" v-if="devLink">
          <strong>Fejlesztési link:</strong><br>
          <a :href="devLink" target="_blank">{{ devLink }}</a>
        </p>
        <button @click="goToLogin" class="btn-secondary">Vissza a bejelentkezéshez</button>
      </div>

      <p v-if="error && !sent" class="message error">{{ error }}</p>
      
      <div class="back-link">
        <a @click="goToLogin">← Vissza a bejelentkezéshez</a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ForgotPassword',
  data() {
    return {
      email: '',
      loading: false,
      sent: false,
      message: '',
      error: '',
      devLink: ''
    }
  },
  methods: {
    async handleSubmit() {
      try {
        this.loading = true;
        this.error = '';

        const response = await fetch('http://localhost:3000/api/auth/forgot-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email: this.email })
        });

        const data = await response.json();

        if (response.ok) {
          this.sent = true;
          this.message = data.message;
          this.devLink = data.devLink || '';
        } else {
          this.error = data.error || 'Hiba történt';
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

.btn-secondary {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 20px;
  width: 100%;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.05);
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

.success-message {
  text-align: center;
  padding: 20px 0;
}

.success-message p {
  color: #2ed573;
  font-size: 16px;
  margin-bottom: 20px;
}

.dev-link {
  background: rgba(255, 255, 255, 0.05);
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
  word-break: break-all;
}

.dev-link a {
  color: #4facfe;
  text-decoration: none;
}

.back-link {
  margin-top: 20px;
  text-align: center;
}

.back-link a {
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  text-decoration: none;
  font-size: 14px;
}

.back-link a:hover {
  color: #ff4757;
}

@media (max-width: 480px) {
  .login-panel {
    padding: 24px 20px;
  }
  
  .login-header h1 {
    font-size: 1.8rem;
  }
}
</style>
