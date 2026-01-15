<template>
  <div id="app">
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
  </div>
</template>

<script>
import Login from './components/Login.vue'
import CustomerLogin from './components/CustomerLogin.vue'
import AdminLogin from './components/AdminLogin.vue'

export default {
  name: 'App',
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

<style>
#app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #ffffff;
  margin-top: 60px;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.auth-container {
  max-width: 1200px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}



.app-title {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 10px;
  background: linear-gradient(135deg, #ff4757 0%, #ffffff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.app-subtitle {
  font-size: 16px;
  color: #b0b0b0;
  margin-bottom: 40px;
  font-weight: 400;
}

.user-type-selection {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.user-type-card {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 25px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  text-align: center;
  flex: 1;
  min-width: 200px;
}

.user-type-card:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 71, 87, 0.3);
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(255, 71, 87, 0.2);
}

.user-type-card h3 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #ffffff;
}

.user-type-card p {
  font-size: 14px;
  color: #b0b0b0;
  margin-bottom: 15px;
}

.icon {
  font-size: 40px;
  margin-bottom: 10px;
}

.login-forms {
  position: relative;
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.back-button {
  position: absolute;
  top: -50px;
  left: 0;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}


</style>
