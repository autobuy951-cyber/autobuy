<template>
  <transition name="toast-fade">
    <div v-if="show" class="toast-container" :class="type">
      <div class="toast-content">
        <div class="toast-icon">
          <span v-if="type === 'success'">✓</span>
          <span v-else-if="type === 'error'">✕</span>
          <span v-else-if="type === 'info'">ℹ</span>
        </div>
        <div class="toast-message">{{ message }}</div>
        <button @click="close" class="toast-close">×</button>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'GlobalNotification',
  data() {
    return {
      show: false,
      message: '',
      type: 'info', // success, error, info
      timeout: null
    }
  },
  mounted() {
    window.addEventListener('toast', this.showToast);
  },
  beforeUnmount() {
    window.removeEventListener('toast', this.showToast);
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  },
  methods: {
    showToast(event) {
      this.message = event.detail.message;
      this.type = event.detail.type || 'info';
      this.show = true;

      if (this.timeout) {
        clearTimeout(this.timeout);
      }

      this.timeout = setTimeout(() => {
        this.show = false;
      }, 5000); // Auto hide after 5 seconds
    },
    close() {
      this.show = false;
      if (this.timeout) {
        clearTimeout(this.timeout);
      }
    }
  }
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  min-width: 300px;
  max-width: 500px;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-radius: 12px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  font-family: 'Inter', 'Poppins', system-ui, sans-serif;
  font-size: 14px;
  line-height: 1.4;
  color: #ffffff;
}

.toast-container.success .toast-content {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(22, 163, 74, 0.2));
  border-color: rgba(34, 197, 94, 0.3);
}

.toast-container.error .toast-content {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2));
  border-color: rgba(239, 68, 68, 0.3);
}

.toast-container.info .toast-content {
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.2), rgba(59, 130, 246, 0.2));
  border-color: rgba(79, 172, 254, 0.3);
}

.toast-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: bold;
  font-size: 12px;
}

.toast-container.success .toast-icon {
  background: rgba(34, 197, 94, 0.3);
}

.toast-container.error .toast-icon {
  background: rgba(239, 68, 68, 0.3);
}

.toast-container.info .toast-icon {
  background: rgba(79, 172, 254, 0.3);
}

.toast-message {
  flex: 1;
}

.toast-close {
  flex-shrink: 0;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.toast-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.3s ease;
}

.toast-fade-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-fade-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>