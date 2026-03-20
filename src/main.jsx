import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import { SidebarProvider } from './store/sidebarStore'
import { initI18n } from './i18n'
import './index.css'

initI18n()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <SidebarProvider>
          <App />
        </SidebarProvider>
      </ToastProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
