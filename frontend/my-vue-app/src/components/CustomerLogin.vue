<template>
  <div class="login-panel">
    <h2>Ügyfél Bejelentkezés</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="email">Email cím:</label>
        <input
          type="email"
          id="email"
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
  name: 'CustomerLogin',
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

        const response = await fetch('http://localhost:3000/api/auth/login/customer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: this.email,
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
          localStorage.setItem('email', this.email); // Store email instead of name, or store both if returned
          if (data.nev) localStorage.setItem('nev', data.nev);
          localStorage.setItem('userType', 'customer');

          // Redirect to customer dashboard
          setTimeout(() => {
            this.$router.push('/customer-dashboard');
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
/* Master Login Style */
.login-panel {
  max-width: 500px;
  width: 90%;
  margin: 80px auto;
  padding: 60px 50px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5);
  text-align: left;
}

.login-panel h2 {
  color: #ffffff;
  margin-bottom: 40px;
  font-weight: 700;
  font-size: 32px;
  text-align: center;
  background: linear-gradient(to right, #ffffff, #a0a0a0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
}

.form-group {
  margin-bottom: 24px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #b0b0b0;
  font-weight: 500;
  font-size: 14px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

input {
  width: 100%;
  padding: 16px 20px;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #ffffff;
  font-size: 16px;
  transition: all 0.3s ease;
  font-family: inherit;
}

input:focus {
  outline: none;
  border-color: #4facfe;
  background: rgba(0, 0, 0, 0.4);
  box-shadow: 0 0 0 4px rgba(79, 172, 254, 0.1);
}

button {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  margin-top: 10px;
  text-transform: uppercase;
  box-shadow: 0 10px 20px rgba(79, 172, 254, 0.3);
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px rgba(79, 172, 254, 0.4);
}

.message {
  margin-top: 25px;
  padding: 15px;
  border-radius: 10px;
  font-size: 14px;
  text-align: center;
  font-weight: 500;
}

.error {
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.2);
}

.success {
  color: #51cf66;
  background: rgba(81, 207, 102, 0.1);
  border: 1px solid rgba(81, 207, 102, 0.2);
}

@media (max-width: 480px) {
  .login-panel {
    width: 85%;
    padding: 40px 30px;
    margin: 40px auto;
  }
}
</style>
