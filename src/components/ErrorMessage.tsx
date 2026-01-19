import { AlertCircle, RefreshCw, WifiOff, MapPinOff, Clock, ServerOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WeatherError, WeatherErrorCode } from '@/types/weather';

interface ErrorMessageProps {
  error: WeatherError | string;
  onRetry?: () => void;
}

const getErrorDetails = (error: WeatherError | string): {
  icon: React.ReactNode;
  title: string;
  message: string;
  showRetry: boolean;
} => {
  // Handle string errors (legacy)
  if (typeof error === 'string') {
    return {
      icon: <AlertCircle className="w-12 h-12 text-destructive" />,
      title: 'Something went wrong',
      message: error,
      showRetry: true,
    };
  }

  const code = error.code as WeatherErrorCode;

  switch (code) {
    case 'NETWORK_ERROR':
      return {
        icon: <WifiOff className="w-12 h-12 text-destructive" />,
        title: 'No Internet Connection',
        message: 'Please check your internet connection and try again.',
        showRetry: true,
      };
    case 'CITY_NOT_FOUND':
      return {
        icon: <MapPinOff className="w-12 h-12 text-accent" />,
        title: 'City Not Found',
        message: error.message || 'We couldn\'t find that location. Please check the spelling and try again.',
        showRetry: false,
      };
    case 'RATE_LIMIT':
      return {
        icon: <Clock className="w-12 h-12 text-accent" />,
        title: 'Too Many Requests',
        message: 'You\'ve made too many requests. Please wait a moment and try again.',
        showRetry: true,
      };
    case 'API_KEY_INVALID':
      return {
        icon: <ServerOff className="w-12 h-12 text-destructive" />,
        title: 'Service Unavailable',
        message: 'The weather service is temporarily unavailable. Please try again later.',
        showRetry: false,
      };
    case 'SERVER_ERROR':
      return {
        icon: <ServerOff className="w-12 h-12 text-destructive" />,
        title: 'Server Error',
        message: 'The weather service is experiencing issues. Please try again later.',
        showRetry: true,
      };
    case 'TIMEOUT':
      return {
        icon: <Clock className="w-12 h-12 text-accent" />,
        title: 'Request Timed Out',
        message: 'The request took too long. Please check your connection and try again.',
        showRetry: true,
      };
    case 'LOCATION_DENIED':
      return {
        icon: <MapPinOff className="w-12 h-12 text-accent" />,
        title: 'Location Access Denied',
        message: 'Please enable location access in your browser settings or search for a city manually.',
        showRetry: false,
      };
    default:
      return {
        icon: <AlertCircle className="w-12 h-12 text-destructive" />,
        title: 'Something went wrong',
        message: error.message || 'An unexpected error occurred. Please try again.',
        showRetry: error.retryable !== false,
      };
  }
};

const ErrorMessage = ({ error, onRetry }: ErrorMessageProps) => {
  const { icon, title, message, showRetry } = getErrorDetails(error);

  return (
    <div className="glass-card p-8 text-center animate-fade-in border-destructive/30">
      <div className="mx-auto mb-4 flex justify-center">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        {message}
      </p>
      {showRetry && onRetry && (
        <Button 
          onClick={onRetry}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorMessage;
