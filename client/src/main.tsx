import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.tsx'
import { ChatSocketProvider } from './context/ChatSocketContext.tsx'
import { PremiumProvider } from './contexts/PremiumContext.tsx'
import './utils/forceLogout'
import './config/firebase' // Initialize Firebase Analytics
import { initializeSentry } from './config/sentry.config'

// 🔴 IMPORTANT : Initialiser Sentry EN PREMIER pour capturer toutes les erreurs
initializeSentry()

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PremiumProvider>
          <ChatSocketProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </ChatSocketProvider>
        </PremiumProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)