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
import { RecentlySoldCars } from '@/components/RecentlySoldCars'

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
    <div className="min-h-screen py-16 md:py-20">
      <div className="container mx-auto px-6 md:px-8 max-w-300">
        {/* Header */}
        <div className="mb-14 text-center">
          <h1 className="text-4xl font-bold mb-3">Get In Touch</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Have questions about our vehicles? We're here to help. Fill out the form or reach out using the contact information below.</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader className="border-b px-5">
                <CardTitle className="text-2xl">Send us a Message</CardTitle>
                <p className="text-sm text-muted-foreground mt-2">We typically respond within 24 hours</p>
              </CardHeader>
              <CardContent className="p-5">
                <form onSubmit={handleSubmit} className="space-y-7">
                  {/* Name Fields */}
                  <fieldset className="space-y-3">
                    <legend className="text-sm font-semibold text-foreground">Your Details</legend>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-sm font-medium">First Name <span className="text-primary">*</span></Label>
                        <Input
                          id="firstName"
                          placeholder="John"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-sm font-medium">Last Name <span className="text-primary">*</span></Label>
                        <Input
                          id="lastName"
                          placeholder="Doe"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </fieldset>

                  {/* Email & Phone */}
                  <fieldset className="space-y-3">
                    <legend className="text-sm font-semibold text-foreground">Contact Information</legend>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">Email <span className="text-primary">*</span></Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                        <p className="text-xs text-muted-foreground">We'll use this to send you updates</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium">Phone Number <span className="text-muted-foreground text-xs">(optional)</span></Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+256 993523948"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                    </div>
                  </fieldset>

                  {/* Subject */}
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-sm font-medium">Subject <span className="text-primary">*</span></Label>
                    <Input
                      id="subject"
                      placeholder="e.g., Interested in 2023 Toyota Camry"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm font-medium">Message <span className="text-primary">*</span></Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us more about what you're looking for, your budget, or any questions you have..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={6}
                      required
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground">Minimum 10 characters required</p>
                  </div>

                  {/* Vehicle Interest */}
                  <div className="space-y-4 pt-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={interestedInVehicles}
                        onChange={(e) => setInterestedInVehicles(e.target.checked)}
                        className="w-4 h-4 accent-primary"
                      />
                      <span className="text-sm font-medium">I'm interested in specific vehicles</span>
                    </label>

                    {interestedInVehicles && (
                      <div className="space-y-3 p-5 border border-border rounded-lg bg-muted/20 animate-in slide-in-from-top-2">
                        <Label htmlFor="carSearch" className="text-sm font-medium">Which vehicles interest you?</Label>
                        <p className="text-xs text-muted-foreground mb-2">Start typing to search our inventory</p>

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
                            <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-xl z-10 max-h-72 overflow-y-auto">
                              <div className="py-2">
                                {filteredCars.slice(0, 8).map((car) => (
                                  <button
                                    key={car.id}
                                    type="button"
                                    onClick={() => handleAddCar(car.id)}
                                    className="w-full text-left px-4 py-3 hover:bg-muted transition-colors border-b border-border last:border-b-0 focus:outline-none focus:bg-muted"
                                  >
                                    <div className="font-semibold text-foreground text-sm">
                                      {car.year} {car.make.name} {car.model.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-0.5">SKU: {car.sku}</div>
                                  </button>
                                ))}
                                {filteredCars.length > 8 && (
                                  <div className="px-4 py-2 text-xs text-muted-foreground bg-muted/30 text-center">
                                    +{filteredCars.length - 8} more results
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Selected Cars */}
                        {selectedCars.length > 0 && (
                          <div className="space-y-3 mt-4 pt-4 border-t border-border">
                            <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-primary-foreground bg-primary rounded-full">
                                {selectedCars.length}
                              </span>
                              Selected vehicles
                            </p>
                            <div className="space-y-2">
                              {selectedCars.map((carId) => {
                                const car = cars.find(c => c.id === carId)
                                if (!car) return null
                                return (
                                  <div
                                    key={carId}
                                    className="flex items-center justify-between bg-card border border-border p-3 rounded-md text-sm hover:shadow-sm transition-shadow"
                                  >
                                    <span className="font-medium text-foreground">
                                      {car.year} {car.make.name} {car.model.name}
                                      <span className="text-xs text-muted-foreground ml-2">({car.sku})</span>
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveCar(carId)}
                                      className="text-muted-foreground hover:text-primary transition-colors p-1 hover:bg-muted rounded"
                                      title="Remove vehicle"
                                    >
                                      <X className="size-5" />
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
                  <Button
                    type="submit"
                    disabled={submitting || !firstName || !lastName || !email || !subject || !message}
                    className="w-full h-12 text-base font-semibold"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                        Sending...
                      </span>
                    ) : (
                      'Send Message'
                    )}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">We'll respond within 24 business hours</p>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Info Section */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Information Card */}
            <Card className="shadow-lg sticky top-8">
              <CardHeader className="border-b p-5">
                <CardTitle className="text-lg">Contact Us Directly</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Available 24/7</p>
              </CardHeader>
              <CardContent className="space-y-6  p-5">
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
            <Card className="shadow-lg">
              <CardHeader className="border-b p-5">
                <CardTitle className="text-lg">Business Hours</CardTitle>
              </CardHeader>
              <CardContent className="p-5">
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
            <Card className="shadow-lg">
              <CardHeader className="border-b">
                <CardTitle className="text-lg">Visit Our Showroom</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">See vehicles in person</p>
              </CardHeader>
              <CardContent className="pt-6">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${(settings?.companyName || 'Deen Elite Auto Ltd') + ' ' + address}`.replace(/\s+/g, '+')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-full"
                >
                  <Button className="w-full">
                    <MapPin className="size-4 mr-2" />
                    Get Directions
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <RecentlySoldCars />
      </div>
    </div>
  )
}
