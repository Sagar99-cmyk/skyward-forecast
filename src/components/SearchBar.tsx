import { useState, FormEvent } from 'react';
import { Search, MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  onSearch: (city: string) => void;
  isLoading: boolean;
}

const SearchBar = ({ onSearch, isLoading }: SearchBarProps) => {
  const [city, setCity] = useState('');
  const [hasError, setHasError] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = city.trim();
    
    if (!trimmed) {
      setHasError(true);
      return;
    }

    // Basic validation - only letters, spaces, commas, and hyphens
    const validPattern = /^[a-zA-Z\s,'-]+$/;
    if (!validPattern.test(trimmed)) {
      setHasError(true);
      return;
    }

    setHasError(false);
    onSearch(trimmed);
  };

  const handleClear = () => {
    setCity('');
    setHasError(false);
  };

  const handleChange = (value: string) => {
    setCity(value);
    if (hasError && value.trim()) {
      setHasError(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      <div className={`glass-card p-2 flex items-center gap-2 transition-all ${
        hasError ? 'border-destructive ring-2 ring-destructive/30' : ''
      }`}>
        <div className="flex items-center gap-2 flex-1 px-3">
          <MapPin className={`w-5 h-5 ${hasError ? 'text-destructive' : 'text-muted-foreground'}`} />
          <Input
            type="text"
            placeholder="Search city..."
            value={city}
            onChange={(e) => handleChange(e.target.value)}
            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60 text-foreground"
            disabled={isLoading}
            maxLength={100}
          />
          {city && (
            <button
              type="button"
              onClick={handleClear}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <Button 
          type="submit" 
          disabled={isLoading}
          className="rounded-xl px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </Button>
      </div>
      {hasError && (
        <p className="text-destructive text-sm mt-2 text-center animate-fade-in">
          Please enter a valid city name
        </p>
      )}
    </form>
  );
};

export default SearchBar;
