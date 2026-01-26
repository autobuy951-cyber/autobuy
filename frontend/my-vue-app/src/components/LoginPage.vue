<template>
  <div class="auth-container">
    <h1 class="app-title">Autobuy</h1>
    <p class="app-subtitle">Válassza ki a bejelentkezés típusát</p>

    <div class="user-type-selection" v-if="!selectedUserType">
      <div class="user-type-card" @click="selectUserType('customer')">
        <h3>Ügyfél</h3>
        <p>Autó vásárlás és foglalás</p>
        <div class="icon">👤</div>
      </div>

      <div class="user-type-card" @click="selectUserType('employee')">
        <h3>Dolgozó</h3>
        <p>Autók és ügyfelek kezelése</p>
        <div class="icon">👨‍💼</div>
      </div>

      <div class="user-type-card" @click="selectUserType('admin')">
        <h3>Admin</h3>
        <p>Rendszer adminisztráció</p>
        <div class="icon">⚙️</div>
      </div>
    </div>

    <div class="login-forms" v-if="selectedUserType">
      <button @click="goBack" class="back-button">← Vissza</button>
      <CustomerLogin v-if="selectedUserType === 'customer'" />
      <Login v-if="selectedUserType === 'employee'" />
      <AdminLogin v-if="selectedUserType === 'admin'" />
    </div>
  </div>
</template>

<script>
import Login from './Login.vue'
import CustomerLogin from './CustomerLogin.vue'
import AdminLogin from './AdminLogin.vue'

export default {
  name: 'LoginPage',
  components: {
    Login,
    CustomerLogin,
    AdminLogin
  },
  data() {
    return {
      selectedUserType: null
    }
  },
  methods: {
    selectUserType(type) {
      this.selectedUserType = type;
    },
    goBack() {
      this.selectedUserType = null;
    }
  }
}
</script>

<style scoped src="./LoginPage.css"></style>
