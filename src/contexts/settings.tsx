import React, { createContext, useContext } from 'react'

export interface BusinessHour {
  days: string
  time: string
}

export interface SiteSettings {
  companyName?: string
  companyDescription?: string
  address?: string
  phoneNumber?: string
  emailAddress?: string
  businessHours?: BusinessHour[]
  facebookUrl?: string
  twitterUrl?: string
  instagramUrl?: string
  linkedinUrl?: string
  siteTitle?: string
  metaDescription?: string
  seoKeywords?: string[]
}

interface SettingsContextType {
  settings: SiteSettings | null
  loading: boolean
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export interface SettingsProviderProps {
  children: React.ReactNode
  initialSettings?: SiteSettings | null
}

export function SettingsProvider({ children, initialSettings = null }: SettingsProviderProps) {
  const [settings, setSettings] = React.useState<SiteSettings | null>(initialSettings)
  const [loading, setLoading] = React.useState(!initialSettings)

  React.useEffect(() => {
    if (initialSettings) return

    const controller = new AbortController()

    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings/', { signal: controller.signal })
        if (response.ok) {
          const data = await response.json()
          setSettings(data)
        }
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          console.error('Failed to fetch settings:', error)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()

    return () => {
      controller.abort()
    }
  }, [initialSettings])

  const contextValue = React.useMemo(
    () => ({ settings, loading }),
    [settings, loading],
  )

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
