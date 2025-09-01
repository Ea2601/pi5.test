import { Telegraf } from 'telegraf';
import { logger } from '../utils/logger';

export interface TelegramMessage {
  message_id: number;
  chat: {
    id: number;
    type: string;
  };
  date: number;
  text: string;
}

export class TelegramService {
  private bot: Telegraf | null = null;
  private isInitialized = false;

  constructor() {
    this.initializeBot();
  }

  private initializeBot() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!token) {
      logger.warn('Telegram bot token not configured');
      return;
    }

    try {
      this.bot = new Telegraf(token);
      this.isInitialized = true;
      logger.info('Telegram bot initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Telegram bot:', error);
    }
  }

  async sendMessage(message: string, chatId?: string): Promise<TelegramMessage> {
    if (!this.isInitialized || !this.bot) {
      throw new Error('Telegram bot not initialized');
    }

    try {
      const targetChatId = chatId || process.env.TELEGRAM_CHAT_ID;
      
      if (!targetChatId) {
        throw new Error('No chat ID configured');
      }

      const result = await this.bot.telegram.sendMessage(targetChatId, message, {
        parse_mode: 'Markdown'
      });

      logger.info(`Telegram message sent to chat ${targetChatId}`);
      return result;
    } catch (error) {
      logger.error('Error sending Telegram message:', error);
      throw new Error('Failed to send Telegram message');
    }
  }

  async sendNetworkAlert(alertType: string, alertData: any): Promise<TelegramMessage | null> {
    try {
      const emoji = this.getAlertEmoji(alertType);
      const message = this.formatNetworkAlert(emoji, alertType, alertData);
      
      return await this.sendMessage(message);
    } catch (error) {
      logger.error('Error sending network alert:', error);
      return null;
    }
  }

  async sendSystemAlert(alertType: string, alertData: any): Promise<TelegramMessage | null> {
    try {
      const emoji = this.getAlertEmoji(alertType);
      const message = this.formatSystemAlert(emoji, alertType, alertData);
      
      return await this.sendMessage(message);
    } catch (error) {
      logger.error('Error sending system alert:', error);
      return null;
    }
  }

  async getBotInfo(): Promise<any> {
    if (!this.isInitialized || !this.bot) {
      throw new Error('Telegram bot not initialized');
    }

    try {
      const botInfo = await this.bot.telegram.getMe();
      return {
        username: botInfo.username,
        first_name: botInfo.first_name,
        is_bot: botInfo.is_bot,
        can_join_groups: botInfo.can_join_groups,
        can_read_all_group_messages: botInfo.can_read_all_group_messages
      };
    } catch (error) {
      logger.error('Error getting bot info:', error);
      throw new Error('Failed to get bot information');
    }
  }

  private getAlertEmoji(alertType: string): string {
    const emojiMap: Record<string, string> = {
      'device_connected': '🔌',
      'device_disconnected': '🔌',
      'high_latency': '⚠️',
      'bandwidth_exceeded': '📊',
      'security_threat': '🚨',
      'system_error': '❌',
      'system_warning': '⚠️',
      'backup_completed': '✅',
      'vpn_connected': '🔐',
      'vpn_disconnected': '🔓'
    };
    
    return emojiMap[alertType] || '📢';
  }

  private formatNetworkAlert(emoji: string, alertType: string, alertData: any): string {
    return `${emoji} *Pi5 Supernode Network Alert*

📡 *Event:* ${alertType}
⏰ *Time:* ${new Date().toLocaleString('tr-TR')}
🔧 *Source:* ${alertData.source || 'Network Monitor'}

📋 *Details:*
${JSON.stringify(alertData, null, 2)}

🖥️ *System:* Pi5 Supernode v2.1.4`;
  }

  private formatSystemAlert(emoji: string, alertType: string, alertData: any): string {
    return `${emoji} *Pi5 Supernode System Alert*

⚡ *Alert:* ${alertType}
⏰ *Time:* ${new Date().toLocaleString('tr-TR')}
💻 *Component:* ${alertData.component || 'System'}

📊 *Metrics:*
• CPU: ${alertData.cpu || 'N/A'}%
• Memory: ${alertData.memory || 'N/A'}%
• Disk: ${alertData.disk || 'N/A'}%

🔧 *Action Required:* ${alertData.action || 'Monitor situation'}`;
  }
}