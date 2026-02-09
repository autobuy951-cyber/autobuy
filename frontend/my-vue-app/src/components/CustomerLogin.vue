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
import apiConfig from '../api/config.js';

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

        const response = await fetch(apiConfig.endpoints.auth.loginCustomer, {
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

<style scoped src="../styles/login.css"></style>
