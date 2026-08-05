import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught rendering error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F8FAFC',
          padding: '2rem',
          fontFamily: 'Plus Jakarta Sans, sans-serif'
        }}>
          <div style={{
            maxWidth: '520px',
            width: '100%',
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: '2.5rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎁✨</div>
            <h2 style={{ color: '#0F172A', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Something unexpected happened
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.95rem', marginBottom: '1.75rem', lineHeight: 1.5 }}>
              WishNest encountered an unexpected issue while rendering this page. Refreshing the page usually resolves it.
            </p>
            
            <button
              onClick={this.handleReload}
              style={{
                backgroundColor: '#F97316',
                color: '#FFFFFF',
                border: 'none',
                padding: '0.75rem 1.75rem',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(249, 115, 22, 0.25)',
                transition: 'all 0.2s ease',
                marginBottom: '1.5rem'
              }}
            >
              Reload Page
            </button>

            <details style={{
              whiteSpace: 'pre-wrap',
              backgroundColor: '#F1F5F9',
              padding: '1rem',
              borderRadius: '10px',
              marginTop: '1rem',
              textAlign: 'left',
              fontSize: '0.82rem',
              color: '#334155'
            }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600, color: '#475569' }}>
                Technical Details
              </summary>
              <div style={{ marginTop: '0.75rem', fontFamily: 'monospace' }}>
                {this.state.error && this.state.error.toString()}
                <br />
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </div>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
