// Unified API Client - Browser Compatible
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export class UnifiedApiClient {
  private serviceName: string;
  private baseURL: string;

  constructor(serviceName: string, baseURL?: string) {
    this.serviceName = serviceName;
    this.baseURL = baseURL || '/';
  }

  private async request<T>(config: RequestInit & { url: string }): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${config.url}`, {
        method: config.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...config.headers
        },
        body: config.body ? JSON.stringify(config.body) : undefined
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error [${this.serviceName}]:`, error);
      throw error;
    }
  }

  async get<T>(url: string): Promise<ApiResponse<T>> {
    return this.request<T>({ url, method: 'GET' });
  }

  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>({ url, method: 'POST', body: data });
  }

  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>({ url, method: 'PUT', body: data });
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    return this.request<T>({ url, method: 'DELETE' });
  }
}