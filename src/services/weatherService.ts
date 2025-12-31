import { supabase } from '@/integrations/supabase/client';
import { CurrentWeather, ForecastDay, WeatherCondition } from '@/types/weather';

const mapCondition = (weatherId: number): WeatherCondition => {
  if (weatherId >= 200 && weatherId < 300) return 'thunderstorm';
  if (weatherId >= 300 && weatherId < 400) return 'drizzle';
  if (weatherId >= 500 && weatherId < 600) return 'rain';
  if (weatherId >= 600 && weatherId < 700) return 'snow';
  if (weatherId >= 700 && weatherId < 800) return 'mist';
  if (weatherId === 800) return 'clear';
  return 'clouds';
};

export const getCurrentWeather = async (city: string): Promise<CurrentWeather> => {
  console.log('Fetching current weather for:', city);
  
  const { data, error } = await supabase.functions.invoke('weather', {
    body: { city, type: 'current' },
  });

  if (error) {
    console.error('Edge function error:', error);
    throw new Error(error.message || 'Failed to fetch weather data');
  }

  if (data.error) {
    console.error('API error:', data.error);
    throw new Error(data.error);
  }

  const { location, weather } = data;

  return {
    city: location.name,
    country: location.country,
    temperature: Math.round(weather.main.temp),
    feelsLike: Math.round(weather.main.feels_like),
    humidity: weather.main.humidity,
    windSpeed: Math.round(weather.wind.speed * 3.6), // Convert m/s to km/h
    description: weather.weather[0].description,
    icon: weather.weather[0].icon,
    condition: mapCondition(weather.weather[0].id),
    timestamp: weather.dt * 1000,
  };
};

export const getForecast = async (city: string): Promise<ForecastDay[]> => {
  console.log('Fetching forecast for:', city);
  
  const { data, error } = await supabase.functions.invoke('weather', {
    body: { city, type: 'forecast' },
  });

  if (error) {
    console.error('Edge function error:', error);
    throw new Error(error.message || 'Failed to fetch forecast data');
  }

  if (data.error) {
    console.error('API error:', data.error);
    throw new Error(data.error);
  }

  const { forecast, isPro } = data;

  if (isPro && forecast.list) {
    // Pro API 30-day format
    return forecast.list.map((item: any) => ({
      date: new Date(item.dt * 1000),
      tempMin: Math.round(item.temp.min),
      tempMax: Math.round(item.temp.max),
      humidity: item.humidity,
      windSpeed: Math.round(item.speed * 3.6),
      description: item.weather[0].description,
      icon: item.weather[0].icon,
      condition: mapCondition(item.weather[0].id),
    }));
  }

  // Free tier 5-day forecast format - group by day
  const dailyData = new Map<string, ForecastDay>();
  
  forecast.list.forEach((item: any) => {
    const date = new Date(item.dt * 1000);
    const dateKey = date.toISOString().split('T')[0];
    
    const existing = dailyData.get(dateKey);
    
    if (!existing) {
      dailyData.set(dateKey, {
        date,
        tempMin: item.main.temp_min,
        tempMax: item.main.temp_max,
        humidity: item.main.humidity,
        windSpeed: Math.round(item.wind.speed * 3.6),
        description: item.weather[0].description,
        icon: item.weather[0].icon,
        condition: mapCondition(item.weather[0].id),
      });
    } else {
      existing.tempMin = Math.min(existing.tempMin, item.main.temp_min);
      existing.tempMax = Math.max(existing.tempMax, item.main.temp_max);
    }
  });
  
  return Array.from(dailyData.values()).slice(0, 5);
};

export const getWeatherIconUrl = (icon: string): string => {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
};

export const isUsingDemoData = (): boolean => false;
