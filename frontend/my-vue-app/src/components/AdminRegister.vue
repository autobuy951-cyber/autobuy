<template>
  <div class="register-panel">
    <h2>Admin Regisztráció</h2>
    <form @submit.prevent="handleRegister">
      <div class="form-group">
        <label for="nev">Felhasználónév:</label>
        <input
          type="text"
          id="nev"
          v-model="nev"
          required
        />
      </div>
      <div class="form-group">
        <label for="jelszo">Jelszó:</label>
        <input
          type="password"
          id="jelszo"
          v-model="jelszo"
          required
          minlength="6"
        />
      </div>
      <div class="form-group">
        <label for="confirmJelszo">Jelszó megerősítése:</label>
        <input
          type="password"
          id="confirmJelszo"
          v-model="confirmJelszo"
          required
          minlength="6"
        />
      </div>
      <button type="submit" :disabled="!isFormValid">Regisztráció</button>
    </form>
    <p v-if="message" :class="{ 'error': isError, 'success': !isError }">{{ message }}</p>
    <router-link to="/" class="login-link">Már van fiókja? Jelentkezzen be!</router-link>
  </div>
</template>

<script>
export default {
  name: 'AdminRegister',
  data() {
    return {
      nev: '',
      jelszo: '',
      confirmJelszo: '',
      message: '',
      isError: false
    }
  },
  computed: {
    isFormValid() {
      return this.nev.trim() &&
             this.jelszo.length >= 6 &&
             this.confirmJelszo.length >= 6 &&
             this.jelszo === this.confirmJelszo;
    }
  },
  methods: {
    async handleRegister() {
      if (!this.isFormValid) {
        this.message = 'Kérjük, töltse ki az összes mezőt helyesen!';
        this.isError = true;
        return;
      }

      try {
        this.message = 'Regisztráció folyamatban...';
        this.isError = false;

        const response = await fetch('http://localhost:3000/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            nev: this.nev,
            jelszo: this.jelszo,
            jogosultsag: 'admin'
          })
        });

        const data = await response.json();

        if (response.ok) {
          this.message = 'Sikeres admin regisztráció! Automatikusan bejelentkezés...';
          this.isError = false;

          // Store the token and user data
          localStorage.setItem('token', data.token);
          localStorage.setItem('userId', data.userId);
          localStorage.setItem('jogosultsag', data.jogosultsag);
          localStorage.setItem('nev', this.nev);

          // Redirect to admin dashboard
          setTimeout(() => {
            this.$router.push('/admin-dashboard');
          }, 1000);
        } else {
          this.message = data.message || 'Hiba történt a regisztráció során';
          this.isError = true;
        }
      } catch (error) {
        console.error('Registration error:', error);
        this.message = 'Hálózati hiba történt. Kérjük, próbálja újra!';
        this.isError = true;
      }
    }
  }
}
</script>

<style scoped>
.register-panel {
  max-width: 400px;
  margin: 0 auto;
  padding: 0;
  background: transparent;
}

.register-panel h2 {
  color: #ffffff;
  margin-bottom: 25px;
  font-weight: 300;
  font-size: 28px;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #e0e0e0;
  font-weight: 500;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

input {
  width: 100%;
  padding: 15px 20px;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #ffffff;
  font-size: 16px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

input:focus {
  outline: none;
  border-color: #ff4757;
  background: rgba(255, 255, 255, 0.12);
  box-shadow: 0 0 20px rgba(255, 71, 87, 0.3);
  transform: translateY(-2px);
}

input::placeholder {
  color: #b0b0b0;
}

button {
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
  margin-top: 10px;
}

button:disabled {
  background: rgba(255, 255, 255, 0.1);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  color: #888;
}

button:hover:not(:disabled) {
  background: linear-gradient(135deg, #ff3838 0%, #ff2828 100%);
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(255, 71, 87, 0.6);
}

.login-link {
  display: block;
  text-align: center;
  margin-top: 20px;
  color: #ffffff;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s ease;
}

.login-link:hover {
  color: #ff4757;
}

.message {
  margin-top: 20px;
  padding: 15px 20px;
  border-radius: 12px;
  font-weight: 500;
  text-align: center;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.error {
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
  border-color: rgba(255, 107, 107, 0.3);
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.2);
}

.success {
  color: #51cf66;
  background: rgba(81, 207, 102, 0.1);
  border-color: rgba(81, 207, 102, 0.3);
  box-shadow: 0 4px 15px rgba(81, 207, 102, 0.2);
}
</style>
