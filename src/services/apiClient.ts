@@ .. @@
-import axios from 'axios';
-
-class ApiClient {
-  private client;
-
-  constructor() {
-    this.client = axios.create({
-      baseURL: process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3000/api',
-      timeout: 10000,
-      headers: {
-        'Content-Type': 'application/json'
-      }
-    });
-  }
-
-  async request(config: any) {
-    try {
-      const response = await this.client.request(config);
-      return response;
-    } catch (error) {
-      throw error;
-    }
-  }
-}
-
-export const apiClient = new ApiClient();
+// Re-export unified API client for backward compatibility
+export { unifiedApiClient as apiClient } from './unifiedApiClient';