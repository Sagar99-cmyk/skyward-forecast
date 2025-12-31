import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const API_KEY = Deno.env.get('OPENWEATHERMAP_API_KEY');
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';

interface GeoLocation {
  lat: number;
  lon: number;
  name: string;
  country: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { city, lat, lon, type } = await req.json();
    
    if (!city && (!lat || !lon)) {
      throw new Error('City or coordinates are required');
    }

    if (!API_KEY) {
      throw new Error('OpenWeatherMap API key is not configured');
    }

    let location: GeoLocation;

    if (lat && lon) {
      // Reverse geocoding to get city name from coordinates
      console.log(`Fetching location for coords: ${lat}, ${lon}`);
      const reverseGeoResponse = await fetch(
        `${GEO_URL}/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`
      );
      
      if (!reverseGeoResponse.ok) {
        throw new Error('Failed to reverse geocode location');
      }
      
      const reverseGeoData = await reverseGeoResponse.json();
      
      if (!reverseGeoData || reverseGeoData.length === 0) {
        location = { lat, lon, name: 'Your Location', country: '' };
      } else {
        location = {
          lat,
          lon,
          name: reverseGeoData[0].name,
          country: reverseGeoData[0].country,
        };
      }
    } else {
      // Forward geocoding from city name
      console.log(`Fetching weather for city: ${city}, type: ${type}`);
      const geoResponse = await fetch(
        `${GEO_URL}/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`
      );
      
      if (!geoResponse.ok) {
        throw new Error('Failed to find location');
      }
      
      const geoData = await geoResponse.json();
      
      if (!geoData || geoData.length === 0) {
        throw new Error('City not found. Please check the spelling and try again.');
      }
      
      location = {
        lat: geoData[0].lat,
        lon: geoData[0].lon,
        name: geoData[0].name,
        country: geoData[0].country,
      };
    }

    if (type === 'current') {
      const weatherResponse = await fetch(
        `${BASE_URL}/weather?lat=${location.lat}&lon=${location.lon}&units=metric&appid=${API_KEY}`
      );
      
      if (!weatherResponse.ok) {
        if (weatherResponse.status === 401) {
          throw new Error('Invalid API key. Please check your OpenWeatherMap API key.');
        }
        throw new Error('Failed to fetch weather data');
      }
      
      const weatherData = await weatherResponse.json();
      
      return new Response(JSON.stringify({
        location,
        weather: weatherData,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else if (type === 'forecast') {
      // 5-day/3-hour forecast (includes hourly data)
      const forecastResponse = await fetch(
        `${BASE_URL}/forecast?lat=${location.lat}&lon=${location.lon}&units=metric&appid=${API_KEY}`
      );
      
      if (!forecastResponse.ok) {
        throw new Error('Failed to fetch forecast data');
      }
      
      const forecastData = await forecastResponse.json();
      
      return new Response(JSON.stringify({
        location,
        forecast: forecastData,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else if (type === 'onecall') {
      // One Call API for hourly + alerts (requires subscription)
      // Fallback to regular forecast if One Call fails
      try {
        const oneCallResponse = await fetch(
          `${BASE_URL.replace('/2.5', '/3.0')}/onecall?lat=${location.lat}&lon=${location.lon}&units=metric&exclude=minutely&appid=${API_KEY}`
        );
        
        if (oneCallResponse.ok) {
          const oneCallData = await oneCallResponse.json();
          return new Response(JSON.stringify({
            location,
            data: oneCallData,
            hasAlerts: !!oneCallData.alerts?.length,
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      } catch (e) {
        console.log('One Call API not available, using forecast');
      }
      
      // Fallback: use regular forecast for hourly data
      const forecastResponse = await fetch(
        `${BASE_URL}/forecast?lat=${location.lat}&lon=${location.lon}&units=metric&appid=${API_KEY}`
      );
      
      const forecastData = await forecastResponse.json();
      
      return new Response(JSON.stringify({
        location,
        forecast: forecastData,
        hasAlerts: false,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      throw new Error('Invalid type parameter. Use "current", "forecast", or "onecall".');
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
