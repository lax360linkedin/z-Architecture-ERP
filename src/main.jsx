import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { PermissionProvider } from './context/PermissionContext'
import { AppProvider } from './context/AppContext'
import { ErrorBoundary } from './components/system/ErrorBoundary'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <PermissionProvider>
            <AppProvider>
              <BrowserRouter>
                <App />
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 3200,
                    style: {
                      background: 'rgb(var(--surface-raised))',
                      color: 'rgb(var(--ink))',
                      border: '1px solid rgb(var(--border))',
                      fontSize: '13px',
                      borderRadius: '10px',
                    },
                  }}
                />
              </BrowserRouter>
            </AppProvider>
          </PermissionProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
)
