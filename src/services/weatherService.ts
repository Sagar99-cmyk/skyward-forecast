import { supabase } from '@/integrations/supabase/client';
import { 
  CurrentWeather, 
  ForecastDay, 
  HourlyForecast, 
  WeatherAlert, 
  WeatherCondition, 
  WeatherError,
  CachedWeatherData 
} from '@/types/weather';

const CACHE_KEY = 'weathercast_cache';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

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

// Cache helpers
const getCacheKey = (cityOrCoords: string | { lat: number; lon: number }): string => {
  if (typeof cityOrCoords === 'string') {
    return `${CACHE_KEY}_${cityOrCoords.toLowerCase()}`;
  }
  return `${CACHE_KEY}_${cityOrCoords.lat.toFixed(2)}_${cityOrCoords.lon.toFixed(2)}`;
};

export const getCachedData = (cityOrCoords: string | { lat: number; lon: number }): CachedWeatherData | null => {
  try {
    const key = getCacheKey(cityOrCoords);
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    
    const data = JSON.parse(cached) as CachedWeatherData;
    const isValid = Date.now() - data.timestamp < CACHE_DURATION;
    
    if (!isValid) {
      localStorage.removeItem(key);
      return null;
    }
    
    // Restore Date objects
    data.forecast = data.forecast.map(f => ({ ...f, date: new Date(f.date) }));
    data.hourly = data.hourly.map(h => ({ ...h, time: new Date(h.time) }));
    data.alerts = data.alerts.map(a => ({ ...a, start: new Date(a.start), end: new Date(a.end) }));
    
    return data;
  } catch {
    return null;
  }
};

export const setCachedData = (
  cityOrCoords: string | { lat: number; lon: number }, 
  data: Omit<CachedWeatherData, 'timestamp'>
): void => {
  try {
    const key = getCacheKey(cityOrCoords);
    const cacheData: CachedWeatherData = {
      ...data,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(cacheData));
  } catch {
    // Storage might be full
  }
};

export const getLastCachedLocation = (): CachedWeatherData | null => {
  try {
    const lastCity = localStorage.getItem('weathercast_last_city');
    if (lastCity) {
      return getCachedData(lastCity);
    }
    return null;
  } catch {
    return null;
  }
};

export const setLastSearchedCity = (city: string): void => {
  localStorage.setItem('weathercast_last_city', city);
};

const handleApiError = (error: any): never => {
  if (error?.error) {
    const err = error.error as WeatherError;
    throw err;
  }
  throw {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN',
    retryable: true,
  } as WeatherError;
};

export const getCurrentWeather = async (cityOrCoords: string | { lat: number; lon: number }): Promise<CurrentWeather> => {
  const request: WeatherRequest = { type: 'current' };
  
  if (typeof cityOrCoords === 'string') {
    const trimmed = cityOrCoords.trim();
    if (!trimmed) {
      throw { message: 'Please enter a city name', code: 'INVALID_INPUT', retryable: false };
    }
    request.city = trimmed;
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
    throw { message: 'Network error. Please check your connection.', code: 'NETWORK_ERROR', retryable: true };
  }

  if (data.error) {
    handleApiError(data);
  }

  const { location, weather, airPollution } = data;

  return {
    city: location.name,
    country: location.country,
    temperature: Math.round(weather.main.temp),
    feelsLike: Math.round(weather.main.feels_like),
    humidity: weather.main.humidity,
    windSpeed: Math.round(weather.wind.speed * 3.6),
    windDirection: weather.wind.deg || 0,
    pressure: weather.main.pressure,
    visibility: Math.round((weather.visibility || 10000) / 1000),
    description: weather.weather[0].description,
    icon: weather.weather[0].icon,
    condition: mapCondition(weather.weather[0].id),
    timestamp: weather.dt * 1000,
    sunrise: weather.sys.sunrise * 1000,
    sunset: weather.sys.sunset * 1000,
    aqi: airPollution || undefined,
  };
};

export const getForecast = async (cityOrCoords: string | { lat: number; lon: number }): Promise<ForecastDay[]> => {
  const request: WeatherRequest = { type: 'forecast' };
  
  if (typeof cityOrCoords === 'string') {
    request.city = cityOrCoords.trim();
  } else {
    request.lat = cityOrCoords.lat;
    request.lon = cityOrCoords.lon;
  }
  
  console.log('Fetching forecast:', request);
  
  const { data, error } = await supabase.functions.invoke('weather', {
    body: request,
  });

  if (error) {
    throw { message: 'Network error', code: 'NETWORK_ERROR', retryable: true };
  }

  if (data.error) {
    handleApiError(data);
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
    request.city = cityOrCoords.trim();
  } else {
    request.lat = cityOrCoords.lat;
    request.lon = cityOrCoords.lon;
  }
  
  console.log('Fetching hourly forecast:', request);
  
  const { data, error } = await supabase.functions.invoke('weather', {
    body: request,
  });

  if (error) {
    throw { message: 'Network error', code: 'NETWORK_ERROR', retryable: true };
  }

  if (data.error) {
    handleApiError(data);
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
    windSpeed: Math.round(item.wind.speed * 3.6),
  }));
};

export const getWeatherAlerts = async (cityOrCoords: string | { lat: number; lon: number }): Promise<WeatherAlert[]> => {
  const request: WeatherRequest = { type: 'onecall' };
  
  if (typeof cityOrCoords === 'string') {
    request.city = cityOrCoords.trim();
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

export const getWindDirection = (degrees: number): string => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
};

export const convertTemperature = (celsius: number, unit: 'celsius' | 'fahrenheit'): number => {
  if (unit === 'fahrenheit') {
    return Math.round((celsius * 9/5) + 32);
  }
  return celsius;
};
