import React from 'react';

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || String(error) };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App crashed', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      /* ignore */
    }
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-navy-900 text-white flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white/10 border border-white/15 rounded-3xl p-6 shadow-2xl backdrop-blur">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="mt-3 text-sm text-primary-100 leading-relaxed">
            The app hit a browser-side error. Tap the button below to clear old data and reload.
          </p>

          {this.state.message && (
            <pre className="mt-4 max-h-32 overflow-auto rounded-xl bg-black/30 p-3 text-[11px] leading-snug text-amber-200 whitespace-pre-wrap break-words">
              {this.state.message}
            </pre>
          )}

          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={this.handleReset}
              className="w-full bg-accent-500 text-primary-900 font-bold py-3 rounded-xl hover:bg-accent-400 transition-colors"
            >
              Reset local app data and reload
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full bg-white/10 border border-white/15 text-white font-semibold py-3 rounded-xl hover:bg-white/15 transition-colors"
            >
              Reload only
            </button>
          </div>
        </div>
      </div>
    );
  }
}
