import { TemperatureUnit } from '@/types/weather';
import { Button } from '@/components/ui/button';

interface TemperatureToggleProps {
  unit: TemperatureUnit;
  onChange: (unit: TemperatureUnit) => void;
}

const TemperatureToggle = ({ unit, onChange }: TemperatureToggleProps) => {
  return (
    <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-lg">
      <Button
        variant={unit === 'celsius' ? 'default' : 'ghost'}
        size="sm"
        className="h-7 px-3 text-sm font-medium"
        onClick={() => onChange('celsius')}
      >
        °C
      </Button>
      <Button
        variant={unit === 'fahrenheit' ? 'default' : 'ghost'}
        size="sm"
        className="h-7 px-3 text-sm font-medium"
        onClick={() => onChange('fahrenheit')}
      >
        °F
      </Button>
    </div>
  );
};

export default TemperatureToggle;
