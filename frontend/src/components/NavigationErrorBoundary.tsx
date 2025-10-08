import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/button';
import { AlertTriangle, RefreshCw, Navigation } from 'lucide-react';

interface Props {
  children: ReactNode;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class NavigationErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('NavigationErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Navigation className="h-5 w-5 text-destructive flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium text-foreground mb-1">
                Error de navegación
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                Ha ocurrido un error en la navegación. Puedes intentar recargar la página.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left mb-2 p-2 bg-muted rounded text-xs">
                  <summary className="cursor-pointer font-medium mb-1">
                    Detalles del error (desarrollo)
                  </summary>
                  <pre className="whitespace-pre-wrap text-red-600">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
              
              <div className="flex gap-2">
                <Button onClick={this.handleRetry} variant="outline" size="sm">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Reintentar
                </Button>
                <Button onClick={() => window.location.reload()} variant="destructive" size="sm">
                  Recargar
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
