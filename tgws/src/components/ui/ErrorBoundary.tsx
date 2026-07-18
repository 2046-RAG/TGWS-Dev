'use client';

import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  locale?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// Function component wrapper so we can use the next-intl hook inside the
// class-component error boundary's fallback UI.
function ErrorFallback({ locale, onReset }: { locale: string; onReset: () => void }) {
  const t = useTranslations('common.error');
  return (
    <section className="min-h-[calc(100vh-73px)] flex items-center justify-center px-5">
      <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-12 text-center max-w-lg w-full shadow-sm">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={32} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          {t('title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          {t('description')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onReset}
            className="px-6 py-3 bg-[#00D4FF] text-white font-medium rounded-full hover:bg-[#00B8DB] hover:shadow-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF] focus-visible:ring-offset-2 flex items-center justify-center gap-2"
          >
            <RefreshCw size={16} />
            {t('tryAgain')}
          </button>
          <Link
            href={`/${locale}/home`}
            className="px-6 py-3 border border-gray-200 dark:border-zinc-600 text-gray-700 dark:text-gray-200 font-medium rounded-full hover:bg-gray-50 dark:hover:bg-zinc-700 hover:border-gray-300 dark:hover:border-zinc-500 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF] focus-visible:ring-offset-2 flex items-center justify-center gap-2"
          >
            <Home size={16} />
            {t('backToHome')}
          </Link>
        </div>
      </div>
    </section>
  );
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const locale = this.props.locale || 'en';

      return <ErrorFallback locale={locale} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}
