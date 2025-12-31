import { WeatherAlert } from '@/types/weather';
import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';

interface WeatherAlertsProps {
  alerts: WeatherAlert[];
}

const WeatherAlerts = ({ alerts }: WeatherAlertsProps) => {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  if (alerts.length === 0) return null;

  const visibleAlerts = alerts.filter(alert => !dismissed.has(alert.event + alert.start.getTime()));

  if (visibleAlerts.length === 0) return null;

  const dismissAlert = (alert: WeatherAlert) => {
    setDismissed(prev => new Set(prev).add(alert.event + alert.start.getTime()));
  };

  const getSeverityColor = (event: string) => {
    const lowerEvent = event.toLowerCase();
    if (lowerEvent.includes('warning') || lowerEvent.includes('severe')) {
      return 'border-destructive/50 bg-destructive/10';
    }
    if (lowerEvent.includes('watch') || lowerEvent.includes('advisory')) {
      return 'border-accent/50 bg-accent/10';
    }
    return 'border-primary/50 bg-primary/10';
  };

  return (
    <div className="space-y-3 animate-fade-in">
      {visibleAlerts.map((alert, index) => (
        <div 
          key={index} 
          className={`glass-card p-4 border-2 ${getSeverityColor(alert.event)}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-foreground">{alert.event}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {alert.start.toLocaleDateString()} - {alert.end.toLocaleDateString()}
                </p>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {alert.description}
                </p>
                {alert.sender && (
                  <p className="text-xs text-muted-foreground/70 mt-2">
                    Source: {alert.sender}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => dismissAlert(alert)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WeatherAlerts;
