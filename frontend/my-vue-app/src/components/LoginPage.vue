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

<style scoped>
.auth-container {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%);
  padding: 20px;
}

.app-title {
  font-size: 64px;
  font-weight: 800;
  margin-bottom: 15px;
  background: linear-gradient(135deg, #ff4757 0%, #ffffff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
  text-align: center;
  letter-spacing: -1px;
}

.app-subtitle {
  font-size: 20px;
  color: #b0b0b0;
  margin-bottom: 60px;
  font-weight: 400;
  text-align: center;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.user-type-selection {
  display: flex;
  gap: 30px;
  justify-content: center;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.user-type-card {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 40px 30px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  backdrop-filter: blur(10px);
  text-align: center;
  flex: 1;
  min-width: 240px;
  max-width: 300px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.user-type-card:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 71, 87, 0.5);
  transform: translateY(-10px) scale(1.02);
  box-shadow: 0 20px 40px rgba(255, 71, 87, 0.25);
}

.user-type-card h3 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 12px;
  color: #ffffff;
}

.user-type-card p {
  font-size: 16px;
  color: #c0c0c0;
  margin-bottom: 20px;
  line-height: 1.5;
}

.icon {
  font-size: 60px;
  margin-bottom: 20px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

@media (max-width: 768px) {
  .app-title {
    font-size: 42px;
  }
  
  .user-type-card {
    padding: 30px 20px;
    max-width: 100%;
  }
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

@media (max-width: 768px) {
  .auth-container {
    padding: 20px 15px;
    margin: 10px;
  }

  .app-title {
    font-size: 26px;
  }

  .user-type-selection {
    flex-direction: column;
    gap: 15px;
  }

  .user-type-card {
    min-width: 100%;
  }

  .back-button {
    position: static;
    display: block;
    margin-bottom: 20px;
    width: 100%;
    text-align: center;
    background: rgba(255, 255, 255, 0.15);
  }
}</style>
