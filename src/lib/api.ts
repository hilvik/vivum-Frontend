import axios from 'axios';

// Use Supabase URL from environment variables
const API_BASE_URL = import.meta.env.VITE_SUPABASE_URL;

if (!API_BASE_URL) {
  console.error('VITE_SUPABASE_URL is not defined in environment variables');
}

// Create a basic axios instance
const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 seconds
  withCredentials: false,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url);
    if (typeof config.retryCount === 'undefined') {
      config.retryCount = 0;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  async (error) => {
    const config = error.config;

    if (config && config.retryCount < 3 && !axios.isCancel(error)) {
      config.retryCount += 1;
      const backoffDelay = Math.pow(2, config.retryCount) * 1000;
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
      console.log(`Retrying request (attempt ${config.retryCount}/3)...`);
      return api(config);
    }

    if (axios.isAxiosError(error)) {
      console.error('API Error:', {
        message: error.message,
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data
      });
    } else {
      console.error('Unexpected error:', error);
    }

    return Promise.reject(error);
  }
);

// Health check using Supabase URL
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await api.get(`${API_BASE_URL}/rest/v1/`, {
      timeout: 5000,
      headers: {
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
      }
    });
    return response.status === 200;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API health check failed:', {
        message: error.message,
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data
      });
    } else {
      console.error('Unexpected error during health check:', error);
    }
    return false;
  }
};

// Submit a query using Supabase URL
export const submitQuery = async (query: string): Promise<string> => {
  try {
    const response = await api.post(`${API_BASE_URL}/rest/v1/rpc/query`, { 
      query 
    }, {
      headers: {
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
      }
    });
    if (response.status === 200 && response.data) {
      console.log('Query submitted successfully:', response.data);
      return response.data;
    } else {
      throw new Error('Invalid response from server');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Query submission failed:', {
        message: error.message,
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data
      });
    } else {
      console.error('Unexpected error during query submission:', error);
    }
    throw new Error('Failed to submit query');
  }
};