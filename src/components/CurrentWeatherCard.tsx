import { CurrentWeather, TemperatureUnit } from '@/types/weather';
import WeatherIcon from './WeatherIcon';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Sunrise, 
  Sunset, 
  Eye, 
  Gauge,
  Navigation,
  Leaf
} from 'lucide-react';
import { getWindDirection, convertTemperature } from '@/services/weatherService';

interface CurrentWeatherCardProps {
  weather: CurrentWeather;
  unit?: TemperatureUnit;
}

const CurrentWeatherCard = ({ weather, unit = 'celsius' }: CurrentWeatherCardProps) => {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const temp = convertTemperature(weather.temperature, unit);
  const feelsLike = convertTemperature(weather.feelsLike, unit);
  const unitSymbol = unit === 'celsius' ? '°C' : '°F';

  const getAqiColor = (aqi: number) => {
    const colors = ['text-green-400', 'text-yellow-400', 'text-orange-400', 'text-red-400', 'text-purple-400', 'text-rose-600'];
    return colors[Math.min(aqi - 1, 5)] || 'text-muted-foreground';
  };

  return (
    <div className="glass-card p-6 animate-slide-up overflow-hidden relative">
      {/* Background gradient based on condition */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className={`w-full h-full ${
          weather.condition === 'clear' ? 'bg-gradient-to-br from-amber-400 to-orange-500' :
          weather.condition === 'rain' || weather.condition === 'drizzle' ? 'bg-gradient-to-br from-blue-400 to-slate-600' :
          weather.condition === 'thunderstorm' ? 'bg-gradient-to-br from-purple-600 to-slate-800' :
          weather.condition === 'snow' ? 'bg-gradient-to-br from-blue-100 to-slate-300' :
          'bg-gradient-to-br from-slate-400 to-slate-600'
        }`} />
      </div>

      <div className="relative z-10">
        {/* Location & Time */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{weather.city}</h2>
            <p className="text-muted-foreground">{weather.country}</p>
          </div>
          <p className="text-sm text-muted-foreground">Updated: {formatTime(weather.timestamp)}</p>
        </div>

        {/* Main Weather Display */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="animate-float">
              <WeatherIcon condition={weather.condition} size={80} />
            </div>
            <div>
              <div className="text-6xl font-bold text-foreground">
                {temp}<span className="text-3xl text-muted-foreground">{unitSymbol}</span>
              </div>
              <p className="text-lg text-muted-foreground capitalize">{weather.description}</p>
            </div>
          </div>

          {/* Sunrise/Sunset - Desktop */}
          <div className="hidden sm:flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Sunrise className="w-5 h-5 text-amber-400" />
              <span className="text-muted-foreground">Sunrise</span>
              <span className="text-foreground font-medium">{formatTime(weather.sunrise)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Sunset className="w-5 h-5 text-orange-500" />
              <span className="text-muted-foreground">Sunset</span>
              <span className="text-foreground font-medium">{formatTime(weather.sunset)}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatItem icon={<Thermometer className="w-5 h-5 text-primary" />} label="Feels Like" value={`${feelsLike}${unitSymbol}`} />
          <StatItem icon={<Droplets className="w-5 h-5 text-primary" />} label="Humidity" value={`${weather.humidity}%`} />
          <StatItem 
            icon={<Wind className="w-5 h-5 text-primary" />} 
            label="Wind" 
            value={`${weather.windSpeed} km/h`}
            subValue={
              <div className="flex items-center gap-1 mt-0.5">
                <Navigation className="w-3 h-3 text-muted-foreground" style={{ transform: `rotate(${weather.windDirection}deg)` }} />
                <span className="text-xs text-muted-foreground">{getWindDirection(weather.windDirection)}</span>
              </div>
            }
          />
          <StatItem icon={<Gauge className="w-5 h-5 text-primary" />} label="Pressure" value={`${weather.pressure} hPa`} />
          <StatItem icon={<Eye className="w-5 h-5 text-primary" />} label="Visibility" value={`${weather.visibility} km`} />
          {weather.aqi && (
            <StatItem 
              icon={<Leaf className={`w-5 h-5 ${getAqiColor(weather.aqi.aqi)}`} />} 
              label="Air Quality" 
              value={weather.aqi.category.split(' ')[0]}
              subValue={<span className={`text-xs ${getAqiColor(weather.aqi.aqi)}`}>PM2.5: {weather.aqi.pm2_5.toFixed(1)}</span>}
            />
          )}
        </div>

        {/* Sunrise/Sunset - Mobile */}
        <div className="flex sm:hidden justify-around mt-6 pt-4 border-t border-border/50">
          <div className="flex items-center gap-2">
            <Sunrise className="w-5 h-5 text-amber-400" />
            <span className="text-foreground">{formatTime(weather.sunrise)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Sunset className="w-5 h-5 text-orange-500" />
            <span className="text-foreground">{formatTime(weather.sunset)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: React.ReactNode;
}

const StatItem = ({ icon, label, value, subValue }: StatItemProps) => (
  <div className="bg-secondary/30 rounded-xl p-3 text-center">
    <div className="flex justify-center mb-2">{icon}</div>
    <p className="text-xs text-muted-foreground mb-1">{label}</p>
    <p className="font-semibold text-foreground">{value}</p>
    {subValue}
  </div>
);

export default CurrentWeatherCard;
