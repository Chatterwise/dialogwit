import { PropsWithChildren, useEffect, useState } from 'react'
import { PostHogProvider } from 'posthog-js/react'
import posthog from 'posthog-js'
import { getConsent, onConsentChange } from '../lib/consent'
import { initGA } from '../third-party/ga'

export function AnalyticsProvider({ children }: PropsWithChildren) {
  const [loaded, setLoaded] = useState<boolean>(false)

  useEffect(() => {
    const consent = getConsent()
    if (consent === 'accepted') {
      const key = import.meta.env.VITE_PUBLIC_POSTHOG_KEY as string | undefined
      if (key && !posthog.__loaded) {
        posthog.init(key, {
          api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
          capture_exceptions: true,
          debug: import.meta.env.MODE === 'development',
          autocapture: true,
        })
      }
      initGA()
      setLoaded(true)
    }

    const off = onConsentChange((state) => {
      if (state === 'accepted') {
        if (!posthog.__loaded) {
          const key = import.meta.env.VITE_PUBLIC_POSTHOG_KEY as string | undefined
          if (key) {
            posthog.init(key, {
              api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
              capture_exceptions: true,
              debug: import.meta.env.MODE === 'development',
              autocapture: true,
            })
          }
        }
        initGA()
        setLoaded(true)
      }
    })

    return () => {
      off()
    }
  }, [])

  if (!loaded) return <>{children}</>
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}


