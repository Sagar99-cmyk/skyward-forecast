import { ForecastDay, TemperatureUnit } from '@/types/weather';
import WeatherIcon from './WeatherIcon';
import { convertTemperature } from '@/services/weatherService';

interface ForecastCardProps {
  forecast: ForecastDay;
  index: number;
  unit?: TemperatureUnit;
}

const ForecastCard = ({ forecast, index, unit = 'celsius' }: ForecastCardProps) => {
  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const unitSymbol = unit === 'celsius' ? '°' : '°F';

  return (
    <div 
      className="glass-card p-4 text-center hover:scale-105 transition-transform duration-300 cursor-default animate-slide-up group"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <p className="text-xs text-muted-foreground/70 mb-0.5">
        {getDayName(forecast.date)}
      </p>
      <p className="text-sm font-medium text-muted-foreground mb-3">
        {formatDate(forecast.date)}
      </p>
      
      <div className="flex justify-center mb-3 group-hover:scale-110 transition-transform">
        <WeatherIcon condition={forecast.condition} size={36} />
      </div>
      
      <div className="flex justify-center gap-2 text-sm">
        <span className="font-bold text-foreground">
          {convertTemperature(Math.round(forecast.tempMax), unit)}{unitSymbol}
        </span>
        <span className="text-muted-foreground">
          {convertTemperature(Math.round(forecast.tempMin), unit)}{unitSymbol}
        </span>
      </div>
      
      <p className="text-xs text-muted-foreground mt-2 capitalize truncate">
        {forecast.description}
      </p>
    </div>
  );
};

export default ForecastCard;
