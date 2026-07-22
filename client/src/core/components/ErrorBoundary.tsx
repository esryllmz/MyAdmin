import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface p-4">
          <div className="max-w-md w-full bg-surface-container-lowest rounded-lg shadow-lg border border-outline-variant/20 p-8">
            {/* Header */}
            <div className="flex justify-center mb-6">
              <div className="bg-error/10 p-4 rounded-full">
                <AlertTriangle className="w-8 h-8 text-error" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-on-surface mb-2 text-center">
              Bir Şeyler Ters Gitti
            </h2>

            {/* Description */}
            <p className="text-on-surface-variant text-center mb-6">
              Uygulamada beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyip tekrar deneyin.
            </p>

            {/* Error Details (Development) */}
            {import.meta.env.DEV && this.state.error && (
              <details className="mb-6 text-xs bg-error/5 p-3 rounded border border-error/10">
                <summary className="cursor-pointer font-semibold text-error mb-2">
                  Hata Detayları
                </summary>
                <pre className="text-error/80 overflow-auto max-h-32 whitespace-pre-wrap wrap-break-word">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg font-semibold hover:brightness-110 transition"
              >
                Tekrar Dene
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 px-4 py-2.5 bg-surface-container border border-outline-variant/20 text-on-surface rounded-lg font-semibold hover:bg-surface-container-high transition"
              >
                Ana Sayfa
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
