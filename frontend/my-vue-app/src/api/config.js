// API Configuration
// Use environment variables in production, fallback to relative paths for development
// In development, Vite will proxy /api requests to http://localhost:3000

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export default {
  baseURL: API_BASE_URL,
  
  endpoints: {
    auth: {
      login: `${API_BASE_URL}/api/auth/login`,
      loginCustomer: `${API_BASE_URL}/api/auth/login/customer`,
      register: `${API_BASE_URL}/api/auth/register`,
      registerCustomer: `${API_BASE_URL}/api/auth/register/customer`,
      verify: `${API_BASE_URL}/api/auth/verify`
    },
    dashboard: `${API_BASE_URL}/api/dashboard`,
    customers: `${API_BASE_URL}/api/ugyfelek`,
    employees: `${API_BASE_URL}/api/dolgozok`,
    cars: `${API_BASE_URL}/api/autok`,
    bookings: `${API_BASE_URL}/api/foglalasok`,
    takenCars: `${API_BASE_URL}/api/autokibe`,
    stats: `${API_BASE_URL}/api/stats`
  }
};
