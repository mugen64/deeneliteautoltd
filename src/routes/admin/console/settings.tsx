import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Building2, MapPin, Globe, Search, Plus, Trash2 } from 'lucide-react'

export const Route = createFileRoute('/admin/console/settings')({
  component: RouteComponent,
})

interface BusinessHour {
  days: string
  time: string
}

function RouteComponent() {
  const [loading, setLoading] = useState(true)
  const [savingCompany, setSavingCompany] = useState(false)
  const [savingLocation, setSavingLocation] = useState(false)
  const [savingSocial, setSavingSocial] = useState(false)
  const [savingSeo, setSavingSeo] = useState(false)

  // Company Information
  const [companyName, setCompanyName] = useState('')
  const [companyDescription, setCompanyDescription] = useState('')

  // Location & Contact
  const [address, setAddress] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [emailAddress, setEmailAddress] = useState('')
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([
    { days: 'Monday - Friday', time: '8:00 AM - 6:00 PM' },
  ])

  // Social Media
  const [facebookUrl, setFacebookUrl] = useState('')
  const [twitterUrl, setTwitterUrl] = useState('')
  const [instagramUrl, setInstagramUrl] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')

  // SEO
  const [siteTitle, setSiteTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [seoKeywords, setSeoKeywords] = useState<string[]>([])
  const [newKeyword, setNewKeyword] = useState('')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings/')
      const data = await response.json()

      // Populate form fields
      setCompanyName(data.companyName || '')
      setCompanyDescription(data.companyDescription || '')
      setAddress(data.address || '')
      setPhoneNumber(data.phoneNumber || '')
      setEmailAddress(data.emailAddress || '')
      
      if (Array.isArray(data.businessHours)) {
        setBusinessHours(data.businessHours)
      } else {
        setBusinessHours([{ days: 'Monday - Friday', time: '8:00 AM - 6:00 PM' }])
      }

      setFacebookUrl(data.facebookUrl || '')
      setTwitterUrl(data.twitterUrl || '')
      setInstagramUrl(data.instagramUrl || '')
      setLinkedinUrl(data.linkedinUrl || '')

      setSiteTitle(data.siteTitle || '')
      setMetaDescription(data.metaDescription || '')
      
      if (Array.isArray(data.seoKeywords)) {
        setSeoKeywords(data.seoKeywords)
      } else {
        setSeoKeywords([])
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveCompany = async () => {
    setSavingCompany(true)
    try {
      const response = await fetch('/api/settings/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          companyDescription,
        }),
      })

      if (response.ok) {
        await fetchSettings()
      }
    } catch (error) {
      console.error('Failed to save company information:', error)
    } finally {
      setSavingCompany(false)
    }
  }

  const handleSaveLocation = async () => {
    setSavingLocation(true)
    try {
      const response = await fetch('/api/settings/location-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          phoneNumber,
          emailAddress,
          businessHours,
        }),
      })

      if (response.ok) {
        await fetchSettings()
      }
    } catch (error) {
      console.error('Failed to save location and contact information:', error)
    } finally {
      setSavingLocation(false)
    }
  }

  const handleSaveSocial = async () => {
    setSavingSocial(true)
    try {
      const response = await fetch('/api/settings/social-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facebookUrl,
          twitterUrl,
          instagramUrl,
          linkedinUrl,
        }),
      })

      if (response.ok) {
        await fetchSettings()
      }
    } catch (error) {
      console.error('Failed to save social media links:', error)
    } finally {
      setSavingSocial(false)
    }
  }

  const handleSaveSeo = async () => {
    setSavingSeo(true)
    try {
      const response = await fetch('/api/settings/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteTitle,
          metaDescription,
          seoKeywords,
        }),
      })

      if (response.ok) {
        await fetchSettings()
      }
    } catch (error) {
      console.error('Failed to save SEO settings:', error)
    } finally {
      setSavingSeo(false)
    }
  }

  const addBusinessHour = () => {
    setBusinessHours([...businessHours, { days: '', time: '' }])
  }

  const removeBusinessHour = (index: number) => {
    setBusinessHours(businessHours.filter((_, i) => i !== index))
  }

  const updateBusinessHour = (index: number, field: 'days' | 'time', value: string) => {
    const updated = [...businessHours]
    updated[index][field] = value
    setBusinessHours(updated)
  }

  const addKeyword = () => {
    if (newKeyword.trim() && !seoKeywords.includes(newKeyword.trim())) {
      setSeoKeywords([...seoKeywords, newKeyword.trim()])
      setNewKeyword('')
    }
  }

  const removeKeyword = (index: number) => {
    setSeoKeywords(seoKeywords.filter((_, i) => i !== index))
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-sm text-muted-foreground">Loading settings...</div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-sm text-gray-600">Configure your dealership settings and preferences.</p>
      </div>

      <Tabs defaultValue="site">
        <TabsList>
          <TabsTrigger value="site">
            <Building2 className="size-4" />
            Site Settings
          </TabsTrigger>
          <TabsTrigger value="system">
            <Globe className="size-4" />
            System Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="site" className="space-y-6 mt-6">
          {/* Site Configuration */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-1">Site Configuration</h2>
              <p className="text-sm text-gray-600">Manage your website settings, contact information, and business details.</p>
            </div>

            {/* Company Information */}
            <Card>
              <CardHeader className="border-b pb-4">
                <div className="flex items-start gap-3">
                  <Building2 className="size-5 mt-0.5 text-muted-foreground" />
                  <div>
                    <CardTitle>Company Information</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 pt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Deen Elite Auto Ltd"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyDescription">Company Description</Label>
                  <Textarea
                    id="companyDescription"
                    value={companyDescription}
                    onChange={(e) => setCompanyDescription(e.target.value)}
                    placeholder="Your trusted partner in finding quality pre-owned vehicles in Uganda."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={handleSaveCompany}
                    disabled={savingCompany}
                    size="lg"
                  >
                    {savingCompany ? 'Saving...' : 'Save Company Info'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Location & Contact Information */}
            <Card>
              <CardHeader className="border-b pb-4">
                <div className="flex items-start gap-3">
                  <MapPin className="size-5 mt-0.5 text-muted-foreground" />
                  <div>
                    <CardTitle>Location & Contact Information</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 pt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Kampala, Uganda&#10;[Specific address to be provided]"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+256 756329248"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emailAddress">Email Address</Label>
                    <Input
                      id="emailAddress"
                      type="email"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      placeholder="sales@deeneliteauto.com"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Business Hours</Label>
                    <Button
                      onClick={addBusinessHour}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="size-3.5" />
                      Add Hours
                    </Button>
                  </div>

                  {businessHours.map((hour, index) => (
                    <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Days</Label>
                        <Input
                          value={hour.days}
                          onChange={(e) => updateBusinessHour(index, 'days', e.target.value)}
                          placeholder="Monday - Friday"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Time</Label>
                        <Input
                          value={hour.time}
                          onChange={(e) => updateBusinessHour(index, 'time', e.target.value)}
                          placeholder="8:00 AM - 6:00 PM"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          onClick={() => removeBusinessHour(index)}
                          variant="ghost"
                          size="icon"
                          disabled={businessHours.length === 1}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={handleSaveLocation}
                    disabled={savingLocation}
                    size="lg"
                  >
                    {savingLocation ? 'Saving...' : 'Save Location & Contact'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Social Media */}
          <Card>
            <CardHeader className="border-b pb-4">
              <div className="flex items-start gap-3">
                <Globe className="size-5 mt-0.5 text-muted-foreground" />
                <div>
                  <CardTitle>Social Media</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-4 pt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="facebookUrl">Facebook URL</Label>
                  <Input
                    id="facebookUrl"
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                    placeholder="https://facebook.com/deeneliteauto"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitterUrl">Twitter URL</Label>
                  <Input
                    id="twitterUrl"
                    value={twitterUrl}
                    onChange={(e) => setTwitterUrl(e.target.value)}
                    placeholder="https://twitter.com/deeneliteauto"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagramUrl">Instagram URL</Label>
                  <Input
                    id="instagramUrl"
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    placeholder="https://instagram.com/deeneliteauto"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                  <Input
                    id="linkedinUrl"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/company/deeneliteauto"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleSaveSocial}
                  disabled={savingSocial}
                  size="lg"
                >
                  {savingSocial ? 'Saving...' : 'Save Social Media'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* SEO Settings */}
          <Card>
            <CardHeader className="border-b pb-4">
              <div className="flex items-start gap-3">
                <Search className="size-5 mt-0.5 text-muted-foreground" />
                <div>
                  <CardTitle>SEO Settings</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-4 pt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteTitle">Site Title</Label>
                <Input
                  id="siteTitle"
                  value={siteTitle}
                  onChange={(e) => setSiteTitle(e.target.value)}
                  placeholder="Deen Elite Auto Ltd - Quality Pre-owned Vehicles in Uganda"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Find your perfect car at Deen Elite Auto Ltd. Quality pre-owned vehicles in Kampala, Uganda with trusted service and competitive prices."
                  rows={3}
                />
                <div className="text-xs text-muted-foreground text-right">
                  {metaDescription.length}/160 characters
                </div>
              </div>

              <div className="space-y-3">
                <Label>SEO Keywords</Label>
                <div className="flex gap-2">
                  <Input
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                    placeholder="Enter keyword"
                    className="flex-1"
                  />
                  <Button onClick={addKeyword} variant="outline" size="lg">
                    <Plus className="size-3.5" />
                    Add Keyword
                  </Button>
                </div>

                {seoKeywords.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {seoKeywords.map((keyword, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-md text-xs"
                      >
                        <span>{keyword}</span>
                        <button
                          onClick={() => removeKeyword(index)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleSaveSeo}
                  disabled={savingSeo}
                  size="lg"
                >
                  {savingSeo ? 'Saving...' : 'Save SEO Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="mt-6">
          <Card>
            <CardContent className="px-4 pt-4">
              <div className="text-center py-12 text-muted-foreground">
                System settings coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
