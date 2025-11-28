import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.tsx'
import { ChatSocketProvider } from './context/ChatSocketContext.tsx'
import './utils/forceLogout'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ChatSocketProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ChatSocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)