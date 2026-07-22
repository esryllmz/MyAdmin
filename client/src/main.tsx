import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AppProvider } from './providers/AppProvider'
import { ErrorBoundary } from './core/components/ErrorBoundary'
import '@fontsource-variable/geist/index.css'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppProvider>
        <App />
      </AppProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
