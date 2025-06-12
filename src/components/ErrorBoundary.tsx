import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error details to console for debugging
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({
      errorInfo
    });
    
    // You could also log to an error reporting service here
  }

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center">
              <AlertTriangle className="mr-2 h-6 w-6 text-red-500" />
              <h2 className="text-xl font-bold text-gray-900">Something went wrong</h2>
            </div>
            
            <p className="mb-4 text-gray-600">
              We've encountered an unexpected error. You can try reloading the page.
            </p>
            
            <div className="mb-6">
              <button
                onClick={this.handleReload}
                className="flex items-center rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reload Page
              </button>
            </div>
            
            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <div className="border-t border-gray-200 pt-4">
                <h3 className="mb-2 font-semibold text-gray-700">Error Details:</h3>
                <div className="overflow-auto rounded bg-gray-100 p-3 text-xs">
                  <p className="mb-2 font-mono text-red-600">{this.state.error.toString()}</p>
                  {this.state.errorInfo && (
                    <pre className="text-gray-700">{this.state.errorInfo.componentStack}</pre>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 