import { useRef } from 'react';
import { HourlyForecast as HourlyForecastType, TemperatureUnit } from '@/types/weather';
import { Clock, Droplets, ChevronLeft, ChevronRight } from 'lucide-react';
import WeatherIcon from './WeatherIcon';
import { Button } from '@/components/ui/button';
import { convertTemperature } from '@/services/weatherService';

interface HourlyForecastProps {
  hourlyData: HourlyForecastType[];
  unit?: TemperatureUnit;
}

const HourlyForecast = ({ hourlyData, unit = 'celsius' }: HourlyForecastProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const isCurrentHour = (time: Date) => {
    const now = new Date();
    return time.getHours() === now.getHours() && time.getDate() === now.getDate();
  };

  const unitSymbol = unit === 'celsius' ? '°' : '°F';

  return (
    <div className="glass-card p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">3-Hour Forecast</h3>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => scroll('right')}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scroll-smooth scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent"
        style={{ scrollbarWidth: 'thin' }}
      >
        {hourlyData.map((hour, index) => {
          const isCurrent = isCurrentHour(hour.time);
          return (
            <div
              key={index}
              className={`flex-shrink-0 w-24 p-4 rounded-2xl text-center transition-all duration-300 hover:scale-105 ${
                isCurrent 
                  ? 'bg-primary/20 border-2 border-primary ring-2 ring-primary/30' 
                  : 'bg-secondary/30 hover:bg-secondary/50'
              }`}
            >
              {isCurrent && (
                <span className="text-xs font-medium text-primary mb-1 block">Now</span>
              )}
              <p className={`text-sm font-medium mb-2 ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`}>
                {hour.time.toLocaleTimeString('en-US', { hour: 'numeric' })}
              </p>
              <div className="flex justify-center mb-2">
                <WeatherIcon condition={hour.condition} size={32} />
              </div>
              <p className={`text-lg font-bold ${isCurrent ? 'text-primary' : 'text-foreground'}`}>
                {convertTemperature(hour.temperature, unit)}{unitSymbol}
              </p>
              {hour.pop > 0 && (
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Droplets className="w-3 h-3 text-primary/70" />
                  <span className="text-xs text-primary/70">{hour.pop}%</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HourlyForecast;
