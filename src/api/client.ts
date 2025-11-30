import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors globally if needed
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default client;
