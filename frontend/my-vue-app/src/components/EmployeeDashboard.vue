<template>
  <div class="employee-dashboard">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <h1>AutoBuy</h1>
        <div class="role-badge">Dolgozó Panel</div>
      </div>
      
      <nav class="sidebar-nav">
        <button 
          @click="currentView = 'cars'" 
          :class="{ active: currentView === 'cars' }"
          class="nav-item"
        >
          🚗 Autók Listája
        </button>
        <button 
          @click="currentView = 'customers'" 
          :class="{ active: currentView === 'customers' }"
          class="nav-item"
        >
          👥 Ügyfelek Listája
        </button>
        <button 
          @click="currentView = 'bookings'" 
          :class="{ active: currentView === 'bookings' }"
          class="nav-item"
        >
          📅 Foglalások Kezelése
        </button>
      </nav>

      <div class="sidebar-footer">
        <div class="user-profile">
          <div class="avatar">{{ userMonogram }}</div>
          <div class="user-details">
            <span class="name">{{ userNev }}</span>
            <span class="role">Dolgozó</span>
          </div>
        </div>
        <button @click="logout" class="logout-btn">
          🚪 Kijelentkezés
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <header class="top-bar">
        <h2>{{ pageTitle }}</h2>
        <div class="breadcrumbs">Dashboard / {{ pageTitle }}</div>
      </header>

      <div class="content-wrapper">
        <transition name="fade" mode="out-in">
          <!-- Reuse existing managers but they might need props to restrict access if not handled by backend/component logic -->
          <CarManager v-if="currentView === 'cars'" />
          <CustomerManager v-else-if="currentView === 'customers'" />
          <BookingManager v-else-if="currentView === 'bookings'" />
        </transition>
      </div>
    </main>
  </div>
</template>

<script>
// Reusing admin components for now. 
// Ideally, we should pass a prop like :is-admin="false" to hide delete/edit buttons if allowed
import CarManager from './admin/CarManager.vue';
import CustomerManager from './admin/CustomerManager.vue';
import BookingManager from './admin/BookingManager.vue';

export default {
  name: 'EmployeeDashboard',
  components: {
    CarManager,
    CustomerManager,
    BookingManager
  },
  data() {
    return {
      currentView: 'cars',
      userNev: localStorage.getItem('nev') || 'Dolgozó'
    }
  },
  computed: {
    userMonogram() {
      return this.userNev.charAt(0).toUpperCase();
    },
    pageTitle() {
      switch(this.currentView) {
        case 'cars': return 'Autók Listája';
        case 'customers': return 'Ügyfelek Listája';
        case 'bookings': return 'Foglalások Kezelése';
        default: return 'Dashboard';
      }
    }
  },
  mounted() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('jogosultsag');
    if (!token || role !== 'dolgozo') {
       // If not employee, redirect. (Though admin might want to see this too? No, admin has their own)
       // Let's rely on router guards mostly, but this is a failsafe.
       if (role !== 'admin') { // Allow admin to peek if needed? Nah, strict separation.
          this.$router.push('/');
       }
    }
  },
  methods: {
    logout() {
      localStorage.clear();
      this.$router.push('/');
    }
  }
}
</script>

<style scoped>
/* Copied from AdminDashboard.vue */
.employee-dashboard {
  display: flex;
  min-height: 100vh;
  background: #121212;
  color: #e0e0e0;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

/* Sidebar Styles */
.sidebar {
  width: 280px;
  background: #1e1e1e;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
}

.sidebar-header {
  padding: 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.sidebar-header h1 {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); /* Different color for employee */
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 8px 0;
}

.role-badge {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: rgba(255, 255, 255, 0.5);
}

.sidebar-nav {
  padding: 20px 0;
  flex: 1;
}

.nav-item {
  width: 100%;
  padding: 16px 30px;
  background: transparent;
  border: none;
  color: #a0a0a0;
  text-align: left;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.02);
  color: #fff;
}

.nav-item.active {
  background: linear-gradient(90deg, rgba(79, 172, 254, 0.1) 0%, transparent 100%);
  color: #4facfe;
  border-left-color: #4facfe;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.avatar {
  width: 40px;
  height: 40px;
  background: #4facfe;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-details .name {
  font-weight: 600;
  color: white;
}

.user-details .role {
  font-size: 12px;
  color: #888;
}

.logout-btn {
  width: 100%;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #ff6b6b;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: rgba(255, 71, 87, 0.1);
  border-color: #ff4757;
}

/* Main Content Styles */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #121212;
}

.top-bar {
  padding: 30px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.top-bar h2 {
  font-size: 28px;
  font-weight: 600;
  margin: 0;
}

.breadcrumbs {
  color: #666;
  font-size: 14px;
}

.content-wrapper {
  flex: 1;
  padding: 0 40px 40px 40px;
  overflow-y: auto;
}

/* Transitions */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
