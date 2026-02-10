<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
#app {
  font-family: 'Inter', 'Poppins', 'Segoe UI', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #ffffff;
  min-height: 100vh;
  margin: 0;
  padding: 0;
  /* Modern gradient háttér */
  background: 
    radial-gradient(ellipse at top left, rgba(79, 172, 254, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at bottom right, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
    linear-gradient(180deg, #0a0a0a 0%, #0f0f0f 50%, #0a0a0a 100%);
  background-attachment: fixed;
}

/* Modern scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.25);
}

/* Animációk */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes glow {
  0%, 100% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.3); }
  50% { box-shadow: 0 0 40px rgba(251, 191, 36, 0.5); }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

.animate-slide-in {
  animation: slideIn 0.4s ease-out forwards;
}
</style>
