import React from "react";

type Props = { children: React.ReactNode };

export class RouteBoundary extends React.Component<Props, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
     
    console.error("Route error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] grid place-items-center">
          <div className="max-w-md text-center px-6 py-8 rounded-2xl bg-white dark:bg-gray-800 shadow border border-gray-200/70 dark:border-gray-700/70">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Something went wrong</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Try refreshing the page. If the problem persists, contact support.</p>
            <button onClick={() => this.setState({ hasError: false })} className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700">Try again</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

