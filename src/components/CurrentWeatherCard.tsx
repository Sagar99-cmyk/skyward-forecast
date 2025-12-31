import { CurrentWeather } from '@/types/weather';
import WeatherIcon from './WeatherIcon';
import { Droplets, Wind, Thermometer } from 'lucide-react';

interface CurrentWeatherCardProps {
  weather: CurrentWeather;
}

const CurrentWeatherCard = ({ weather }: CurrentWeatherCardProps) => {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="glass-card p-8 animate-slide-up">
      {/* Location Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-foreground">
          {weather.city}
          <span className="text-muted-foreground ml-2 text-lg font-normal">
            {weather.country}
          </span>
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Updated at {formatTime(weather.timestamp)}
        </p>
      </div>

      {/* Main Weather Display */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8">
        <div className="animate-float">
          <WeatherIcon condition={weather.condition} size={100} />
        </div>
        
        <div className="text-center md:text-left">
          <div className="text-7xl font-light text-foreground tracking-tight">
            {weather.temperature}
            <span className="text-4xl align-top text-muted-foreground">°C</span>
          </div>
          <p className="text-xl text-muted-foreground capitalize mt-2">
            {weather.description}
          </p>
        </div>
      </div>

      {/* Weather Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4 text-center">
          <Thermometer className="w-6 h-6 mx-auto mb-2 text-accent" />
          <p className="text-sm text-muted-foreground">Feels Like</p>
          <p className="text-xl font-semibold text-foreground">{weather.feelsLike}°C</p>
        </div>
        
        <div className="glass-card p-4 text-center">
          <Droplets className="w-6 h-6 mx-auto mb-2 text-primary" />
          <p className="text-sm text-muted-foreground">Humidity</p>
          <p className="text-xl font-semibold text-foreground">{weather.humidity}%</p>
        </div>
        
        <div className="glass-card p-4 text-center">
          <Wind className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Wind</p>
          <p className="text-xl font-semibold text-foreground">{weather.windSpeed} km/h</p>
        </div>
      </div>
    </div>
  );
};

export default CurrentWeatherCard;
