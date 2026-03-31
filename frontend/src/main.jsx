import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.jsx'
import './index.css'

// Import your publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

// If you don't have a publishable key (e.g., just testing UI), fallback or error
if (!PUBLISHABLE_KEY) {
  console.warn("Missing Publishable Key: Setting up a mock clerk provider for UI dev, or add it to .env.local")
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY || "pk_test_placeholder"}>
      <App />
    </ClerkProvider>
  </React.StrictMode>,
)
