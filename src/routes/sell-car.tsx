import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Car, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RecentlySoldCars } from '@/components/RecentlySoldCars'
import { toast } from 'sonner'

export const Route = createFileRoute('/sell-car')({
  component: SellCarPage,
  head: () => ({
    meta: [
      {
        title: 'Sell Your Car - Get Best Quote | Deen Elite Auto Ltd',
      },
      {
        name: 'description',
        content: 'Sell your car easily at Deen Elite Auto Ltd. Get an instant quote, transparent pricing, and hassle-free service. Contact us today to sell your vehicle.',
      },
      {
        name: 'keywords',
        content: 'sell car, car valuation, sell vehicle, car quote, used car buyer',
      },
      {
        property: 'og:title',
        content: 'Sell Your Car - Get Best Quote | Deen Elite Auto Ltd',
      },
      {
        property: 'og:description',
        content: 'Sell your car easily at Deen Elite Auto Ltd. Get an instant quote and hassle-free service. Contact us today.',
      },
      {
        property: 'og:url',
        content: 'https://deeneliteauto.com/sell-car',
      },
      {
        name: 'twitter:title',
        content: 'Sell Your Car - Get Best Quote | Deen Elite Auto Ltd',
      },
      {
        name: 'twitter:description',
        content: 'Sell your car easily and get the best quote. Transparent pricing and hassle-free service.',
      },
    ],
  }),
})

function SellCarPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [carMake, setCarMake] = useState('')
  const [carModel, setCarModel] = useState('')
  const [carYear, setCarYear] = useState('')
  const [mileage, setMileage] = useState('')
  const [condition, setCondition] = useState('')
  const [priceExpectation, setPriceExpectation] = useState('')
  const [additionalInfo, setAdditionalInfo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from(
    { length: currentYear - 1940 + 1 },
    (_, index) => (currentYear - index).toString()
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Build the message with car details
      const message = `Car Details:
Make: ${carMake}
Model: ${carModel}
Year: ${carYear}
Mileage: ${mileage}
Condition: ${condition}
Price Expectation: ${priceExpectation}

Additional Information:
${additionalInfo}`

      const response = await fetch('/api/contact-forms/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'sell-car',
          firstName,
          lastName,
          email,
          phone,
          subject: `Sell Car: ${carYear} ${carMake} ${carModel}`,
          message,
          interestedInVehicles: false,
          selectedCars: [],
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result?.error || 'Failed to submit request')
      }

      toast.success('Your request has been submitted successfully. We will contact you soon.')

      // Reset form
      setFirstName('')
      setLastName('')
      setEmail('')
      setPhone('')
      setCarMake('')
      setCarModel('')
      setCarYear('')
      setMileage('')
      setCondition('')
      setPriceExpectation('')
      setAdditionalInfo('')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit form'
      toast.error(message)
      console.error('Failed to submit form:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-linear-to-br from-primary/5 to-primary/10 py-16 md:py-20">
        <div className="container mx-auto px-6 md:px-8 max-w-300">
          <div className="text-center mb-8">
            <Car className="size-16 mx-auto mb-4 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Sell Your Car</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get the best price for your vehicle. We make selling your car fast, easy, and hassle-free.
            </p>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardContent className="pt-6 text-center">
                <CheckCircle2 className="size-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Fair Pricing</h3>
                <p className="text-sm text-muted-foreground">We offer competitive market prices for your vehicle</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <CheckCircle2 className="size-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Quick Process</h3>
                <p className="text-sm text-muted-foreground">Fast evaluation and payment within 24-48 hours</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <CheckCircle2 className="size-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">No Hassle</h3>
                <p className="text-sm text-muted-foreground">We handle all paperwork and documentation</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="py-16 md:py-20">
        <div className="container mx-auto px-6 md:px-8 max-w-4xl">
          <Card className="shadow-lg">
            <CardHeader className="border-b">
              <CardTitle className="text-2xl">Tell Us About Your Car</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">Fill in the details below and we'll get back to you with an offer</p>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">
                        First Name <span className="text-primary">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">
                        Last Name <span className="text-primary">*</span>
                      </Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">
                        Email <span className="text-primary">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">
                        Phone Number <span className="text-primary">*</span>
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Car Details */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Car Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="carMake">
                        Make <span className="text-primary">*</span>
                      </Label>
                      <Input
                        id="carMake"
                        placeholder="e.g., Toyota"
                        value={carMake}
                        onChange={(e) => setCarMake(e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="carModel">
                        Model <span className="text-primary">*</span>
                      </Label>
                      <Input
                        id="carModel"
                        placeholder="e.g., Camry"
                        value={carModel}
                        onChange={(e) => setCarModel(e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="carYear">
                        Year <span className="text-primary">*</span>
                      </Label>
                      <Select value={carYear} onValueChange={setCarYear} required>
                        <SelectTrigger id="carYear" className="mt-1 w-full">
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          {yearOptions.map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="mileage">
                        Mileage <span className="text-primary">*</span>
                      </Label>
                      <Input
                        id="mileage"
                        placeholder="e.g., 45000 km"
                        value={mileage}
                        onChange={(e) => setMileage(e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="condition">
                        Condition <span className="text-primary">*</span>
                      </Label>
                      <Input
                        id="condition"
                        placeholder="e.g., Excellent, Good, Fair"
                        value={condition}
                        onChange={(e) => setCondition(e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="priceExpectation">
                        Expected Price <span className="text-primary">*</span>
                      </Label>
                      <Input
                        id="priceExpectation"
                        placeholder="e.g., $25000"
                        value={priceExpectation}
                        onChange={(e) => setPriceExpectation(e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <Label htmlFor="additionalInfo">
                    Additional Information
                  </Label>
                  <Textarea
                    id="additionalInfo"
                    placeholder="Tell us more about your car (modifications, service history, features, etc.)"
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    rows={5}
                    className="mt-1"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recently Sold Cars */}
      <RecentlySoldCars />
    </div>
  )
}
