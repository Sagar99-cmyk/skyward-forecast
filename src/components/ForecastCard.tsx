import { ForecastDay } from '@/types/weather';
import WeatherIcon from './WeatherIcon';

interface ForecastCardProps {
  forecast: ForecastDay;
  index: number;
}

const ForecastCard = ({ forecast, index }: ForecastCardProps) => {
  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div 
      className="glass-card p-4 text-center hover:scale-105 transition-transform duration-300 cursor-default animate-slide-up"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <p className="text-sm font-medium text-muted-foreground mb-3">
        {formatDate(forecast.date)}
      </p>
      
      <div className="flex justify-center mb-3">
        <WeatherIcon condition={forecast.condition} size={36} />
      </div>
      
      <div className="flex justify-center gap-2 text-sm">
        <span className="font-semibold text-foreground">
          {Math.round(forecast.tempMax)}°
        </span>
        <span className="text-muted-foreground">
          {Math.round(forecast.tempMin)}°
        </span>
      </div>
      
      <p className="text-xs text-muted-foreground mt-2 capitalize truncate">
        {forecast.description}
      </p>
    </div>
  );
};

export default ForecastCard;
