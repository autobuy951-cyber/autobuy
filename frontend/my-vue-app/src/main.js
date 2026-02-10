import { createApp } from 'vue'
import App from './App.vue'
import router from './router.js'
import './styles/variables.css'
import './styles/common.css'

// Global fetch wrapper to handle API URLs
const originalFetch = window.fetch;
window.fetch = function(...args) {
  let url = args[0];
  
  // Convert hardcoded localhost:3000 URLs to relative /api URLs
  if (typeof url === 'string') {
    url = url.replace('http://localhost:3000', '');
  }
  
  args[0] = url;
  return originalFetch.apply(this, args);
};

const app = createApp(App)
app.use(router)
app.mount('#app')
