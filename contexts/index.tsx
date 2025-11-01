'use client'

import { PrivyProvider } from '@privy-io/react-auth'
import React, { type ReactNode } from 'react'

function ContextProvider({ children }: { children: ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'cm4rnnrgz0bq1zlcfsbvyb9pk'}
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#06b6d4',
          logo: 'https://avatars.githubusercontent.com/u/179229932',
        },
        embeddedWallets: {
          solana: {
            createOnLogin: 'users-without-wallets',
          },
        },
      }}
    >
      {children}
    </PrivyProvider>
  )
}

export default ContextProvider