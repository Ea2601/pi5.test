import axios from 'axios';
import { logger } from '../utils/logger';

export interface WebhookResponse {
  status: number;
  success: boolean;
  response?: any;
  error?: string;
  timestamp: string;
}

export class WebhookService {
  async sendWebhook(url: string, data: any, headers: Record<string, string> = {}): Promise<WebhookResponse> {
    try {
      const response = await axios.post(url, data, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Pi5-Supernode-Webhook/2.1.4',
          ...headers
        },
        timeout: 10000
      });

      logger.info(`Webhook sent successfully to ${url}`, {
        status: response.status,
        responseSize: JSON.stringify(response.data).length
      });

      return {
        status: response.status,
        success: true,
        response: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error(`Webhook failed for ${url}:`, error);
      
      return {
        status: error.response?.status || 0,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async sendNetworkEvent(eventType: string, eventData: any): Promise<WebhookResponse | null> {
    const webhookUrl = process.env.WEBHOOK_BASE_URL;
    
    if (!webhookUrl) {
      logger.warn('No webhook URL configured');
      return null;
    }

    const payload = {
      event: eventType,
      source: 'pi5-supernode',
      timestamp: new Date().toISOString(),
      data: eventData
    };

    return await this.sendWebhook(`${webhookUrl}/network-events`, payload);
  }

  async sendSecurityAlert(alertType: string, alertData: any): Promise<WebhookResponse | null> {
    const webhookUrl = process.env.WEBHOOK_BASE_URL;
    
    if (!webhookUrl) {
      logger.warn('No webhook URL configured');
      return null;
    }

    const payload = {
      event: 'security_alert',
      alert_type: alertType,
      source: 'pi5-supernode',
      timestamp: new Date().toISOString(),
      severity: alertData.severity || 'medium',
      data: alertData
    };

    return await this.sendWebhook(`${webhookUrl}/security-alerts`, payload);
  }
}