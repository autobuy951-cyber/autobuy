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
        <button
          @click="currentView = 'takenCars'"
          :class="{ active: currentView === 'takenCars' }"
          class="nav-item"
        >
          🚙 Elvitt Autók
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
          <TakenCarsManager v-else-if="currentView === 'takenCars'" />
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
import TakenCarsManager from './admin/TakenCarsManager.vue';

export default {
  name: 'EmployeeDashboard',
  components: {
    CarManager,
    CustomerManager,
    BookingManager,
    TakenCarsManager
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
        case 'takenCars': return 'Elvitt Autók';
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

<style scoped src="./EmployeeDashboard.css"></style>
