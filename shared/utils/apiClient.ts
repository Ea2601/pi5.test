// Unified API Client - Single Implementation for All Services
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { config } from '../config/environment';
import { UnifiedLogger } from './logger';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  requestId?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
  timestamp: string;
  requestId?: string;
}

export class UnifiedApiClient {
  private client: AxiosInstance;
  private serviceName: string;
  private logger = UnifiedLogger.getInstance('api-client');

  constructor(serviceName: string, baseURL?: string) {
    this.serviceName = serviceName;
    
    this.client = axios.create({
      baseURL: baseURL || this.getDefaultBaseURL(),
      timeout: config.API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Service': serviceName,
        'X-Client-Version': config.APP_VERSION
      }
    });

    this.setupInterceptors();
  }

  private getDefaultBaseURL(): string {
    const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    return `${protocol}//${hostname}:${config.API_GATEWAY_PORT}`;
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const startTime = Date.now();
        config.metadata = { startTime };

        // Add authentication token if available
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request ID for tracing
        const requestId = this.generateRequestId();
        config.headers['X-Request-ID'] = requestId;

        UnifiedLogger.logApiRequest(
          this.serviceName,
          config.method?.toUpperCase() || 'GET',
          config.url || '',
          { 
            requestId,
            headers: this.sanitizeHeaders(config.headers)
          }
        );

        return config;
      },
      (error) => {
        UnifiedLogger.logError(this.serviceName, error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        const duration = Date.now() - (response.config.metadata?.startTime || 0);
        const requestId = response.config.headers['X-Request-ID'];

        UnifiedLogger.logApiResponse(
          this.serviceName,
          response.config.method?.toUpperCase() || 'GET',
          response.config.url || '',
          response.status,
          duration,
          { requestId }
        );

        // Log slow requests
        if (duration > 2000) {
          this.logger.warn('Slow API request detected', {
            url: response.config.url,
            method: response.config.method,
            duration,
            requestId
          });
        }

        return response;
      },
      (error) => {
        const duration = error.config?.metadata?.startTime 
          ? Date.now() - error.config.metadata.startTime 
          : 0;
        const requestId = error.config?.headers?.['X-Request-ID'];

        // Handle specific error cases
        if (error.response?.status === 401) {
          this.handleAuthError();
        } else if (error.response?.status === 429) {
          this.handleRateLimitError();
        }

        UnifiedLogger.logError(this.serviceName, error, {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          duration,
          requestId
        });

        return Promise.reject(this.normalizeError(error));
      }
    );
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return process.env.SERVICE_AUTH_TOKEN || null;
  }

  private generateRequestId(): string {
    return `${this.serviceName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private sanitizeHeaders(headers: any): any {
    const sanitized = { ...headers };
    delete sanitized.Authorization; // Don't log auth tokens
    return sanitized;
  }

  private handleAuthError() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      // Emit auth error event for frontend
      window.dispatchEvent(new CustomEvent('auth:error'));
    }
  }

  private handleRateLimitError() {
    this.logger.warn('Rate limit exceeded', {
      service: this.serviceName,
      action: 'backoff_required'
    });
  }

  private normalizeError(error: any): ApiErrorResponse {
    const timestamp = new Date().toISOString();
    const requestId = error.config?.headers?.['X-Request-ID'];

    if (error.response) {
      // Server responded with error status
      return {
        success: false,
        error: error.response.data?.error || error.response.statusText || 'Server error',
        code: error.response.data?.code || String(error.response.status),
        details: error.response.data?.details,
        timestamp,
        requestId
      };
    } else if (error.request) {
      // Network error
      return {
        success: false,
        error: 'Network error - server unreachable',
        code: 'NETWORK_ERROR',
        timestamp,
        requestId
      };
    } else {
      // Request setup error
      return {
        success: false,
        error: error.message || 'Request configuration error',
        code: 'CONFIG_ERROR',
        timestamp,
        requestId
      };
    }
  }

  // Generic request method
  async request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.request(config);
      
      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString(),
        requestId: response.config.headers['X-Request-ID']
      };
    } catch (error) {
      throw error; // Let interceptor handle error normalization
    }
  }

  // Convenience methods
  async get<T>(url: string, params?: any): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'GET', url, params });
  }

  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'POST', url, data });
  }

  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'PUT', url, data });
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'DELETE', url });
  }

  async patch<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'PATCH', url, data });
  }

  // Batch operations
  async batch<T>(requests: AxiosRequestConfig[]): Promise<ApiResponse<T[]>> {
    const startTime = Date.now();
    
    try {
      const responses = await Promise.allSettled(
        requests.map(req => this.client.request(req))
      );

      const results: T[] = [];
      const errors: string[] = [];

      responses.forEach((response, index) => {
        if (response.status === 'fulfilled') {
          results.push(response.value.data);
        } else {
          errors.push(`Request ${index}: ${response.reason.message}`);
        }
      });

      const duration = Date.now() - startTime;
      this.logger.info('Batch operation completed', {
        totalRequests: requests.length,
        successful: results.length,
        failed: errors.length,
        duration
      });

      return {
        success: errors.length === 0,
        data: results,
        error: errors.length > 0 ? errors.join('; ') : undefined,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw error;
    }
  }

  // Health check method
  async healthCheck(): Promise<{ healthy: boolean; latency: number; error?: string }> {
    const startTime = Date.now();
    
    try {
      await this.get('/health');
      return {
        healthy: true,
        latency: Date.now() - startTime
      };
    } catch (error) {
      return {
        healthy: false,
        latency: Date.now() - startTime,
        error: (error as any).error || 'Health check failed'
      };
    }
  }

  // File upload with progress
  async uploadFile(
    file: File | Blob,
    path: string,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<{ path: string; url: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.request({
      method: 'POST',
      url: `/upload/${path}`,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      }
    });
  }
}

// Service-specific client instances
export const frontendApiClient = new UnifiedApiClient('frontend');
export const gatewayApiClient = new UnifiedApiClient('api-gateway');
export const networkApiClient = new UnifiedApiClient('network-service');
export const vpnApiClient = new UnifiedApiClient('vpn-service');
export const automationApiClient = new UnifiedApiClient('automation-service');