import '../styles/globals.css'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { useState } from 'react'
import Layout from '../components/Layout'

function MyApp({ Component, pageProps }) {
  const [supabaseClient] = useState(() => createClientComponentClient())

  return (
    <SessionContextProvider 
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SessionContextProvider>
  )
}

export default MyApp