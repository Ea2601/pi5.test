/**
 * Inter-Module Communication Bus
 * Standardized communication protocol for module interactions
 */

import { EventEmitter } from 'eventemitter3';
import { UnifiedLogger } from '../../shared/utils/logger';

export interface MessageEnvelope {
  id: string;
  type: 'request' | 'response' | 'event' | 'broadcast';
  source: string;
  target?: string | string[];
  action: string;
  payload?: any;
  metadata?: Record<string, any>;
  timestamp: number;
  responseId?: string;
}

export interface SubscriptionFilter {
  source?: string | string[];
  target?: string | string[];
  action?: string | string[];
  type?: MessageEnvelope['type'] | MessageEnvelope['type'][];
}

class CommunicationBus extends EventEmitter {
  private static instance: CommunicationBus;
  private messageHistory: MessageEnvelope[] = [];
  private subscriptions: Map<string, SubscriptionFilter> = new Map();
  private logger = UnifiedLogger.getInstance('communication-bus');

  static getInstance(): CommunicationBus {
    if (!CommunicationBus.instance) {
      CommunicationBus.instance = new CommunicationBus();
    }
    return CommunicationBus.instance;
  }

  // Send message to specific module or broadcast
  async send(message: Omit<MessageEnvelope, 'id' | 'timestamp'>): Promise<any> {
    const envelope: MessageEnvelope = {
      ...message,
      id: this.generateMessageId(),
      timestamp: Date.now()
    };

    this.messageHistory.push(envelope);
    this.logger.debug(`Sending message: ${envelope.action}`, {
      from: envelope.source,
      to: envelope.target,
      type: envelope.type
    });

    // Store in history (keep last 1000 messages)
    if (this.messageHistory.length > 1000) {
      this.messageHistory.splice(0, this.messageHistory.length - 1000);
    }

    // Emit to subscribers
    this.emit('message', envelope);

    // For request type, wait for response
    if (envelope.type === 'request') {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error(`Request timeout: ${envelope.action}`));
        }, 5000);

        const responseHandler = (responseEnvelope: MessageEnvelope) => {
          if (responseEnvelope.responseId === envelope.id) {
            clearTimeout(timeout);
            this.off('message', responseHandler);
            
            if (responseEnvelope.payload?.error) {
              reject(new Error(responseEnvelope.payload.error));
            } else {
              resolve(responseEnvelope.payload);
            }
          }
        };

        this.on('message', responseHandler);
      });
    }
  }

  // Subscribe to messages matching filter
  subscribe(subscriberId: string, filter: SubscriptionFilter, handler: (message: MessageEnvelope) => void): () => void {
    this.subscriptions.set(subscriberId, filter);

    const messageHandler = (envelope: MessageEnvelope) => {
      if (this.matchesFilter(envelope, filter)) {
        handler(envelope);
      }
    };

    this.on('message', messageHandler);

    // Return unsubscribe function
    return () => {
      this.off('message', messageHandler);
      this.subscriptions.delete(subscriberId);
    };
  }

  // Get message history
  getMessageHistory(filter?: SubscriptionFilter): MessageEnvelope[] {
    if (!filter) return [...this.messageHistory];
    
    return this.messageHistory.filter(msg => this.matchesFilter(msg, filter));
  }

  // Clear message history
  clearHistory(): void {
    this.messageHistory = [];
  }

  private matchesFilter(message: MessageEnvelope, filter: SubscriptionFilter): boolean {
    if (filter.type && !this.arrayIncludes(filter.type, message.type)) return false;
    if (filter.source && !this.arrayIncludes(filter.source, message.source)) return false;
    if (filter.target && message.target && !this.arrayIncludes(filter.target, message.target)) return false;
    if (filter.action && !this.arrayIncludes(filter.action, message.action)) return false;
    
    return true;
  }

  private arrayIncludes(filterValue: string | string[], messageValue: string): boolean {
    if (Array.isArray(filterValue)) {
      return filterValue.includes(messageValue);
    }
    return filterValue === messageValue;
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
}

export const communicationBus = CommunicationBus.getInstance();