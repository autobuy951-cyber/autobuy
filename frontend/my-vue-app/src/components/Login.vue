<template>
  <div class="login-panel">
    <h2>Dolgozó Bejelentkezés</h2>
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
          // Check if user has employee role
          if (data.jogosultsag !== 'dolgozo') {
            this.message = 'Csak dolgozói jogosultsággal lehet belépni!';
            this.isError = true;
            return;
          }

          this.message = 'Sikeres bejelentkezés! Üdvözöljük!';
          this.isError = false;

          // Store the token and user data
          localStorage.setItem('token', data.token);
          localStorage.setItem('userId', data.userId);
          localStorage.setItem('jogosultsag', data.jogosultsag);
          localStorage.setItem('nev', this.email);
          localStorage.setItem('userType', 'employee');

          // Redirect to employee dashboard
          setTimeout(() => {
            this.$router.push('/employee-dashboard');
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
