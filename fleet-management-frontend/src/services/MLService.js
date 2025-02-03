import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class MLService {
  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_URL
    });

    // Add request interceptor to include admin token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const adminToken = localStorage.getItem('adminToken');
        if (adminToken) {
          config.headers.Authorization = `Bearer ${adminToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  async collectRouteData(routeId) {
    try {
      const response = await this.axiosInstance.post(`/ml/collect/${routeId}`);
      return response.data;
    } catch (error) {
      console.error('Error collecting ML data:', error);
      throw error;
    }
  }

  async getMLDataset() {
    try {
      const response = await this.axiosInstance.get('/ml/dataset');
      return response.data;
    } catch (error) {
      console.error('Error fetching ML dataset:', error);
      throw error;
    }
  }

  async trainModel() {
    try {
      const response = await this.axiosInstance.post('/ml/train');
      return response.data;
    } catch (error) {
      console.error('Error training model:', error);
      throw error;
    }
  }

  async predictRoute(routeFeatures) {
    try {
      const response = await this.axiosInstance.post('/ml/predict', routeFeatures);
      return response.data;
    } catch (error) {
      console.error('Error getting prediction:', error);
      throw error;
    }
  }

  async checkDataAvailability() {
    try {
      const response = await this.axiosInstance.get('/ml/data-availability');
      return response.data;
    } catch (error) {
      console.error('Error checking data availability:', error);
      throw error;
    }
  }

  async getTrainingData() {
    try {
      const response = await this.axiosInstance.get('/ml/training-data');
      return response.data;
    } catch (error) {
      console.error('Error fetching training data:', error);
      throw error;
    }
  }
}

export default new MLService(); 