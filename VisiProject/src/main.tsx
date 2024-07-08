import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import {GoogleOAuthProvider} from "@react-oauth/google";
import { QueryClient, QueryClientProvider } from 'react-query';
const queryClient = new QueryClient();
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID as string}>
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
      </GoogleOAuthProvider>
  </React.StrictMode>,
)
