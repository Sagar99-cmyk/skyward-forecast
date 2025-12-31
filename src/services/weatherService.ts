import { CurrentWeather, ForecastDay, WeatherCondition, GeoLocation } from '@/types/weather';

const API_KEY = 'demo'; // User needs to add their own API key
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';

// Demo data for when API key is not set
const generateDemoCurrentWeather = (city: string): CurrentWeather => ({
  city,
  country: 'Demo',
  temperature: 22,
  feelsLike: 24,
  humidity: 65,
  windSpeed: 12,
  description: 'Partly Cloudy',
  icon: '02d',
  condition: 'clouds',
  timestamp: Date.now(),
});

const generateDemoForecast = (): ForecastDay[] => {
  const conditions: WeatherCondition[] = ['clear', 'clouds', 'rain', 'clear', 'clouds'];
  const icons = ['01d', '03d', '10d', '01d', '04d'];
  const descriptions = ['Clear sky', 'Scattered clouds', 'Light rain', 'Sunny', 'Overcast'];
  
  return Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i + 1);
    const conditionIndex = i % 5;
    
    return {
      date,
      tempMin: 15 + Math.random() * 5,
      tempMax: 22 + Math.random() * 8,
      humidity: 50 + Math.random() * 30,
      windSpeed: 5 + Math.random() * 15,
      description: descriptions[conditionIndex],
      icon: icons[conditionIndex],
      condition: conditions[conditionIndex],
    };
  });
};

const mapCondition = (weatherId: number): WeatherCondition => {
  if (weatherId >= 200 && weatherId < 300) return 'thunderstorm';
  if (weatherId >= 300 && weatherId < 400) return 'drizzle';
  if (weatherId >= 500 && weatherId < 600) return 'rain';
  if (weatherId >= 600 && weatherId < 700) return 'snow';
  if (weatherId >= 700 && weatherId < 800) return 'mist';
  if (weatherId === 800) return 'clear';
  return 'clouds';
};

export const getGeoLocation = async (city: string): Promise<GeoLocation> => {
  if (API_KEY === 'demo') {
    return { lat: 0, lon: 0, name: city, country: 'Demo' };
  }

  const response = await fetch(
    `${GEO_URL}/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to find location');
  }
  
  const data = await response.json();
  
  if (data.length === 0) {
    throw new Error('City not found. Please check the spelling and try again.');
  }
  
  return {
    lat: data[0].lat,
    lon: data[0].lon,
    name: data[0].name,
    country: data[0].country,
  };
};

export const getCurrentWeather = async (city: string): Promise<CurrentWeather> => {
  if (API_KEY === 'demo') {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return generateDemoCurrentWeather(city);
  }

  try {
    const geo = await getGeoLocation(city);
    
    const response = await fetch(
      `${BASE_URL}/weather?lat=${geo.lat}&lon=${geo.lon}&units=metric&appid=${API_KEY}`
    );
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your OpenWeatherMap API key.');
      }
      throw new Error('Failed to fetch weather data');
    }
    
    const data = await response.json();
    
    return {
      city: geo.name,
      country: geo.country,
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      condition: mapCondition(data.weather[0].id),
      timestamp: data.dt * 1000,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error. Please check your connection.');
  }
};

export const getForecast = async (city: string): Promise<ForecastDay[]> => {
  if (API_KEY === 'demo') {
    await new Promise(resolve => setTimeout(resolve, 600));
    return generateDemoForecast();
  }

  try {
    const geo = await getGeoLocation(city);
    
    // Using 5-day forecast API (free tier) - for 30-day you need Pro subscription
    const response = await fetch(
      `${BASE_URL}/forecast?lat=${geo.lat}&lon=${geo.lon}&units=metric&appid=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch forecast data');
    }
    
    const data = await response.json();
    
    // Group by day and get daily min/max
    const dailyData = new Map<string, ForecastDay>();
    
    data.list.forEach((item: any) => {
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
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error. Please check your connection.');
  }
};

export const getWeatherIconUrl = (icon: string): string => {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
};

export const isUsingDemoData = (): boolean => API_KEY === 'demo';
