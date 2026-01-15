<template>
  <div id="app">
    <div class="auth-container">
      <div class="auth-tabs">
        <button
          @click="activeTab = 'login'"
          :class="{ active: activeTab === 'login' }"
          class="tab-button"
        >
          Bejelentkezés
        </button>
        <button
          @click="activeTab = 'register'"
          :class="{ active: activeTab === 'register' }"
          class="tab-button"
        >
          Regisztráció
        </button>
      </div>

      <div class="tab-content">
        <Login v-if="activeTab === 'login'" />
        <Register v-if="activeTab === 'register'" />
      </div>
    </div>
  </div>
</template>

<script>
import Login from './components/Login.vue'
import Register from './components/Register.vue'

export default {
  name: 'App',
  components: {
    Login,
    Register
  },
  data() {
    return {
      activeTab: 'login' // Default to login tab
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
  max-width: 500px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.auth-tabs {
  display: flex;
  margin-bottom: 30px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 15px;
  padding: 5px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.tab-button {
  flex: 1;
  padding: 15px 25px;
  background: transparent;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  color: #b0b0b0;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tab-button:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.tab-button.active {
  color: #ffffff;
  background: linear-gradient(135deg, #ff4757 0%, #ff3838 100%);
  box-shadow: 0 4px 15px rgba(255, 71, 87, 0.4);
  transform: translateY(-2px);
}

.tab-content {
  margin-top: 20px;
}
</style>
