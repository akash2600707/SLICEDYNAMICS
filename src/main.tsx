import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

createRoot(root).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#111118',
          color: '#f0f0f5',
          border: '1px solid #2a2a38',
          fontFamily: 'DM Sans, sans-serif',
        },
        success: { iconTheme: { primary: '#22c55e', secondary: '#111118' } },
        error: { iconTheme: { primary: '#ef4444', secondary: '#111118' } },
      }}
    />
  </StrictMode>
)
