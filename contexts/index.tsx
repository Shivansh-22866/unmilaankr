'use client'

import { solanaWeb3JsAdapter, projectId, networks } from '@/config'
import { createAppKit } from '@reown/appkit/react'
import React, { type ReactNode } from 'react'

// Set up metadata
const metadata = {
  name: 'Signiq: Momentum Forecasting • Signal Intelligence • Federated Foresight',
  description: 'Signiq is a AI-powered analytics engine that monitors project activity across multiple channels.',
  url: 'https://signiq.xyz', // origin must match your domain & subdomain
  icons: ['https://res.cloudinary.com/dp7bhqc9x/image/upload/v1762074148/m7mrm6vrrwmod8ut8u4a.jpg']
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