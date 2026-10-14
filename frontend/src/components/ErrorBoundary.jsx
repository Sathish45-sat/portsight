import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Component error logging without leaking sensitive tokens
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface text-ink flex flex-col items-center justify-center p-6">
          <div className="max-w-md w-full border border-rule bg-surface p-8 rounded-sm shadow-sm text-center space-y-4">
            <h1 className="text-xl font-semibold tracking-tight text-ink">
              Something went wrong
            </h1>
            <p className="text-sm text-muted">
              An unexpected error occurred while rendering this view. Your data is safe.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="bg-accent text-surface text-sm font-medium px-4 py-2 rounded-sm hover:opacity-95 transition-opacity cursor-pointer focus-visible:ring-1 focus-visible:ring-accent"
              >
                Reload application
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
