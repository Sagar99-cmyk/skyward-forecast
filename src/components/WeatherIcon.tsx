import { WeatherCondition } from '@/types/weather';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudDrizzle, CloudFog, Cloudy } from 'lucide-react';

interface WeatherIconProps {
  condition: WeatherCondition;
  className?: string;
  size?: number;
}

const WeatherIcon = ({ condition, className = '', size = 48 }: WeatherIconProps) => {
  const iconProps = {
    size,
    className: `${className} transition-all duration-300`,
    strokeWidth: 1.5,
  };

  const icons: Record<WeatherCondition, JSX.Element> = {
    clear: <Sun {...iconProps} className={`${iconProps.className} text-weather-sunny animate-pulse-slow`} />,
    clouds: <Cloud {...iconProps} className={`${iconProps.className} text-weather-cloudy`} />,
    rain: <CloudRain {...iconProps} className={`${iconProps.className} text-weather-rainy`} />,
    drizzle: <CloudDrizzle {...iconProps} className={`${iconProps.className} text-weather-rainy`} />,
    thunderstorm: <CloudLightning {...iconProps} className={`${iconProps.className} text-weather-storm`} />,
    snow: <CloudSnow {...iconProps} className={`${iconProps.className} text-weather-snow`} />,
    mist: <CloudFog {...iconProps} className={`${iconProps.className} text-muted-foreground`} />,
    fog: <CloudFog {...iconProps} className={`${iconProps.className} text-muted-foreground`} />,
  };

  return icons[condition] || <Cloudy {...iconProps} />;
};

export default WeatherIcon;
