import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    // Use same protocol as frontend to avoid mixed content issues
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const baseURL = import.meta.env.VITE_API_BASE_URL || `${protocol}//${hostname}:3000`;
    
    this.client = axios.create({
      baseURL: baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.clearToken();
          // Redirect to login or emit auth error event
        }
        return Promise.reject(error);
      }
    );

    // Load token from localStorage on initialization
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Generic request method
  async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.request(config);
      return response.data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(email: string, password: string) {
    return this.request({
      method: 'POST',
      url: '/api/v1/auth/login',
      data: { email, password }
    });
  }

  async register(email: string, password: string, role?: string) {
    return this.request({
      method: 'POST',
      url: '/api/v1/auth/register',
      data: { email, password, role }
    });
  }

  async verifyToken() {
    return this.request({
      method: 'GET',
      url: '/api/v1/auth/verify'
    });
  }

  // Network device methods
  async getDevices(filters?: { active?: boolean; type?: string; search?: string }) {
    const params = new URLSearchParams();
    if (filters?.active !== undefined) params.append('active', String(filters.active));
    if (filters?.type) params.append('type', filters.type);
    if (filters?.search) params.append('search', filters.search);

    return this.request({
      method: 'GET',
      url: `/api/v1/network/devices?${params.toString()}`
    });
  }

  async getDevice(macAddress: string) {
    return this.request({
      method: 'GET',
      url: `/api/v1/network/devices/${macAddress}`
    });
  }

  async createDevice(deviceData: any) {
    return this.request({
      method: 'POST',
      url: '/api/v1/network/devices',
      data: deviceData
    });
  }

  async updateDevice(macAddress: string, updates: any) {
    return this.request({
      method: 'PUT',
      url: `/api/v1/network/devices/${macAddress}`,
      data: updates
    });
  }

  async deleteDevice(macAddress: string) {
    return this.request({
      method: 'DELETE',
      url: `/api/v1/network/devices/${macAddress}`
    });
  }

  async wakeDevice(macAddress: string) {
    return this.request({
      method: 'POST',
      url: `/api/v1/network/devices/${macAddress}/wake`
    });
  }

  // Traffic management methods
  async getTrafficRules() {
    return this.request({
      method: 'GET',
      url: '/api/v1/network/traffic/rules'
    });
  }

  async createTrafficRule(ruleData: any) {
    return this.request({
      method: 'POST',
      url: '/api/v1/network/traffic/rules',
      data: ruleData
    });
  }

  // VPN methods
  async getVpnServers() {
    return this.request({
      method: 'GET',
      url: '/api/v1/vpn/servers'
    });
  }

  async getVpnClients() {
    return this.request({
      method: 'GET',
      url: '/api/v1/vpn/clients'
    });
  }

  async createVpnClient(clientData: any) {
    return this.request({
      method: 'POST',
      url: '/api/v1/vpn/clients',
      data: clientData
    });
  }

  // Health check
  async getHealth() {
    return this.request({
      method: 'GET',
      url: '/health'
    });
  }

  async getServicesHealth() {
    return this.request({
      method: 'GET',
      url: '/health/services'
    });
  }
}

export const apiClient = new ApiClient();