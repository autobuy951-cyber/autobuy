<template>
  <div class="login-panel">
    <h2>Bejelentkezés</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="nev">Felhasználónév:</label>
        <input
          type="text"
          id="nev"
          v-model="email"
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
      <button type="submit">Bejelentkezés</button>
    </form>
    <p v-if="message" :class="{ 'error': isError, 'success': !isError }">{{ message }}</p>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      email: '',
      password: '',
      message: '',
      isError: false
    }
  },
  methods: {
    async handleLogin() {
      try {
        this.message = 'Bejelentkezés folyamatban...';
        this.isError = false;

        const response = await fetch('http://localhost:3000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            nev: this.email,
            jelszo: this.password
          })
        });

        const data = await response.json();

        if (response.ok) {
          this.message = 'Sikeres bejelentkezés! Üdvözöljük!';
          this.isError = false;

          // Store the token and user data
          localStorage.setItem('token', data.token);
          localStorage.setItem('userId', data.userId);
          localStorage.setItem('jogosultsag', data.jogosultsag);
          localStorage.setItem('nev', this.email); // Store username for display

          // Open oldal2.html in a new tab after successful login
          setTimeout(() => {
            window.open('/oldal2.html', '_blank');
          }, 1000);
        } else {
          this.message = data.message || 'Hibás felhasználónév vagy jelszó';
          this.isError = true;
        }
      } catch (error) {
        console.error('Login error:', error);
        this.message = 'Hálózati hiba történt. Kérjük, próbálja újra!';
        this.isError = true;
      }
    }
  }
}
</script>

<style scoped>
.login-panel {
  max-width: 400px;
  margin: 0 auto;
  padding: 0;
  background: transparent;
}

.login-panel h2 {
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

button:hover {
  background: linear-gradient(135deg, #ff3838 0%, #ff2828 100%);
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(255, 71, 87, 0.6);
}

.message {
  margin-top: 20px;
  padding: 15px 20px;
  border-radius: 12px;
  font-weight: 500;
  text-align: center;
  backdrop-filter: blur(10px);
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
