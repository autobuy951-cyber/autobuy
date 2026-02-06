# API Configuration Guide

## Overview

This frontend application uses a centralized API configuration system to manage all API endpoints. This ensures consistency and makes it easy to change the API URL for different environments.

## How It Works

### 1. **API Config Module** (`src/api/config.js`)
Defines all API endpoints in one place:
```javascript
import apiConfig from '../api/config.js';

// Use in components:
const endpoint = apiConfig.endpoints.auth.login;
```

### 2. **API Helper Functions** (`src/api/helpers.js`)
Provides convenient helper functions for API calls:
```javascript
import { apiPost, apiGet, apiPut } from '../api/helpers.js';

// Make API calls:
const response = await apiPost(apiConfig.endpoints.auth.login, { nev, jelszo });
```

### 3. **Vite Proxy** (Development)
In development, the Vite dev server proxies all `/api/*` requests to `http://localhost:3000`:
```javascript
// vite.config.js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true
    }
  }
}
```

### 4. **Global Fetch Wrapper** (Development)
All hardcoded `http://localhost:3000` URLs are automatically converted to relative `/api/` paths:
```javascript
// main.js
window.fetch = function(...args) {
  let url = args[0];
  if (typeof url === 'string') {
    url = url.replace('http://localhost:3000', '');
  }
  args[0] = url;
  return originalFetch.apply(this, args);
};
```

## Environment Configuration

### Development
- Create `.env.local` or `.env.development`
- Set `VITE_API_URL=http://localhost:3000` (or leave empty to use relative paths)

### Production
- Create `.env.production`
- Set `VITE_API_URL=https://your-api-domain.com`

## Updating Components

When adding new API calls, use the established pattern:

### Option 1: Use Config Module (Recommended)
```javascript
import apiConfig from '../api/config.js';

// In your component method:
const response = await fetch(apiConfig.endpoints.auth.login, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

### Option 2: Use Helper Functions (Most Convenient)
```javascript
import { apiPost } from '../api/helpers.js';
import apiConfig from '../api/config.js';

// In your component method:
const response = await apiPost(apiConfig.endpoints.auth.login, data);
```

### Option 3: Use Relative Paths (Still Works)
```javascript
// The global fetch wrapper will handle this:
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

## Troubleshooting

### "Network Error" When Logging In
1. Ensure the backend server is running on `localhost:3000`
2. Check that the Vite dev server has started properly
3. Verify the Vite proxy is configured correctly in `vite.config.js`
4. Check browser console (F12) for specific error messages

### CORS Errors
- The Vite proxy should handle CORS for development
- For production, configure CORS properly on the backend

### API Not Found (404)
- Verify the endpoint URL in `src/api/config.js`
- Check that the backend API route exists
- Ensure you're using the correct endpoint from `apiConfig`

## Backend API Endpoints

All available endpoints are defined in `src/api/config.js`:
- `auth.login` - Employee/Admin login
- `auth.loginCustomer` - Customer login
- `auth.register` - Employee/Admin registration
- `auth.registerCustomer` - Customer registration
- `dashboard` - Dashboard data
- `customers` - Customer management
- `employees` - Employee management
- `cars` - Car management
- `bookings` - Booking management
- `takenCars` - Taken cars tracking
- `stats` - Statistics

## Future Improvements

Consider these enhancements:
1. Add request/response interceptors for logging
2. Implement error handling middleware
3. Add automatic token refresh for JWT
4. Create a composable for API calls in Vue 3
5. Add request cancellation support
