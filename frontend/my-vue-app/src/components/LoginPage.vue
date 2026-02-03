<template>
  <div class="auth-container">
    <h1 class="app-title">Autobuy</h1>
    <p class="app-subtitle">Bejelentkezés</p>

    <div class="login-form">
      <form @submit.prevent="handleLogin">
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
            required
          />
        </div>
        <button type="submit" :disabled="loading">
          {{ loading ? 'Bejelentkezés...' : 'Bejelentkezés' }}
        </button>
      </form>
      <p v-if="message" :class="{ 'error': isError, 'success': !isError }">{{ message }}</p>
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
.auth-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.app-title {
  font-size: 3rem;
  color: white;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.app-subtitle {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 40px;
}

.login-form {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: white;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 16px;
  transition: border-color 0.3s;
}

.form-group input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.form-group input:focus {
  outline: none;
  border-color: #ff4757;
  background: rgba(255, 255, 255, 0.2);
}

button[type="submit"] {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #ff4757 0%, #ff6b81 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

button[type="submit"]:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 71, 87, 0.4);
}

button[type="submit"]:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.message {
  margin-top: 20px;
  padding: 10px;
  border-radius: 4px;
  text-align: center;
  font-weight: 500;
}

.error {
  background: rgba(255, 71, 87, 0.2);
  border: 1px solid rgba(255, 71, 87, 0.3);
  color: #ff4757;
}

.success {
  background: rgba(46, 213, 115, 0.2);
  border: 1px solid rgba(46, 213, 115, 0.3);
  color: #2ed573;
}
</style>
