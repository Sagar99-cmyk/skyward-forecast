import { ForecastDay } from '@/types/weather';
import ForecastCard from './ForecastCard';
import { Calendar } from 'lucide-react';

interface ForecastSectionProps {
  forecast: ForecastDay[];
  title?: string;
}

const ForecastSection = ({ forecast, title = "30-Day Forecast" }: ForecastSectionProps) => {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <span className="text-sm text-muted-foreground">
          ({forecast.length} days)
        </span>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
        {forecast.map((day, index) => (
          <ForecastCard key={day.date.toISOString()} forecast={day} index={index} />
        ))}
      </div>
    </div>
  );
};

export default ForecastSection;
