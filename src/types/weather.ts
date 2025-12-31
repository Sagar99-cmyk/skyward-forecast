export interface CurrentWeather {
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
  condition: WeatherCondition;
  timestamp: number;
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
  code?: string;
}

export interface GeoLocation {
  lat: number;
  lon: number;
  name: string;
  country: string;
}
