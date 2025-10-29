'use client'

import { solanaWeb3JsAdapter, projectId, networks } from '@/config'
import { createAppKit } from '@reown/appkit/react'
import React, { type ReactNode } from 'react'

// Set up metadata
const metadata = {
  name: 'Signiq - Momentum Forecasting • Signal Intelligence • Federated Foresight',
  description: 'Signiq is an AI-powered analytics engine that monitors project activity across multiple channels.',
  url: 'http://localhost:3000', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

// Create the modal
export const modal = createAppKit({
  adapters: [solanaWeb3JsAdapter],
  projectId,
  networks,
  metadata,
  themeMode: 'light',
  features: {
    analytics: true // Optional - defaults to your Cloud configuration
  },
  themeVariables: {
    '--w3m-accent': '#000000',
  }
})

function ContextProvider({ children }: { children: ReactNode }) {
  return (
    <>{children}</>
  )
}

export default ContextProvider