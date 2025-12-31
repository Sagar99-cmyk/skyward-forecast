import { supabase } from '@/integrations/supabase/client';
import { CurrentWeather, ForecastDay, HourlyForecast, WeatherAlert, WeatherCondition } from '@/types/weather';

const mapCondition = (weatherId: number): WeatherCondition => {
  if (weatherId >= 200 && weatherId < 300) return 'thunderstorm';
  if (weatherId >= 300 && weatherId < 400) return 'drizzle';
  if (weatherId >= 500 && weatherId < 600) return 'rain';
  if (weatherId >= 600 && weatherId < 700) return 'snow';
  if (weatherId >= 700 && weatherId < 800) return 'mist';
  if (weatherId === 800) return 'clear';
  return 'clouds';
};

interface WeatherRequest {
  city?: string;
  lat?: number;
  lon?: number;
  type: 'current' | 'forecast' | 'onecall';
}

export const getCurrentWeather = async (cityOrCoords: string | { lat: number; lon: number }): Promise<CurrentWeather> => {
  const request: WeatherRequest = { type: 'current' };
  
  if (typeof cityOrCoords === 'string') {
    request.city = cityOrCoords;
  } else {
    request.lat = cityOrCoords.lat;
    request.lon = cityOrCoords.lon;
  }
  
  console.log('Fetching current weather:', request);
  
  const { data, error } = await supabase.functions.invoke('weather', {
    body: request,
  });

  if (error) {
    console.error('Edge function error:', error);
    throw new Error(error.message || 'Failed to fetch weather data');
  }

  if (data.error) {
    throw new Error(data.error);
  }

  const { location, weather } = data;

  return {
    city: location.name,
    country: location.country,
    temperature: Math.round(weather.main.temp),
    feelsLike: Math.round(weather.main.feels_like),
    humidity: weather.main.humidity,
    windSpeed: Math.round(weather.wind.speed * 3.6),
    description: weather.weather[0].description,
    icon: weather.weather[0].icon,
    condition: mapCondition(weather.weather[0].id),
    timestamp: weather.dt * 1000,
  };
};

export const getForecast = async (cityOrCoords: string | { lat: number; lon: number }): Promise<ForecastDay[]> => {
  const request: WeatherRequest = { type: 'forecast' };
  
  if (typeof cityOrCoords === 'string') {
    request.city = cityOrCoords;
  } else {
    request.lat = cityOrCoords.lat;
    request.lon = cityOrCoords.lon;
  }
  
  console.log('Fetching forecast:', request);
  
  const { data, error } = await supabase.functions.invoke('weather', {
    body: request,
  });

  if (error) {
    throw new Error(error.message || 'Failed to fetch forecast data');
  }

  if (data.error) {
    throw new Error(data.error);
  }

  const { forecast } = data;

  // Group by day
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

export const getHourlyForecast = async (cityOrCoords: string | { lat: number; lon: number }): Promise<HourlyForecast[]> => {
  const request: WeatherRequest = { type: 'forecast' };
  
  if (typeof cityOrCoords === 'string') {
    request.city = cityOrCoords;
  } else {
    request.lat = cityOrCoords.lat;
    request.lon = cityOrCoords.lon;
  }
  
  console.log('Fetching hourly forecast:', request);
  
  const { data, error } = await supabase.functions.invoke('weather', {
    body: request,
  });

  if (error) {
    throw new Error(error.message || 'Failed to fetch hourly forecast');
  }

  if (data.error) {
    throw new Error(data.error);
  }

  const { forecast } = data;

  // Get next 24 hours (8 x 3-hour intervals)
  return forecast.list.slice(0, 8).map((item: any) => ({
    time: new Date(item.dt * 1000),
    temperature: Math.round(item.main.temp),
    feelsLike: Math.round(item.main.feels_like),
    humidity: item.main.humidity,
    description: item.weather[0].description,
    icon: item.weather[0].icon,
    condition: mapCondition(item.weather[0].id),
    pop: Math.round((item.pop || 0) * 100),
  }));
};

export const getWeatherAlerts = async (cityOrCoords: string | { lat: number; lon: number }): Promise<WeatherAlert[]> => {
  const request: WeatherRequest = { type: 'onecall' };
  
  if (typeof cityOrCoords === 'string') {
    request.city = cityOrCoords;
  } else {
    request.lat = cityOrCoords.lat;
    request.lon = cityOrCoords.lon;
  }
  
  console.log('Fetching weather alerts:', request);
  
  const { data, error } = await supabase.functions.invoke('weather', {
    body: request,
  });

  if (error || data.error || !data.data?.alerts) {
    return [];
  }

  return data.data.alerts.map((alert: any) => ({
    event: alert.event,
    sender: alert.sender_name,
    start: new Date(alert.start * 1000),
    end: new Date(alert.end * 1000),
    description: alert.description,
    tags: alert.tags || [],
  }));
};

export const getWeatherIconUrl = (icon: string): string => {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
};
