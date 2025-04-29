import axios from 'axios';

// Use Supabase URL from environment variables
const API_BASE_URL = import.meta.env.VITE_SUPABASE_URL;
const BACKEND_URL = 'https://ad-vivum-backend-production.up.railway.app';

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

export const gettopicid = async (topic: string): Promise<{ topic_id: string; error?: string }> => {
  if (!topic) {
    return { topic_id: '', error: 'No topic provided' };
  }

  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!anonKey) {
    return { topic_id: '', error: 'Authentication key not found' };
  }

  try {
    // First check if the backend is accessible
    const healthCheck = await axios.get(`${BACKEND_URL}/health`, {
      timeout: 5000
    }).catch(() => null);

    if (!healthCheck) {
      return { topic_id: '', error: 'Backend service is currently unavailable' };
    }

    const response = await axios.post(
      `${BACKEND_URL}/fetch-topic-data`,
      {
        topic: topic,
        max_results: 5
      },
      {
        timeout: 10000, // Increased timeout for topic processing
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'apikey': anonKey,
        }
      }
    );
    
    if (!response.data) {
      return { topic_id: '', error: 'No response data received from server' };
    }

    if (!response.data.topic_id) {
      return { topic_id: '', error: 'No topic ID returned from server' };
    }

    return { topic_id: response.data.topic_id };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Handle specific error cases
      if (error.code === 'ECONNABORTED') {
        return { topic_id: '', error: 'Request timed out - please try again' };
      }
      if (error.response) {
        switch (error.response.status) {
          case 401:
            return { topic_id: '', error: 'Authentication failed' };
          case 404:
            return { topic_id: '', error: 'Topic processing endpoint not found' };
          case 429:
            return { topic_id: '', error: 'Too many requests - please try again later' };
          case 500:
            return { topic_id: '', error: 'Backend server error - please try again later' };
          default:
            return { 
              topic_id: '', 
              error: error.response.data?.message || 'Failed to process topic' 
            };
        }
      }
      return { 
        topic_id: '', 
        error: 'Network error - please check your connection' 
      };
    }
    return { topic_id: '', error: 'An unexpected error occurred' };
  }
};

export const getarticles = async (topic_id: string) => {
  if (!topic_id) {
    return { articles: [], error: 'No topic ID provided' };
  }

  try {
    const response = await axios.get(
      `${BACKEND_URL}/topic/${topic_id}/articles`,
      {
        timeout: 5000,
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        }
      }
    );

    if (!response.data) {
      return { articles: [], error: 'No data returned from server' };
    }

    return { articles: response.data.articles || [], error: null };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Article Fetching failed', {
        message: error.message,
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data
      });
      return { 
        articles: [], 
        error: error.response?.data?.message || 'Failed to fetch articles' 
      };
    }
    return { articles: [], error: 'Unexpected error occurred' };
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