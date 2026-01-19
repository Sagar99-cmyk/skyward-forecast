import { useState, useEffect, useCallback } from 'react';
import { CloudSun, Navigation, RefreshCw } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import CurrentWeatherCard from '@/components/CurrentWeatherCard';
import ForecastSection from '@/components/ForecastSection';
import HourlyForecast from '@/components/HourlyForecast';
import RainChart from '@/components/RainChart';
import WeatherAlerts from '@/components/WeatherAlerts';
import SavedCities from '@/components/SavedCities';
import LoadingState from '@/components/LoadingState';
import ErrorMessage from '@/components/ErrorMessage';
import OfflineBanner from '@/components/OfflineBanner';
import TemperatureToggle from '@/components/TemperatureToggle';
import { CurrentWeather, ForecastDay, HourlyForecast as HourlyForecastType, WeatherAlert, SavedCity, TemperatureUnit, WeatherError } from '@/types/weather';
import { getCurrentWeather, getForecast, getHourlyForecast, getWeatherAlerts, getCachedData, setCachedData, setLastSearchedCity } from '@/services/weatherService';
import { getSavedCities, saveCity, removeCity } from '@/services/savedCitiesService';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecastType[]>([]);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [savedCities, setSavedCities] = useState<SavedCity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<WeatherError | null>(null);
  const [lastSearchedCity, setLastSearched] = useState<string>('');
  const [hasUsedGeolocation, setHasUsedGeolocation] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [cacheTimestamp, setCacheTimestamp] = useState<number | null>(null);
  const [unit, setUnit] = useState<TemperatureUnit>('celsius');

  const { lat, lon, loading: geoLoading, error: geoError } = useGeolocation();
  const { toast } = useToast();

  useEffect(() => {
    setSavedCities(getSavedCities());
    const savedUnit = localStorage.getItem('weathercast_unit');
    if (savedUnit === 'fahrenheit') setUnit('fahrenheit');
  }, []);

  const handleUnitChange = (newUnit: TemperatureUnit) => {
    setUnit(newUnit);
    localStorage.setItem('weathercast_unit', newUnit);
  };

  const fetchAllWeatherData = useCallback(async (cityOrCoords: string | { lat: number; lon: number }) => {
    setIsLoading(true);
    setError(null);
    setIsOffline(false);
    setCacheTimestamp(null);

    // Try cache first for offline support
    const cached = getCachedData(cityOrCoords);

    try {
      const [weatherData, forecastData, hourlyData, alertsData] = await Promise.all([
        getCurrentWeather(cityOrCoords),
        getForecast(cityOrCoords),
        getHourlyForecast(cityOrCoords),
        getWeatherAlerts(cityOrCoords).catch(() => [] as WeatherAlert[])
      ]);

      setCurrentWeather(weatherData);
      setForecast(forecastData);
      setHourlyForecast(hourlyData);
      setAlerts(alertsData);
      setLastSearched(weatherData.city);
      setLastSearchedCity(weatherData.city);

      // Cache the data
      setCachedData(cityOrCoords, {
        current: weatherData,
        forecast: forecastData,
        hourly: hourlyData,
        alerts: alertsData,
      });

      toast({
        title: "Weather Updated",
        description: `Showing weather for ${weatherData.city}, ${weatherData.country}`
      });
    } catch (err) {
      const weatherError = err as WeatherError;
      
      // Use cached data if available on network error
      if (cached && weatherError.code === 'NETWORK_ERROR') {
        setCurrentWeather(cached.current);
        setForecast(cached.forecast);
        setHourlyForecast(cached.hourly);
        setAlerts(cached.alerts);
        setIsOffline(true);
        setCacheTimestamp(cached.timestamp);
        toast({
          title: "Offline Mode",
          description: "Showing cached weather data",
          variant: "default"
        });
      } else {
        setError(weatherError);
        setCurrentWeather(null);
        setForecast([]);
        setHourlyForecast([]);
        setAlerts([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!geoLoading && lat && lon && !hasUsedGeolocation) {
      setHasUsedGeolocation(true);
      fetchAllWeatherData({ lat, lon });
    } else if (!geoLoading && geoError && !hasUsedGeolocation) {
      setHasUsedGeolocation(true);
      const lastCity = localStorage.getItem('weathercast_last_city');
      fetchAllWeatherData(lastCity || 'London');
    }
  }, [lat, lon, geoLoading, geoError, hasUsedGeolocation, fetchAllWeatherData]);

  const handleRetry = () => {
    if (lastSearchedCity) {
      fetchAllWeatherData(lastSearchedCity);
    } else if (lat && lon) {
      fetchAllWeatherData({ lat, lon });
    }
  };

  const handleUseMyLocation = () => {
    if (lat && lon) {
      fetchAllWeatherData({ lat, lon });
    }
  };

  const handleRefresh = () => {
    if (currentWeather) {
      fetchAllWeatherData(currentWeather.city);
    }
  };

  const handleSaveCity = () => {
    if (currentWeather) {
      const updated = saveCity({ id: '', name: currentWeather.city, country: currentWeather.country });
      setSavedCities(updated);
      toast({ title: "City Saved", description: `${currentWeather.city} has been added to your saved cities.` });
    }
  };

  const handleRemoveCity = (cityId: string) => {
    setSavedCities(removeCity(cityId));
  };

  const canSaveCurrentCity = currentWeather && !savedCities.some(
    c => c.name.toLowerCase() === currentWeather.city.toLowerCase() && c.country === currentWeather.country
  );

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-2">
            <CloudSun className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">
              Weather<span className="text-primary">Cast</span>
            </h1>
          </div>
          <p className="text-muted-foreground">Real-time weather updates & forecasts</p>
        </header>

        <div className="mb-6 flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <SearchBar onSearch={fetchAllWeatherData} isLoading={isLoading} />
          </div>
          <div className="flex items-center gap-2">
            <TemperatureToggle unit={unit} onChange={handleUnitChange} />
            {lat && lon && (
              <Button variant="outline" onClick={handleUseMyLocation} disabled={isLoading} className="gap-2 whitespace-nowrap">
                <Navigation className="w-4 h-4" />
                <span className="hidden sm:inline">My Location</span>
              </Button>
            )}
            {currentWeather && (
              <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            )}
          </div>
        </div>

        {isOffline && cacheTimestamp && (
          <div className="mb-4">
            <OfflineBanner lastUpdated={cacheTimestamp} />
          </div>
        )}

        <div className="mb-6">
          <SavedCities 
            cities={savedCities} 
            currentCity={currentWeather?.city || ''} 
            onSelectCity={fetchAllWeatherData} 
            onRemoveCity={handleRemoveCity} 
            onSaveCurrentCity={handleSaveCity} 
            canSaveCurrent={!!canSaveCurrentCity} 
          />
        </div>

        {alerts.length > 0 && (
          <div className="mb-6">
            <WeatherAlerts alerts={alerts} />
          </div>
        )}

        <main className="space-y-6">
          {(isLoading || geoLoading) && !currentWeather && <LoadingState />}

          {error && <ErrorMessage error={error} onRetry={handleRetry} />}

          {currentWeather && !error && (
            <>
              <CurrentWeatherCard weather={currentWeather} unit={unit} />
              {hourlyForecast.length > 0 && <HourlyForecast hourlyData={hourlyForecast} unit={unit} />}
              {hourlyForecast.length > 0 && <RainChart hourlyData={hourlyForecast} />}
              {forecast.length > 0 && <ForecastSection forecast={forecast} title="5-Day Forecast" unit={unit} />}
            </>
          )}
        </main>

        <footer className="text-center mt-12 text-muted-foreground text-sm">
          <p>© 2025 WeatherCast. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
