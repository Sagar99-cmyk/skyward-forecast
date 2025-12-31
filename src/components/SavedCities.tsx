import { SavedCity } from '@/types/weather';
import { Star, X, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SavedCitiesProps {
  cities: SavedCity[];
  currentCity: string;
  onSelectCity: (city: string) => void;
  onRemoveCity: (cityId: string) => void;
  onSaveCurrentCity: () => void;
  canSaveCurrent: boolean;
}

const SavedCities = ({ 
  cities, 
  currentCity, 
  onSelectCity, 
  onRemoveCity, 
  onSaveCurrentCity,
  canSaveCurrent 
}: SavedCitiesProps) => {
  if (cities.length === 0 && !canSaveCurrent) return null;

  return (
    <div className="glass-card p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-medium text-foreground">Saved Cities</h3>
        </div>
        {canSaveCurrent && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSaveCurrentCity}
            className="text-xs text-primary hover:text-primary/80"
          >
            <Star className="w-3 h-3 mr-1" />
            Save Current
          </Button>
        )}
      </div>

      {cities.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {cities.map(city => (
            <div
              key={city.id}
              className={`
                flex items-center gap-1 px-3 py-1.5 rounded-full text-sm
                transition-all cursor-pointer
                ${city.name === currentCity 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
                }
              `}
            >
              <MapPin className="w-3 h-3" />
              <span onClick={() => onSelectCity(city.name)}>{city.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveCity(city.id);
                }}
                className="ml-1 hover:text-destructive transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          No saved cities yet. Save your current city to quickly access it later.
        </p>
      )}
    </div>
  );
};

export default SavedCities;
