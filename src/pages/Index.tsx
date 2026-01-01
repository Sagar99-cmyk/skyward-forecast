import { useState, useEffect, useCallback } from 'react';
import { CloudSun, Navigation } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import CurrentWeatherCard from '@/components/CurrentWeatherCard';
import ForecastSection from '@/components/ForecastSection';
import HourlyChart from '@/components/HourlyChart';
import WeatherAlerts from '@/components/WeatherAlerts';
import SavedCities from '@/components/SavedCities';
import LoadingState from '@/components/LoadingState';
import ErrorMessage from '@/components/ErrorMessage';
import { CurrentWeather, ForecastDay, HourlyForecast, WeatherAlert, SavedCity } from '@/types/weather';
import { getCurrentWeather, getForecast, getHourlyForecast, getWeatherAlerts } from '@/services/weatherService';
import { getSavedCities, saveCity, removeCity } from '@/services/savedCitiesService';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
const Index = () => {
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecast[]>([]);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [savedCities, setSavedCities] = useState<SavedCity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSearchedCity, setLastSearchedCity] = useState<string>('');
  const [hasUsedGeolocation, setHasUsedGeolocation] = useState(false);
  const {
    lat,
    lon,
    loading: geoLoading,
    error: geoError
  } = useGeolocation();
  const {
    toast
  } = useToast();

  // Load saved cities on mount
  useEffect(() => {
    setSavedCities(getSavedCities());
  }, []);
  const fetchAllWeatherData = useCallback(async (cityOrCoords: string | {
    lat: number;
    lon: number;
  }) => {
    setIsLoading(true);
    setError(null);
    if (typeof cityOrCoords === 'string') {
      setLastSearchedCity(cityOrCoords);
    }
    try {
      const [weatherData, forecastData, hourlyData, alertsData] = await Promise.all([getCurrentWeather(cityOrCoords), getForecast(cityOrCoords), getHourlyForecast(cityOrCoords), getWeatherAlerts(cityOrCoords).catch(() => [] as WeatherAlert[])]);
      setCurrentWeather(weatherData);
      setForecast(forecastData);
      setHourlyForecast(hourlyData);
      setAlerts(alertsData);
      setLastSearchedCity(weatherData.city);
      toast({
        title: "Weather Updated",
        description: `Showing weather for ${weatherData.city}, ${weatherData.country}`
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch weather data';
      setError(errorMessage);
      setCurrentWeather(null);
      setForecast([]);
      setHourlyForecast([]);
      setAlerts([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Auto-fetch weather when geolocation is available
  useEffect(() => {
    if (!geoLoading && lat && lon && !hasUsedGeolocation) {
      setHasUsedGeolocation(true);
      fetchAllWeatherData({
        lat,
        lon
      });
    } else if (!geoLoading && geoError && !hasUsedGeolocation) {
      // Fallback to London if geolocation fails
      setHasUsedGeolocation(true);
      fetchAllWeatherData('London');
    }
  }, [lat, lon, geoLoading, geoError, hasUsedGeolocation, fetchAllWeatherData]);
  const handleRetry = () => {
    if (lastSearchedCity) {
      fetchAllWeatherData(lastSearchedCity);
    } else if (lat && lon) {
      fetchAllWeatherData({
        lat,
        lon
      });
    }
  };
  const handleUseMyLocation = () => {
    if (lat && lon) {
      fetchAllWeatherData({
        lat,
        lon
      });
    }
  };
  const handleSaveCity = () => {
    if (currentWeather) {
      const updated = saveCity({
        id: '',
        name: currentWeather.city,
        country: currentWeather.country
      });
      setSavedCities(updated);
      toast({
        title: "City Saved",
        description: `${currentWeather.city} has been added to your saved cities.`
      });
    }
  };
  const handleRemoveCity = (cityId: string) => {
    const updated = removeCity(cityId);
    setSavedCities(updated);
  };
  const canSaveCurrentCity = currentWeather && !savedCities.some(c => c.name.toLowerCase() === currentWeather.city.toLowerCase() && c.country === currentWeather.country);
  return <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-2">
            <CloudSun className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">
              Weather<span className="text-primary">Cast</span>
            </h1>
          </div>
          <p className="text-muted-foreground">
            Real-time weather updates & forecasts
          </p>
        </header>

        {/* Search */}
        <div className="mb-6 flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <SearchBar onSearch={fetchAllWeatherData} isLoading={isLoading} />
          </div>
          {lat && lon && <Button variant="outline" onClick={handleUseMyLocation} disabled={isLoading} className="gap-2 whitespace-nowrap">
              <Navigation className="w-4 h-4" />
              My Location
            </Button>}
        </div>

        {/* Saved Cities */}
        <div className="mb-6">
          <SavedCities cities={savedCities} currentCity={currentWeather?.city || ''} onSelectCity={fetchAllWeatherData} onRemoveCity={handleRemoveCity} onSaveCurrentCity={handleSaveCity} canSaveCurrent={!!canSaveCurrentCity} />
        </div>

        {/* Weather Alerts */}
        {alerts.length > 0 && <div className="mb-6">
            <WeatherAlerts alerts={alerts} />
          </div>}

        {/* Content */}
        <main className="space-y-6">
          {(isLoading || geoLoading) && !currentWeather && <LoadingState />}

          {error && <ErrorMessage message={error} onRetry={handleRetry} />}

          {currentWeather && !error && <>
              <CurrentWeatherCard weather={currentWeather} />
              
              {hourlyForecast.length > 0 && <HourlyChart hourlyData={hourlyForecast} />}
              
              {forecast.length > 0 && <ForecastSection forecast={forecast} title="5-Day Forecast" />}
            </>}
        </main>

        {/* Footer */}
        <footer className="text-center mt-12 text-muted-foreground text-sm">
          <p>© 2025 WeatherCast. All rights reserved.</p>
        </footer>
      </div>
    </div>;
};
export default Index;