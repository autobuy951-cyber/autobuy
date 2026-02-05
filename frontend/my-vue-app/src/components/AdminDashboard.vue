<template>
  <div class="admin-dashboard">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <h1>AutoBuy</h1>
        <div class="role-badge">Admin Panel</div>
      </div>
      
      <nav class="sidebar-nav">
        <button 
          @click="currentView = 'cars'" 
          :class="{ active: currentView === 'cars' }"
          class="nav-item"
        >
          🚗 Autók Kezelése
        </button>
        <button 
          @click="currentView = 'customers'" 
          :class="{ active: currentView === 'customers' }"
          class="nav-item"
        >
          👥 Ügyfelek Kezelése
        </button>
        <button 
          @click="currentView = 'employees'" 
          :class="{ active: currentView === 'employees' }"
          class="nav-item"
        >
          👔 Dolgozók Kezelése
        </button>
        <button 
          @click="currentView = 'bookings'" 
          :class="{ active: currentView === 'bookings' }"
          class="nav-item"
        >
          📅 Foglalások
        </button>
        <button 
          @click="currentView = 'pickup'" 
          :class="{ active: currentView === 'pickup' }"
          class="nav-item"
        >
          🚗 Elvitel rögzítése
        </button>
        <button 
          @click="currentView = 'return'" 
          :class="{ active: currentView === 'return' }"
          class="nav-item"
        >
          🔄 Visszahozatal rögzítése
        </button>
        <button 
          @click="currentView = 'stats'" 
          :class="{ active: currentView === 'stats' }"
          class="nav-item"
        >
          📊 Statisztikák
        </button>
        <button 
          @click="currentView = 'customerHistory'" 
          :class="{ active: currentView === 'customerHistory' }"
          class="nav-item"
        >
          📋 Ügyfél Előzmények
        </button>
      </nav>

      <div class="sidebar-footer">
        <div class="user-profile">
          <div class="avatar">{{ userMonogram }}</div>
          <div class="user-details">
            <span class="name">{{ userNev }}</span>
            <span class="role">Adminisztrátor</span>
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
          <CarManager v-if="currentView === 'cars'" />
          <CustomerManager v-else-if="currentView === 'customers'" />
          <EmployeeManager v-else-if="currentView === 'employees'" />
          <BookingManager v-else-if="currentView === 'bookings'" />
          <PickupManager v-else-if="currentView === 'pickup'" />
          <ReturnManager v-else-if="currentView === 'return'" />
          <StatsManager v-else-if="currentView === 'stats'" />
          <CustomerHistory v-else-if="currentView === 'customerHistory'" />
        </transition>
      </div>
    </main>
  </div>
</template>

<script>
import CarManager from './admin/CarManager.vue';
import CustomerManager from './admin/CustomerManager.vue';
import EmployeeManager from './admin/EmployeeManager.vue';
import BookingManager from './admin/BookingManager.vue';
import PickupManager from './admin/PickupManager.vue';
import ReturnManager from './admin/ReturnManager.vue';
import StatsManager from './admin/StatsManager.vue';
import CustomerHistory from './admin/CustomerHistory.vue';

export default {
  name: 'AdminDashboard',
  components: {
    CarManager,
    CustomerManager,
    EmployeeManager,
    BookingManager,
    PickupManager,
    ReturnManager,
    StatsManager,
    CustomerHistory
  },
  data() {
    return {
      currentView: 'cars',
      userNev: localStorage.getItem('nev') || 'Admin'
    }
  },
  computed: {
    userMonogram() {
      return this.userNev.charAt(0).toUpperCase();
    },
    pageTitle() {
      switch(this.currentView) {
        case 'cars': return 'Autók Nyilvántartása';
        case 'customers': return 'Ügyfelek Adatbázisa';
        case 'employees': return 'Dolgozók Kezelése';
        case 'bookings': return 'Foglalások Áttekintése';
        case 'pickup': return 'Elvitel rögzítése';
        case 'return': return 'Visszahozatal rögzítése';
        case 'stats': return 'Statisztikák';
        case 'customerHistory': return 'Ügyfél Előzmények';
        default: return 'Dashboard';
      }
    }
  },
  mounted() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.$router.push('/');
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

<style scoped src="./AdminDashboard.css"></style>
