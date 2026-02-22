import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { buttonVariants, Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

export const Route = createFileRoute('/admin/console/car-inventory/add')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = Route.useNavigate()
  const queryClient = useQueryClient()
  const [selectedMakeId, setSelectedMakeId] = useState('')

  const { data: carMakes = [] } = useQuery({
    queryKey: ['carMakes'],
    queryFn: async () => {
      const response = await fetch('/api/cars/car-makes')
      if (!response.ok) {
        throw new Error('Failed to fetch car makes')
      }
      return response.json()
    },
  })

  const { data: carModels = [] } = useQuery({
    queryKey: ['carModels'],
    queryFn: async () => {
      const response = await fetch('/api/cars/models')
      if (!response.ok) {
        throw new Error('Failed to fetch car models')
      }
      return response.json()
    },
  })

  const { data: carBodyTypes = [] } = useQuery({
    queryKey: ['carBodyTypes'],
    queryFn: async () => {
      const response = await fetch('/api/cars/body-types')
      if (!response.ok) {
        throw new Error('Failed to fetch body types')
      }
      return response.json()
    },
  })

  const makes = carMakes && Array.isArray(carMakes)
    ? carMakes.map((item: any) => ({
        id: item.car_makes?.id,
        name: item.car_makes?.name,
      }))
    : []

  const models = carModels && Array.isArray(carModels)
    ? carModels
        .filter((item: any) => !selectedMakeId || item.car_makes?.id === selectedMakeId)
        .map((item: any) => ({
          id: item.car_models?.id,
          name: item.car_models?.name,
        }))
    : []

  const bodyTypes = carBodyTypes && Array.isArray(carBodyTypes)
    ? carBodyTypes.map((item: any) => ({
        id: item.car_body_types?.id,
        name: item.car_body_types?.name,
      }))
    : []

  const form = useForm({
    defaultValues: {
      year: new Date().getFullYear(),
      modelId: '',
      price: '',
      bodyTypeId: '',
      mileage: 0,
      condition: 'Good',
      color: '',
      transmission: 'Automatic',
      fuelType: 'Diesel',
    },
    onSubmit: async ({ value }) => {
      try {
        const response = await fetch('/api/cars/inventory/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(value),
        })

        if (!response.ok) {
          const error = await response.json()
          toast.error(error.error || 'Failed to create car')
          return
        }

        queryClient.invalidateQueries({ queryKey: ['cars'] })
        toast.success('Car created successfully')

        navigate({
          to: '/admin/console/car-inventory',
          replace: true,
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create car'
        toast.error(message)
      }
    },
  })

  return (
    <div className="p-8 space-y-6">
      <div className="space-y-3">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link to="/admin/console" />}>
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link to="/admin/console/car-inventory" />}>
                Car Inventory
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Add Car</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Add New Car</h1>
          <Link
            to="/admin/console/car-inventory"
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            Back to Inventory
          </Link>
        </div>
      </div>

      <form
        className="space-y-4 p-4 border rounded"
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          form.handleSubmit()
        }}
      >
        <div className="grid grid-cols-2 gap-4">
          <form.Field
            name="year"
            validators={{
              onChange: ({ value }) =>
                value ? undefined : { message: 'Year is required' },
            }}
          >
            {(field) => {
              const currentYear = new Date().getFullYear()
              const years = Array.from({ length: currentYear - 1959 }, (_, i) => currentYear - i)
              return (
                <Field>
                  <FieldLabel htmlFor={field.name}>Year</FieldLabel>
                  <FieldContent>
                    <Select
                      value={String(field.state.value)}
                      onValueChange={(value) => field.handleChange(Number(value))}
                    >
                      <SelectTrigger id={field.name}>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={String(year)}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError errors={field.state.meta.errors} />
                  </FieldContent>
                </Field>
              )
            }}
          </form.Field>

          <form.Field
            name="color"
            validators={{
              onChange: ({ value }) =>
                value.trim().length ? undefined : { message: 'Color is required' },
            }}
          >
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Color</FieldLabel>
                <FieldContent>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder="e.g. Red"
                  />
                  <FieldError errors={field.state.meta.errors} />
                </FieldContent>
              </Field>
            )}
          </form.Field>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <form.Field
            name="bodyTypeId"
            validators={{
              onChange: ({ value }) =>
                value ? undefined : { message: 'Body type is required' },
            }}
          >
            {(field) => {
              const selectedBodyType = bodyTypes.find(b => b.id === field.state.value)
              return (
              <Field>
                <FieldLabel htmlFor={field.name}>Body Type</FieldLabel>
                <FieldContent>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => {
                      if (value) {
                        field.handleChange(value)
                      }
                    }}
                  >
                    <SelectTrigger id={field.name} className="w-full">
                      <SelectValue placeholder="Select a body type">
                        {selectedBodyType?.name || 'Select a body type'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {bodyTypes.map((bodyType: any) => (
                        <SelectItem key={bodyType.id} value={bodyType.id}>
                          {bodyType.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={field.state.meta.errors} />
                </FieldContent>
              </Field>
            )
            }}
          </form.Field>

          <Field className="w-full">
            <FieldLabel>Make</FieldLabel>
            <FieldContent>
              <Select
                value={selectedMakeId}
                onValueChange={(value) => {
                  if (value) {
                    setSelectedMakeId(value)
                  }
                }}
                
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a make" >
                    {makes.find(m => m.id === selectedMakeId)?.name || 'Select a make'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent >
                  {makes.map((make: any) => (
                    <SelectItem key={make.id} value={make.id}>
                      {make.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldContent>
          </Field>

          <form.Field
            name="modelId"
            validators={{
              onChange: ({ value }) =>
                value ? undefined : { message: 'Model is required' },
            }}
          >
            {(field) => {
              const selectedModel = models.find(m => m.id === field.state.value)
              return (
              <Field>
                <FieldLabel htmlFor={field.name}>Model</FieldLabel>
                <FieldContent>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => {
                      if (value) {
                        field.handleChange(value)
                      }
                    }}
                    disabled={!selectedMakeId}
                  >
                    <SelectTrigger id={field.name} className="w-full">
                      <SelectValue placeholder="Select a model">
                        {selectedModel?.name || 'Select a model'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {models.map((model: any) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={field.state.meta.errors} />
                </FieldContent>
              </Field>
            )
            }}
          </form.Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <form.Field
            name="price"
            validators={{
              onChange: ({ value }) =>
                value && Number(value) >= 5000000 ? undefined : { message: 'Price must be at least 5,000,000 UGX' },
            }}
          >
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Price (UGX)</FieldLabel>
                <FieldContent>
                  <Input
                    id={field.name}
                    type="number"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder="e.g. 125000000"
                  />
                  <FieldError errors={field.state.meta.errors} />
                </FieldContent>
              </Field>
            )}
          </form.Field>

          <form.Field
            name="mileage"
            validators={{
              onChange: ({ value }) =>
                value >= 0 ? undefined : { message: 'Mileage must be positive' },
            }}
          >
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Mileage (miles)</FieldLabel>
                <FieldContent>
                  <Input
                    id={field.name}
                    type="number"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(Number(event.target.value))}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </FieldContent>
              </Field>
            )}
          </form.Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <form.Field
            name="condition"
            validators={{
              onChange: ({ value }) =>
                value ? undefined : { message: 'Condition is required' },
            }}
          >
            {(field) => {
              const conditionOptions = ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor']
              return (
              <Field>
                <FieldLabel htmlFor={field.name}>Condition</FieldLabel>
                <FieldContent>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => { if (value) field.handleChange(value) }}
                  >
                    <SelectTrigger id={field.name} className="w-full">
                      <SelectValue placeholder="Select condition">
                        {field.state.value}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {conditionOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={field.state.meta.errors} />
                </FieldContent>
              </Field>
            )
            }}
          </form.Field>

          <form.Field
            name="transmission"
          >
            {(field) => {
              const transmissionOptions = ['Automatic', 'Manual']
              const selectedTransmission = transmissionOptions.includes(field.state.value) ? field.state.value : 'Automatic'
              return (
              <Field>
                <FieldLabel htmlFor={field.name}>Transmission</FieldLabel>
                <FieldContent>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => { if (value) field.handleChange(value) }}
                  >
                    <SelectTrigger id={field.name} className="w-full">
                      <SelectValue placeholder="Select transmission">
                        {selectedTransmission}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {transmissionOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldContent>
              </Field>
            )
            }}
          </form.Field>

          <form.Field
            name="fuelType"
          >
            {(field) => {
              const fuelOptions = ['Diesel', 'Petrol', 'Hybrid', 'Electric']
              const selectedFuel = fuelOptions.includes(field.state.value) ? field.state.value : 'Diesel'
              return (
              <Field>
                <FieldLabel htmlFor={field.name}>Fuel Type</FieldLabel>
                <FieldContent>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => { if (value) field.handleChange(value) }}
                  >
                    <SelectTrigger id={field.name} className="w-full">
                      <SelectValue placeholder="Select fuel type">
                        {selectedFuel}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {fuelOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldContent>
              </Field>
            )
            }}
          </form.Field>
        </div>



        <div className="flex items-center justify-end">
          <Button
            type="submit"
            disabled={form.state.isSubmitting}
            className="gap-2"
          >
            {form.state.isSubmitting ? (
              <>⏳ Creating...</>
            ) : (
              <>✓ Create Car</>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
