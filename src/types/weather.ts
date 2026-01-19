export interface CurrentWeather {
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  visibility: number;
  description: string;
  icon: string;
  condition: WeatherCondition;
  timestamp: number;
  sunrise: number;
  sunset: number;
  uvIndex?: number;
  aqi?: AirQuality;
}

export interface AirQuality {
  aqi: number;
  category: 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  pm2_5: number;
  pm10: number;
}

export interface ForecastDay {
  date: Date;
  tempMin: number;
  tempMax: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
  condition: WeatherCondition;
}

export interface HourlyForecast {
  time: Date;
  temperature: number;
  feelsLike: number;
  humidity: number;
  description: string;
  icon: string;
  condition: WeatherCondition;
  pop: number;
  windSpeed: number;
}

export interface WeatherAlert {
  event: string;
  sender: string;
  start: Date;
  end: Date;
  description: string;
  tags: string[];
}

export interface SavedCity {
  id: string;
  name: string;
  country: string;
  lat?: number;
  lon?: number;
}

export type WeatherCondition = 
  | 'clear'
  | 'clouds'
  | 'rain'
  | 'drizzle'
  | 'thunderstorm'
  | 'snow'
  | 'mist'
  | 'fog';

export interface WeatherError {
  message: string;
  code: WeatherErrorCode;
  retryable: boolean;
}

export type WeatherErrorCode = 
  | 'NETWORK_ERROR'
  | 'API_KEY_INVALID'
  | 'CITY_NOT_FOUND'
  | 'RATE_LIMIT'
  | 'SERVER_ERROR'
  | 'TIMEOUT'
  | 'LOCATION_DENIED'
  | 'UNKNOWN';

export interface GeoLocation {
  lat: number;
  lon: number;
  name: string;
  country: string;
}

export interface CachedWeatherData {
  current: CurrentWeather;
  forecast: ForecastDay[];
  hourly: HourlyForecast[];
  alerts: WeatherAlert[];
  timestamp: number;
}

export type TemperatureUnit = 'celsius' | 'fahrenheit';
