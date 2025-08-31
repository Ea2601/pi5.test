interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: number;
  sessionId: string;
  userId?: string;
}

class Analytics {
  private sessionId: string;
  private isEnabled: boolean;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.isEnabled = !import.meta.env.DEV; // Disable in development
  }

  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  track(event: string, properties: Record<string, any> = {}) {
    if (!this.isEnabled) {
      console.log(`[Analytics] ${event}`, properties);
      return;
    }

    const analyticsEvent: AnalyticsEvent = {
      event,
      properties,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.getUserId()
    };

    // In production, send to analytics service
    this.sendToAnalytics(analyticsEvent);
  }

  identify(userId: string, traits: Record<string, any> = {}) {
    if (!this.isEnabled) return;

    localStorage.setItem('user_id', userId);
    this.track('user_identified', { userId, ...traits });
  }

  page(name: string, properties: Record<string, any> = {}) {
    this.track('page_view', { page: name, ...properties });
  }

  private getUserId(): string | undefined {
    return localStorage.getItem('user_id') || undefined;
  }

  private sendToAnalytics(event: AnalyticsEvent) {
    // Implement analytics service integration
    // For example: send to Google Analytics, Mixpanel, etc.
    console.log('[Analytics] Event sent:', event);
  }
}

export const analytics = new Analytics();