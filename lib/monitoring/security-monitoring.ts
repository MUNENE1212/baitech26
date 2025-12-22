interface SecurityEvent {
  id: string;
  timestamp: Date;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ip: string;
  userAgent?: string;
  details: any;
  url?: string;
  resolved: boolean;
}

interface AlertConfig {
  enabled: boolean;
  email?: string;
  webhook?: string;
  slackWebhook?: string;
  thresholds: {
    failedLoginsPerMinute: number;
    suspiciousRequestsPerMinute: number;
    largeFileUploadsPerHour: number;
    rateLimitHitsPerMinute: number;
  };
}

class SecurityMonitoringService {
  private events: SecurityEvent[] = [];
  private alertConfig: AlertConfig;
  private metrics: Map<string, number> = new Map();

  constructor() {
    this.alertConfig = this.loadAlertConfig();
    this.startMonitoring();
  }

  private loadAlertConfig(): AlertConfig {
    return {
      enabled: process.env.SECURITY_MONITORING_ENABLED === 'true',
      email: process.env.SECURITY_ALERT_EMAIL,
      webhook: process.env.SECURITY_ALERT_WEBHOOK,
      slackWebhook: process.env.SLACK_WEBHOOK_URL,
      thresholds: {
        failedLoginsPerMinute: parseInt(process.env.FAILED_LOGIN_THRESHOLD || '10'),
        suspiciousRequestsPerMinute: parseInt(process.env.SUSPICIOUS_REQUEST_THRESHOLD || '20'),
        largeFileUploadsPerHour: parseInt(process.env.LARGE_UPLOAD_THRESHOLD || '5'),
        rateLimitHitsPerMinute: parseInt(process.env.RATE_LIMIT_THRESHOLD || '15'),
      }
    };
  }

  public logSecurityEvent(
    type: string,
    severity: SecurityEvent['severity'],
    details: any,
    ip: string,
    userAgent?: string,
    url?: string
  ): void {
    const event: SecurityEvent = {
      id: this.generateEventId(),
      timestamp: new Date(),
      type,
      severity,
      ip,
      userAgent,
      details,
      url,
      resolved: false
    };

    this.events.push(event);

    // Keep only last 1000 events in memory
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }

    // Update metrics
    this.updateMetrics(type, severity);

    // Log to console
    console.warn(`[SECURITY ${severity.toUpperCase()}] ${type}`, {
      id: event.id,
      ip,
      timestamp: event.timestamp,
      details
    });

    // Check for alert conditions
    this.checkAlertConditions(event);

    // Store in database if available
    this.persistEvent(event);
  }

  private generateEventId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private updateMetrics(type: string, severity: string): void {
    const key = `${type}:${severity}`;
    this.metrics.set(key, (this.metrics.get(key) || 0) + 1);
  }

  private async checkAlertConditions(event: SecurityEvent): Promise<void> {
    if (!this.alertConfig.enabled) return;

    // Check critical events immediately
    if (event.severity === 'critical') {
      await this.sendAlert(event, 'Critical security event detected');
      return;
    }

    // Check for patterns that indicate attacks
    const recentEvents = this.getRecentEvents(5 * 60 * 1000); // Last 5 minutes
    const ipEvents = recentEvents.filter(e => e.ip === event.ip);

    // Multiple events from same IP
    if (ipEvents.length > 10) {
      await this.sendAlert(event, 'Suspicious activity from IP address');
    }

    // Failed login attempts
    const failedLogins = recentEvents.filter(e =>
      e.type === 'LOGIN_FAILED' && e.ip === event.ip
    );
    if (failedLogins.length >= this.alertConfig.thresholds.failedLoginsPerMinute) {
      await this.sendAlert(event, 'High number of failed login attempts');
    }

    // Rate limit hits
    const rateLimitHits = recentEvents.filter(e => e.type === 'RATE_LIMIT_EXCEEDED');
    if (rateLimitHits.length >= this.alertConfig.thresholds.rateLimitHitsPerMinute) {
      await this.sendAlert(event, 'High rate limit activity detected');
    }

    // Large file uploads
    const largeUploads = this.getRecentEvents(60 * 60 * 1000).filter(e =>
      e.type === 'LARGE_FILE_UPLOAD'
    );
    if (largeUploads.length >= this.alertConfig.thresholds.largeFileUploadsPerHour) {
      await this.sendAlert(event, 'Multiple large file uploads detected');
    }
  }

  private getRecentEvents(timeWindowMs: number): SecurityEvent[] {
    const cutoff = new Date(Date.now() - timeWindowMs);
    return this.events.filter(e => e.timestamp >= cutoff);
  }

  private async sendAlert(event: SecurityEvent, message: string): Promise<void> {
    const alertData = {
      timestamp: new Date().toISOString(),
      eventId: event.id,
      severity: event.severity,
      message,
      ip: event.ip,
      type: event.type,
      details: event.details,
      url: event.url
    };

    console.error('[SECURITY ALERT]', JSON.stringify(alertData, null, 2));

    // Send email alert
    if (this.alertConfig.email) {
      await this.sendEmailAlert(alertData);
    }

    // Send webhook alert
    if (this.alertConfig.webhook) {
      await this.sendWebhookAlert(alertData);
    }

    // Send Slack alert
    if (this.alertConfig.slackWebhook) {
      await this.sendSlackAlert(alertData);
    }
  }

  private async sendEmailAlert(alertData: any): Promise<void> {
    // Implement email notification logic
    // You can use services like SendGrid, AWS SES, or Nodemailer
    try {
      console.log('Email alert would be sent to:', this.alertConfig.email);
      // TODO: Implement actual email sending
    } catch (error) {
      console.error('Failed to send email alert:', error);
    }
  }

  private async sendWebhookAlert(alertData: any): Promise<void> {
    try {
      const response = await fetch(this.alertConfig.webhook!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(alertData)
      });

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to send webhook alert:', error);
    }
  }

  private async sendSlackAlert(alertData: any): Promise<void> {
    try {
      const slackMessage = {
        text: `🚨 Security Alert: ${alertData.message}`,
        attachments: [{
          color: this.getSeverityColor(alertData.severity),
          fields: [
            {
              title: 'Severity',
              value: alertData.severity.toUpperCase(),
              short: true
            },
            {
              title: 'IP Address',
              value: alertData.ip,
              short: true
            },
            {
              title: 'Event Type',
              value: alertData.type,
              short: true
            },
            {
              title: 'Timestamp',
              value: alertData.timestamp,
              short: true
            }
          ]
        }]
      };

      await fetch(this.alertConfig.slackWebhook!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(slackMessage)
      });
    } catch (error) {
      console.error('Failed to send Slack alert:', error);
    }
  }

  private getSeverityColor(severity: string): string {
    const colors = {
      low: '#36a64f',      // green
      medium: '#ff9500',   // orange
      high: '#ff0000',     // red
      critical: '#8b0000'  // dark red
    };
    return colors[severity as keyof typeof colors] || '#808080';
  }

  private async persistEvent(event: SecurityEvent): Promise<void> {
    try {
      // Store in MongoDB if available
      const { db } = await import('../db/mongodb-secure');
      if (db.isConnected()) {
        await db.getCollection('security_events').insertOne({
          ...event,
          timestamp: new Date(event.timestamp)
        });
      }
    } catch (error) {
      console.error('Failed to persist security event:', error);
    }
  }

  private startMonitoring(): void {
    // Clean up old metrics every minute
    setInterval(() => {
      this.metrics.clear();
    }, 60 * 1000);

    // Check for ongoing attacks every 30 seconds
    setInterval(() => {
      this.checkForOngoingAttacks();
    }, 30 * 1000);
  }

  private async checkForOngoingAttacks(): Promise<void> {
    const recentEvents = this.getRecentEvents(60 * 1000); // Last minute

    // Check for brute force attacks
    const loginFailuresByIP = new Map<string, number>();
    recentEvents
      .filter(e => e.type === 'LOGIN_FAILED')
      .forEach(e => {
        loginFailuresByIP.set(e.ip, (loginFailuresByIP.get(e.ip) || 0) + 1);
      });

    for (const [ip, count] of loginFailuresByIP) {
      if (count >= this.alertConfig.thresholds.failedLoginsPerMinute) {
        await this.sendAlert(
          this.events[this.events.length - 1],
          `Brute force attack detected from IP: ${ip} (${count} attempts)`
        );
      }
    }

    // Check for DDoS patterns
    const requestsByIP = new Map<string, number>();
    recentEvents
      .filter(e => e.type === 'API_ACCESS')
      .forEach(e => {
        requestsByIP.set(e.ip, (requestsByIP.get(e.ip) || 0) + 1);
      });

    for (const [ip, count] of requestsByIP) {
      if (count >= this.alertConfig.thresholds.suspiciousRequestsPerMinute) {
        await this.sendAlert(
          this.events[this.events.length - 1],
          `Suspicious high request rate from IP: ${ip} (${count} requests/minute)`
        );
      }
    }
  }

  // Public methods for monitoring dashboard
  public getSecurityStats(): any {
    const last24Hours = this.getRecentEvents(24 * 60 * 60 * 1000);
    const lastHour = this.getRecentEvents(60 * 60 * 1000);

    return {
      totalEvents24h: last24Hours.length,
      criticalEvents24h: last24Hours.filter(e => e.severity === 'critical').length,
      highEvents24h: last24Hours.filter(e => e.severity === 'high').length,
      uniqueIPs24h: new Set(last24Hours.map(e => e.ip)).size,
      totalEvents1h: lastHour.length,
      topEventTypes: this.getTopEventTypes(last24Hours),
      topIPs: this.getTopIPs(last24Hours)
    };
  }

  private getTopEventTypes(events: SecurityEvent[]): Array<{type: string, count: number}> {
    const counts = new Map<string, number>();
    events.forEach(e => {
      counts.set(e.type, (counts.get(e.type) || 0) + 1);
    });

    return Array.from(counts.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private getTopIPs(events: SecurityEvent[]): Array<{ip: string, count: number}> {
    const counts = new Map<string, number>();
    events.forEach(e => {
      counts.set(e.ip, (counts.get(e.ip) || 0) + 1);
    });

    return Array.from(counts.entries())
      .map(([ip, count]) => ({ ip, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }
}

// Singleton instance
const securityMonitor = new SecurityMonitoringService();

export default securityMonitor;