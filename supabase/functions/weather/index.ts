import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const API_KEY = Deno.env.get('OPENWEATHERMAP_API_KEY');
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';
const PRO_URL = 'https://pro.openweathermap.org/data/2.5';

interface GeoLocation {
  lat: number;
  lon: number;
  name: string;
  country: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { city, type } = await req.json();
    
    if (!city) {
      throw new Error('City parameter is required');
    }

    if (!API_KEY) {
      throw new Error('OpenWeatherMap API key is not configured');
    }

    console.log(`Fetching weather for city: ${city}, type: ${type}`);

    // First, get coordinates from city name
    const geoResponse = await fetch(
      `${GEO_URL}/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`
    );
    
    if (!geoResponse.ok) {
      console.error('Geo API error:', geoResponse.status, geoResponse.statusText);
      throw new Error('Failed to find location');
    }
    
    const geoData = await geoResponse.json();
    console.log('Geo response:', JSON.stringify(geoData));
    
    if (!geoData || geoData.length === 0) {
      throw new Error('City not found. Please check the spelling and try again.');
    }
    
    const location: GeoLocation = {
      lat: geoData[0].lat,
      lon: geoData[0].lon,
      name: geoData[0].name,
      country: geoData[0].country,
    };

    if (type === 'current') {
      // Fetch current weather
      const weatherResponse = await fetch(
        `${BASE_URL}/weather?lat=${location.lat}&lon=${location.lon}&units=metric&appid=${API_KEY}`
      );
      
      if (!weatherResponse.ok) {
        const errorText = await weatherResponse.text();
        console.error('Weather API error:', weatherResponse.status, errorText);
        if (weatherResponse.status === 401) {
          throw new Error('Invalid API key. Please check your OpenWeatherMap API key.');
        }
        throw new Error('Failed to fetch weather data');
      }
      
      const weatherData = await weatherResponse.json();
      console.log('Weather response:', JSON.stringify(weatherData));
      
      return new Response(JSON.stringify({
        location,
        weather: weatherData,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else if (type === 'forecast') {
      // Try 30-day forecast (Pro API) first, fall back to 5-day
      let forecastData;
      let isPro = false;
      
      try {
        // Try Pro API for 30-day forecast
        const proResponse = await fetch(
          `${PRO_URL}/forecast/climate?lat=${location.lat}&lon=${location.lon}&cnt=30&units=metric&appid=${API_KEY}`
        );
        
        if (proResponse.ok) {
          forecastData = await proResponse.json();
          isPro = true;
          console.log('Pro forecast response (30-day)');
        } else {
          console.log('Pro API not available, falling back to free tier');
        }
      } catch (e) {
        console.log('Pro API failed, using free tier:', e);
      }
      
      if (!forecastData) {
        // Fall back to free 5-day forecast
        const forecastResponse = await fetch(
          `${BASE_URL}/forecast?lat=${location.lat}&lon=${location.lon}&units=metric&appid=${API_KEY}`
        );
        
        if (!forecastResponse.ok) {
          const errorText = await forecastResponse.text();
          console.error('Forecast API error:', forecastResponse.status, errorText);
          throw new Error('Failed to fetch forecast data');
        }
        
        forecastData = await forecastResponse.json();
        console.log('Free forecast response (5-day)');
      }
      
      return new Response(JSON.stringify({
        location,
        forecast: forecastData,
        isPro,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      throw new Error('Invalid type parameter. Use "current" or "forecast".');
    }
  } catch (error) {
    console.error('Error in weather function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
