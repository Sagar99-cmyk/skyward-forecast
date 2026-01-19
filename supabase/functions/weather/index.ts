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

interface WeatherError {
  message: string;
  code: string;
  retryable: boolean;
}

const createError = (message: string, code: string, retryable = false): WeatherError => ({
  message,
  code,
  retryable,
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { city, lat, lon, type } = await req.json();
    
    if (!city && (!lat || !lon)) {
      return new Response(JSON.stringify({ 
        error: createError('City name or coordinates are required', 'INVALID_INPUT', false)
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!API_KEY) {
      return new Response(JSON.stringify({ 
        error: createError('Weather service is not configured. Please contact support.', 'API_KEY_INVALID', false)
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let location: GeoLocation;

    if (lat && lon) {
      // Reverse geocoding to get city name from coordinates
      console.log(`Fetching location for coords: ${lat}, ${lon}`);
      const reverseGeoResponse = await fetch(
        `${GEO_URL}/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`
      );
      
      if (!reverseGeoResponse.ok) {
        if (reverseGeoResponse.status === 401) {
          return new Response(JSON.stringify({ 
            error: createError('Invalid API key', 'API_KEY_INVALID', false)
          }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        return new Response(JSON.stringify({ 
          error: createError('Failed to determine location', 'SERVER_ERROR', true)
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
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
      const sanitizedCity = city.trim().substring(0, 100);
      console.log(`Fetching weather for city: ${sanitizedCity}, type: ${type}`);
      
      const geoResponse = await fetch(
        `${GEO_URL}/direct?q=${encodeURIComponent(sanitizedCity)}&limit=1&appid=${API_KEY}`
      );
      
      if (!geoResponse.ok) {
        if (geoResponse.status === 401) {
          return new Response(JSON.stringify({ 
            error: createError('Invalid API key', 'API_KEY_INVALID', false)
          }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        if (geoResponse.status === 429) {
          return new Response(JSON.stringify({ 
            error: createError('Too many requests. Please try again later.', 'RATE_LIMIT', true)
          }), {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        return new Response(JSON.stringify({ 
          error: createError('Failed to find location', 'SERVER_ERROR', true)
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const geoData = await geoResponse.json();
      
      if (!geoData || geoData.length === 0) {
        return new Response(JSON.stringify({ 
          error: createError(`City "${sanitizedCity}" not found. Please check the spelling and try again.`, 'CITY_NOT_FOUND', false)
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      location = {
        lat: geoData[0].lat,
        lon: geoData[0].lon,
        name: geoData[0].name,
        country: geoData[0].country,
      };
    }

    if (type === 'current') {
      // Fetch current weather and air pollution in parallel
      const [weatherResponse, airPollutionResponse] = await Promise.all([
        fetch(`${BASE_URL}/weather?lat=${location.lat}&lon=${location.lon}&units=metric&appid=${API_KEY}`),
        fetch(`${BASE_URL}/air_pollution?lat=${location.lat}&lon=${location.lon}&appid=${API_KEY}`).catch(() => null),
      ]);
      
      if (!weatherResponse.ok) {
        if (weatherResponse.status === 401) {
          return new Response(JSON.stringify({ 
            error: createError('Invalid API key', 'API_KEY_INVALID', false)
          }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        if (weatherResponse.status === 429) {
          return new Response(JSON.stringify({ 
            error: createError('Too many requests. Please try again later.', 'RATE_LIMIT', true)
          }), {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        return new Response(JSON.stringify({ 
          error: createError('Failed to fetch weather data', 'SERVER_ERROR', true)
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const weatherData = await weatherResponse.json();
      let airPollution = null;
      
      if (airPollutionResponse?.ok) {
        const apData = await airPollutionResponse.json();
        if (apData?.list?.[0]) {
          const aqiValue = apData.list[0].main.aqi;
          const components = apData.list[0].components;
          const categories = ['Good', 'Moderate', 'Unhealthy for Sensitive Groups', 'Unhealthy', 'Very Unhealthy', 'Hazardous'];
          airPollution = {
            aqi: aqiValue,
            category: categories[Math.min(aqiValue - 1, 5)] || 'Unknown',
            pm2_5: components.pm2_5,
            pm10: components.pm10,
          };
        }
      }
      
      return new Response(JSON.stringify({
        location,
        weather: weatherData,
        airPollution,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else if (type === 'forecast') {
      const forecastResponse = await fetch(
        `${BASE_URL}/forecast?lat=${location.lat}&lon=${location.lon}&units=metric&appid=${API_KEY}`
      );
      
      if (!forecastResponse.ok) {
        if (forecastResponse.status === 429) {
          return new Response(JSON.stringify({ 
            error: createError('Too many requests. Please try again later.', 'RATE_LIMIT', true)
          }), {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        return new Response(JSON.stringify({ 
          error: createError('Failed to fetch forecast data', 'SERVER_ERROR', true)
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const forecastData = await forecastResponse.json();
      
      return new Response(JSON.stringify({
        location,
        forecast: forecastData,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else if (type === 'onecall') {
      // Try One Call API for alerts (requires subscription)
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
      
      // Fallback: use regular forecast
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
      return new Response(JSON.stringify({ 
        error: createError('Invalid request type', 'INVALID_INPUT', false)
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in weather function:', error);
    
    // Check for network/timeout errors
    if (error instanceof TypeError && error.message.includes('network')) {
      return new Response(JSON.stringify({ 
        error: createError('Network error. Please check your connection.', 'NETWORK_ERROR', true)
      }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({ 
      error: createError(
        error instanceof Error ? error.message : 'An unexpected error occurred',
        'UNKNOWN',
        true
      )
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
