import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Phone, Mail, MapPin, Clock, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSettings } from '@/contexts/settings'

export const Route = createFileRoute('/submit-enquiry')({
  component: SubmitEnquiryPage,
})

interface CarListing {
  id: string
  sku: string
  year: number
  make: { name: string }
  model: { name: string }
}

interface CarListingsResponse {
  data: CarListing[]
}

function SubmitEnquiryPage() {
  const { settings } = useSettings()
  
  // Form state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [interestedInVehicles, setInterestedInVehicles] = useState(false)
  const [selectedCars, setSelectedCars] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Fetch cars
  const { data: carsData } = useQuery<CarListingsResponse>({
    queryKey: ['availableCars'],
    queryFn: async () => {
      const response = await fetch('/api/cars/public/listings?page=1&pageSize=100')
      if (!response.ok) throw new Error('Failed to fetch cars')
      return response.json()
    },
  })

  const cars = carsData?.data || []

  // Filter cars based on search input
  const filteredCars = cars.filter(car =>
    `${car.year} ${car.make.name} ${car.model.name}`.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !selectedCars.includes(car.id)
  )

  const handleAddCar = (carId: string) => {
    if (!selectedCars.includes(carId)) {
      setSelectedCars([...selectedCars, carId])
    }
    setSearchQuery('')
    setShowSuggestions(false)
  }

  const handleRemoveCar = (carId: string) => {
    setSelectedCars(selectedCars.filter(id => id !== carId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      // TODO: Submit form to API endpoint
      console.log({
        firstName,
        lastName,
        email,
        phone,
        subject,
        message,
        interestedInVehicles,
        selectedCars,
      })
      // Reset form on success
      setFirstName('')
      setLastName('')
      setEmail('')
      setPhone('')
      setSubject('')
      setMessage('')
      setInterestedInVehicles(false)
      setSelectedCars([])
    } catch (error) {
      console.error('Failed to submit form:', error)
    } finally {
      setSubmitting(false)
    }
  }

  // Contact info from settings
  const phoneNumber = settings?.phoneNumber || '+256 993523948'
  const emailAddress = settings?.emailAddress || 'sales@deeneliteauto.com'
  const address = settings?.address || 'Kampala, Uganda'
  const businessHours = settings?.businessHours || [
    { days: 'Monday - Friday', time: '8:00 AM - 6:00 PM' },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
        <p className="text-muted-foreground">Get in touch with Deen Elite Auto Ltd for all your automotive needs</p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Fill out the form below and we'll get back to you as soon as possible.</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      placeholder="Enter your first name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      placeholder="Enter your last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    placeholder="What can we help you with?"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us more about your inquiry..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    required
                  />
                </div>

                {/* Vehicle Interest */}
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={interestedInVehicles}
                      onChange={(e) => setInterestedInVehicles(e.target.checked)}
                      className="w-4 h-4 rounded border-border bg-input"
                    />
                    <span className="text-sm font-medium">I'm interested in specific vehicles (optional)</span>
                  </label>

                  {interestedInVehicles && (
                    <div className="space-y-3 p-4 border border-border rounded-lg bg-card">
                      <Label htmlFor="carSearch">Select vehicles you're interested in:</Label>
                      
                      <div className="relative">
                        <Input
                          id="carSearch"
                          placeholder="Search cars by year, make, or model..."
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value)
                            setShowSuggestions(true)
                          }}
                          onFocus={() => setShowSuggestions(true)}
                        />
                        
                        {/* Suggestions Dropdown */}
                        {showSuggestions && searchQuery && filteredCars.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                            {filteredCars.map((car) => (
                              <button
                                key={car.id}
                                type="button"
                                onClick={() => handleAddCar(car.id)}
                                className="w-full text-left px-4 py-2 hover:bg-muted transition-colors text-sm"
                              >
                                <div className="font-medium">
                                  {car.year} {car.make.name} {car.model.name}
                                </div>
                                <div className="text-xs text-muted-foreground">SKU: {car.sku}</div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Selected Cars */}
                      {selectedCars.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">Selected vehicles:</p>
                          <div className="space-y-2">
                            {selectedCars.map((carId) => {
                              const car = cars.find(c => c.id === carId)
                              if (!car) return null
                              return (
                                <div
                                  key={carId}
                                  className="flex items-center justify-between bg-muted p-2 rounded text-sm"
                                >
                                  <span>
                                    {car.year} {car.make.name} {car.model.name}
                                    <span className="text-xs text-muted-foreground ml-2">({car.sku})</span>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveCar(carId)}
                                    className="text-destructive hover:text-destructive/80"
                                  >
                                    <X className="size-4" />
                                  </button>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Contact Info Section */}
        <div className="lg:col-span-1 space-y-4">
          {/* Contact Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Reach out to us through any of these channels</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Phone */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Phone className="size-5 text-muted-foreground" />
                  <span className="font-semibold text-sm">Phone</span>
                </div>
                <a href={`tel:${phoneNumber.replace(/[\s\-()]/g, '')}`} className="text-sm text-primary hover:underline">
                  {phoneNumber}
                </a>
              </div>

              {/* Email */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Mail className="size-5 text-muted-foreground" />
                  <span className="font-semibold text-sm">Email</span>
                </div>
                <a href={`mailto:${emailAddress}`} className="text-sm text-primary hover:underline">
                  {emailAddress}
                </a>
              </div>

              {/* Address */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="size-5 text-muted-foreground" />
                  <span className="font-semibold text-sm">Address</span>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{address}</p>
              </div>
            </CardContent>
          </Card>

          {/* Business Hours Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Business Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {businessHours.map((hour, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Clock className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium">{hour.days}</p>
                      <p className="text-muted-foreground">{hour.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Visit Showroom Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Visit Our Showroom</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Come see our vehicles in person and speak with our knowledgeable staff</p>
            </CardHeader>
            <CardContent>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${(settings?.companyName || 'Deen Elite Auto Ltd') + ' ' + address}`.replace(/\s+/g, '+')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full"
              >
                <Button variant="default" className="w-full">
                  <MapPin className="size-4 mr-2" />
                  Get Directions
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
