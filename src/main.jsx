import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import './styles/theme.css'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'

// Wake up ping to prevent Render backend cold starts on the free plan
// Wake up ping to prevent cold starts
fetch('/api/health').catch(console.error);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
        <Analytics />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)
