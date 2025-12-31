import { useState, useEffect, useCallback } from 'react';
import { CloudSun } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import CurrentWeatherCard from '@/components/CurrentWeatherCard';
import ForecastSection from '@/components/ForecastSection';
import LoadingState from '@/components/LoadingState';
import ErrorMessage from '@/components/ErrorMessage';
import DemoBanner from '@/components/DemoBanner';
import { CurrentWeather, ForecastDay } from '@/types/weather';
import { getCurrentWeather, getForecast, isUsingDemoData } from '@/services/weatherService';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSearchedCity, setLastSearchedCity] = useState<string>('');
  const { toast } = useToast();

  const fetchWeatherData = useCallback(async (city: string) => {
    setIsLoading(true);
    setError(null);
    setLastSearchedCity(city);

    try {
      const [weatherData, forecastData] = await Promise.all([
        getCurrentWeather(city),
        getForecast(city),
      ]);

      setCurrentWeather(weatherData);
      setForecast(forecastData);
      
      toast({
        title: "Weather Updated",
        description: `Showing weather for ${weatherData.city}, ${weatherData.country}`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch weather data';
      setError(errorMessage);
      setCurrentWeather(null);
      setForecast([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const handleRetry = () => {
    if (lastSearchedCity) {
      fetchWeatherData(lastSearchedCity);
    }
  };

  // Load default city on mount
  useEffect(() => {
    fetchWeatherData('London');
  }, [fetchWeatherData]);

  return (
    <div className="min-h-screen py-8 px-4">
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
            Real-time weather updates & 30-day forecasts
          </p>
        </header>

        {/* Demo Banner */}
        {isUsingDemoData() && <DemoBanner />}

        {/* Search */}
        <div className="mb-8">
          <SearchBar onSearch={fetchWeatherData} isLoading={isLoading} />
        </div>

        {/* Content */}
        <main className="space-y-8">
          {isLoading && !currentWeather && (
            <LoadingState />
          )}

          {error && (
            <ErrorMessage message={error} onRetry={handleRetry} />
          )}

          {currentWeather && !error && (
            <>
              <CurrentWeatherCard weather={currentWeather} />
              
              {forecast.length > 0 && (
                <ForecastSection 
                  forecast={forecast} 
                  title={isUsingDemoData() ? "30-Day Forecast (Demo)" : "Weather Forecast"}
                />
              )}
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="text-center mt-12 text-muted-foreground text-sm">
          <p>
            Powered by OpenWeatherMap API
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
