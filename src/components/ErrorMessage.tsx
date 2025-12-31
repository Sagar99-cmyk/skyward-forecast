import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

const ErrorMessage = ({ message, onRetry }: ErrorMessageProps) => {
  return (
    <div className="glass-card p-8 text-center animate-fade-in border-destructive/30">
      <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Oops! Something went wrong
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        {message}
      </p>
      {onRetry && (
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
