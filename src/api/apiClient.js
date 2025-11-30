

import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE || 'https://employee-manager-backned-1.onrender.com/api';

const api = axios.create({
  baseURL,
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

api.interceptors.response.use(
  res => res,
  err => {
    
    console.error('AXIOS ERROR', {
      message: err.message,
      url: err.config?.url,
      status: err.response?.status,
      data: err.response?.data
    });
    return Promise.reject(err);
  }
);

export default api;

