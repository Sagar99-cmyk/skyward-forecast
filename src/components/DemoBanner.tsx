import { Info } from 'lucide-react';

const DemoBanner = () => {
  return (
    <div className="glass-card p-4 mb-6 border-primary/30 animate-fade-in">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-foreground font-medium">
            Demo Mode Active
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            This app is running with demo data. To get real weather data, add your OpenWeatherMap API key in the weatherService.ts file.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DemoBanner;
