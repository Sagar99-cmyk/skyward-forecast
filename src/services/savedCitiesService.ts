import { SavedCity } from '@/types/weather';

const STORAGE_KEY = 'weathercast_saved_cities';

export const getSavedCities = (): SavedCity[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const saveCity = (city: SavedCity): SavedCity[] => {
  const cities = getSavedCities();
  
  // Check if city already exists
  if (cities.some(c => c.name.toLowerCase() === city.name.toLowerCase() && c.country === city.country)) {
    return cities;
  }
  
  const updated = [...cities, { ...city, id: Date.now().toString() }];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const removeCity = (cityId: string): SavedCity[] => {
  const cities = getSavedCities();
  const updated = cities.filter(c => c.id !== cityId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};
