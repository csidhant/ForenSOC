import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import { lightTheme, darkTheme } from '@theme/theme';
import { useUiStore } from '@utils/store';

// Remove the loading splash once React mounts
const removeSplash = () => {
  const el = document.getElementById('app-loading');
  if (el) {
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.3s ease';
    setTimeout(() => el.remove(), 350);
  }
};

// Error boundary for uncaught errors
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', height: '100vh', background: '#0A0F1E',
          color: '#F1F5F9', fontFamily: 'Inter, sans-serif', padding: 32,
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16, margin: '0 auto 20px',
            background: 'linear-gradient(135deg, #EF4444, #DC2626)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32,
          }}>⚠</div>
          <h2 style={{ margin: '0 0 8px', fontSize: 24 }}>Application Error</h2>
          <p style={{ color: '#94A3B8', margin: '0 0 24px', textAlign: 'center' }}>
            Something went wrong. Please refresh the page.
          </p>
          <pre style={{
            background: '#111827', borderRadius: 8, padding: 16,
            color: '#EF4444', fontSize: 12, maxWidth: 600, overflow: 'auto',
            marginBottom: 24,
          }}>
            {this.state.error?.message}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
              color: '#fff', border: 'none', borderRadius: 8,
              padding: '12px 24px', fontSize: 16, cursor: 'pointer', fontWeight: 600,
            }}
          >
            Reload Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const RootComponent: React.FC = () => {
  const { darkMode } = useUiStore();

  React.useEffect(() => {
    removeSplash();
  }, []);

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <SnackbarProvider
        maxSnack={5}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        autoHideDuration={4000}
      >
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <RootComponent />
    </ErrorBoundary>
  </React.StrictMode>,
);
