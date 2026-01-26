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

<style scoped src="../styles/register.css"></style>
