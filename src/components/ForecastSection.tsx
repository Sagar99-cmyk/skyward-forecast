import { ForecastDay, TemperatureUnit } from '@/types/weather';
import ForecastCard from './ForecastCard';
import { Calendar } from 'lucide-react';

interface ForecastSectionProps {
  forecast: ForecastDay[];
  title?: string;
  unit?: TemperatureUnit;
}

const ForecastSection = ({ forecast, title = "5-Day Forecast", unit = 'celsius' }: ForecastSectionProps) => {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <span className="text-sm text-muted-foreground">
          ({forecast.length} days)
        </span>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {forecast.map((day, index) => (
          <ForecastCard 
            key={day.date.toISOString()} 
            forecast={day} 
            index={index}
            unit={unit}
          />
        ))}
      </div>
    </div>
  );
};

export default ForecastSection;
