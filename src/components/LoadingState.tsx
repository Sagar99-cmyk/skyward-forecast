import { Cloud } from 'lucide-react';

const LoadingState = () => {
  return (
    <div className="glass-card p-12 text-center animate-fade-in">
      <div className="relative inline-block">
        <Cloud className="w-16 h-16 text-primary animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
      <p className="text-muted-foreground mt-4 text-lg">
        Fetching weather data...
      </p>
    </div>
  );
};

export default LoadingState;
