<template>
  <div class="login-panel">
    <h2>Admin Bejelentkezés</h2>
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
    <router-link to="/register/admin" class="register-link">Nincs még fiókja? Regisztráljon!</router-link>
  </div>
</template>

<script>
export default {
  name: 'AdminLogin',
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
          // Check if user has admin role
          if (data.jogosultsag !== 'admin') {
            this.message = 'Nincs jogosultsága az admin felülethez!';
            this.isError = true;
            return;
          }

          this.message = 'Sikeres admin bejelentkezés! Üdvözöljük!';
          this.isError = false;

          // Store the token and user data
          localStorage.setItem('token', data.token);
          localStorage.setItem('userId', data.userId);
          localStorage.setItem('jogosultsag', data.jogosultsag);
          localStorage.setItem('nev', this.email);
          localStorage.setItem('userType', 'admin');

          // Redirect to admin dashboard
          setTimeout(() => {
            this.$router.push('/admin-dashboard');
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
  max-width: 650px; /* Increased from 550px */
  margin: 0 auto;
  padding: 60px 50px; /* Increased padding */
  background: rgba(0, 0, 0, 0.2); /* Slightly darker for better contrast */
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 30px; /* More rounded */
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}

.login-panel h2 {
  color: #ffffff;
  margin-bottom: 40px;
  font-weight: 700;
  font-size: 36px; /* Larger title */
  text-align: center;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
  letter-spacing: 1px;
}

.form-group {
  margin-bottom: 30px; /* More spacing */
}

label {
  display: block;
  margin-bottom: 12px;
  color: #e0e0e0;
  font-weight: 600;
  font-size: 16px; /* Larger label */
  text-transform: uppercase;
  letter-spacing: 1px;
}

input {
  width: 100%;
  padding: 18px 25px; /* Larger input padding */
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  color: #ffffff;
  font-size: 18px; /* Larger input text */
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

input:focus {
  outline: none;
  border-color: #ff4757;
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 25px rgba(255, 71, 87, 0.4);
  transform: translateY(-2px);
}

button {
  width: 100%;
  padding: 20px 30px; /* Larger button */
  background: linear-gradient(135deg, #ff4757 0%, #ff3838 100%);
  color: white;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  font-size: 20px; /* Larger button text */
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  transition: all 0.3s ease;
  box-shadow: 0 10px 30px rgba(255, 71, 87, 0.5);
  margin-top: 20px;
}

button:hover {
  background: linear-gradient(135deg, #ff3838 0%, #ff2828 100%);
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(255, 71, 87, 0.7);
}

.register-link {
  display: block;
  text-align: center;
  margin-top: 30px;
  color: #ffffff;
  text-decoration: none;
  font-size: 16px; /* Larger link */
  transition: color 0.3s ease;
  opacity: 0.8;
}

.register-link:hover {
  color: #ff4757;
  opacity: 1;
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

@media (max-width: 480px) {
  .login-panel {
    padding: 40px 25px;
    margin: 0 15px;
    width: auto;
  }
  .login-panel h2 {
    font-size: 24px;
    margin-bottom: 20px;
  }

  input {
    padding: 12px 15px;
    font-size: 16px; /* Prevents auto-zoom on iOS */
  }

  button {
    padding: 12px 20px;
  }
}
</style>
