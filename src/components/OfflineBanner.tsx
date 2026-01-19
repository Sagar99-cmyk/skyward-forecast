import { WifiOff, Clock } from 'lucide-react';

interface OfflineBannerProps {
  lastUpdated: number;
}

const OfflineBanner = ({ lastUpdated }: OfflineBannerProps) => {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="glass-card p-3 bg-accent/20 border-accent/40 flex items-center justify-between gap-3 animate-fade-in">
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4 text-accent" />
        <span className="text-sm text-foreground">
          You're viewing cached data
        </span>
      </div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Clock className="w-3 h-3" />
        <span>Updated {formatTime(lastUpdated)}</span>
      </div>
    </div>
  );
};

export default OfflineBanner;
