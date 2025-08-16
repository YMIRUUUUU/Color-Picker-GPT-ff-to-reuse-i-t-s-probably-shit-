import React from 'react';

export default class ErrorBoundary extends React.Component<any, { hasError: boolean; error: unknown }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown, info: any) {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 16 }}>
          <h2 style={{ color: '#B00020', fontWeight: 600 }}>Une erreur est survenue</h2>
          <pre style={{ whiteSpace: 'pre-wrap', marginTop: 8 }}>{String(this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children as any;
  }
}