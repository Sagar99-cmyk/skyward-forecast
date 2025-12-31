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

export interface HourlyForecast {
  time: Date;
  temperature: number;
  feelsLike: number;
  humidity: number;
  description: string;
  icon: string;
  condition: WeatherCondition;
  pop: number; // Probability of precipitation
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
  code?: string;
}

export interface GeoLocation {
  lat: number;
  lon: number;
  name: string;
  country: string;
}
