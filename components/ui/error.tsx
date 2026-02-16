import { AlertCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface ErrorDisplayProps {
  error: Error | string;
  title?: string;
  onRetry?: () => void;
  variant?: 'error' | 'warning' | 'info';
}

export function ErrorDisplay({ error, title, onRetry, variant = 'error' }: ErrorDisplayProps) {
  const message = typeof error === 'string' ? error : error.message;
  
  const icons = {
    error: XCircle,
    warning: AlertTriangle,
    info: Info
  };

  const Icon = icons[variant];

  return (
    <Alert variant={variant === 'error' ? 'destructive' : 'default'} className="my-4">
      <Icon className="h-4 w-4" />
      <AlertTitle>{title || 'Something went wrong'}</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>{message}</span>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Try Again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}

export function ErrorBoundaryFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Oops! Something went wrong</h1>
          <p className="text-muted-foreground mb-4">
            We encountered an unexpected error. Please try refreshing the page.
          </p>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Details</AlertTitle>
          <AlertDescription className="font-mono text-xs mt-2">
            {error.message}
          </AlertDescription>
        </Alert>

        <div className="flex gap-2">
          <Button onClick={resetError} className="flex-1">
            Try Again
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/'} className="flex-1">
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action 
}: { 
  icon: any; 
  title: string; 
  description: string; 
  action?: { label: string; onClick: () => void } 
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon className="w-12 h-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4 max-w-sm">{description}</p>
      {action && (
        <Button onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  );
}
