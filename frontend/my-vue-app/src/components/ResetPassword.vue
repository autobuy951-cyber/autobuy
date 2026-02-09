<template>
  <div class="login-container">
    <div class="login-panel">
      <div class="login-header">
        <h1>Autobuy</h1>
        <p class="subtitle">Új jelszó beállítása</p>
      </div>

      <form @submit.prevent="handleSubmit" class="login-form" v-if="!success">
        <div class="form-group">
          <label for="password">Új jelszó:</label>
          <input
            type="password"
            id="password"
            v-model="password"
            placeholder="Min. 6 karakter"
            required
            minlength="6"
          />
        </div>
        <div class="form-group">
          <label for="confirmPassword">Jelszó megerősítése:</label>
          <input
            type="password"
            id="confirmPassword"
            v-model="confirmPassword"
            placeholder="Írja be újra a jelszót"
            required
          />
        </div>
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Mentés...' : 'Jelszó megváltoztatása' }}
        </button>
      </form>

      <div v-else class="success-message">
        <div class="success-icon">✅</div>
        <h3>Sikeres jelszóváltoztatás!</h3>
        <p>Most már bejelentkezhet az új jelszavával.</p>
        <div class="login-info">
          <p><strong>Email cím:</strong> {{ $route.query.email }}</p>
          <p class="hint">💡 Használja az email címét a bejelentkezéshez!</p>
        </div>
        <button @click="goToLogin" class="btn-secondary">Bejelentkezés</button>
      </div>

      <p v-if="error && !success" class="message error">{{ error }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ResetPassword',
  data() {
    return {
      password: '',
      confirmPassword: '',
      loading: false,
      success: false,
      message: '',
      error: ''
    }
  },
  mounted() {
    // Ellenőrizzük, hogy van-e token az URL-ben
    const token = this.$route.query.token;
    const email = this.$route.query.email;
    
    if (!token || !email) {
      this.error = 'Érvénytelen vagy hiányzó visszaállítási link';
    }
  },
  methods: {
    async handleSubmit() {
      try {
        this.loading = true;
        this.error = '';

        // Ellenőrizzük, hogy egyeznek-e a jelszavak
        if (this.password !== this.confirmPassword) {
          this.error = 'A két jelszó nem egyezik';
          this.loading = false;
          return;
        }

        const token = this.$route.query.token;
        const email = this.$route.query.email;

        if (!token || !email) {
          this.error = 'Érvénytelen vagy hiányzó visszaállítási link';
          this.loading = false;
          return;
        }

        const response = await fetch('http://localhost:3000/api/auth/reset-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: email,
            token: token,
            newPassword: this.password
          })
        });

        const data = await response.json();

        if (response.ok) {
          this.success = true;
          this.message = data.message;
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
  color: rgba(255, 255, 255, 0.8);
  font-size: 16px;
  margin-bottom: 12px;
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

.login-info {
  background: rgba(79, 172, 254, 0.1);
  border: 1px solid rgba(79, 172, 254, 0.3);
  border-radius: 8px;
  padding: 16px;
  margin: 20px 0;
  text-align: left;
}

.login-info p {
  margin: 8px 0;
  color: white;
}

.login-info .hint {
  color: #ffa502;
  font-size: 14px;
  margin-top: 12px;
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
