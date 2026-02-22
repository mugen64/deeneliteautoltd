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
      const response = await fetch('/api/cars')
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

  const form = useForm({
    defaultValues: {
      year: new Date().getFullYear(),
      makeId: '',
      modelId: '',
      price: '',
      bodyType: '',
      mileage: 0,
      condition: '',
      isFeatured: false,
      rating: 0,
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
        className="max-w-2xl space-y-4"
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
                value > 1900 && value <= new Date().getFullYear() + 1
                  ? undefined
                  : { message: 'Invalid year' },
            }}
          >
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Year</FieldLabel>
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

          <form.Field
            name="makeId"
            validators={{
              onChange: ({ value }) =>
                value ? undefined : { message: 'Make is required' },
            }}
          >
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Make</FieldLabel>
                <FieldContent>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => {
                      if (value) {
                        field.handleChange(value)
                        setSelectedMakeId(value)
                      }
                    }}
                  >
                    <SelectTrigger id={field.name}>
                      <SelectValue placeholder="Select a make" />
                    </SelectTrigger>
                    <SelectContent>
                      {makes.map((make: any) => (
                        <SelectItem key={make.id} value={make.id}>
                          {make.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={field.state.meta.errors} />
                </FieldContent>
              </Field>
            )}
          </form.Field>

          <form.Field
            name="modelId"
            validators={{
              onChange: ({ value }) =>
                value ? undefined : { message: 'Model is required' },
            }}
          >
            {(field) => (
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
                    <SelectTrigger id={field.name}>
                      <SelectValue placeholder="Select a model" />
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
            )}
          </form.Field>

          <form.Field
            name="bodyType"
            validators={{
              onChange: ({ value }) =>
                value.trim().length ? undefined : { message: 'Body type is required' },
            }}
          >
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Body Type</FieldLabel>
                <FieldContent>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder="e.g. Sedan"
                  />
                  <FieldError errors={field.state.meta.errors} />
                </FieldContent>
              </Field>
            )}
          </form.Field>

          <form.Field
            name="price"
            validators={{
              onChange: ({ value }) =>
                value && Number(value) > 0 ? undefined : { message: 'Valid price is required' },
            }}
          >
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Price</FieldLabel>
                <FieldContent>
                  <Input
                    id={field.name}
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

          <form.Field
            name="condition"
            validators={{
              onChange: ({ value }) =>
                value.trim().length ? undefined : { message: 'Condition is required' },
            }}
          >
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Condition</FieldLabel>
                <FieldContent>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder="e.g. Good"
                  />
                  <FieldError errors={field.state.meta.errors} />
                </FieldContent>
              </Field>
            )}
          </form.Field>

          <form.Field
            name="rating"
            validators={{
              onChange: ({ value }) =>
                value >= 0 && value <= 5 ? undefined : { message: 'Rating must be between 0 and 5' },
            }}
          >
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Rating</FieldLabel>
                <FieldContent>
                  <Input
                    id={field.name}
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
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

        <form.Field
          name="isFeatured"
        >
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={field.name}
                  checked={field.state.value}
                  onChange={(event) => field.handleChange(event.target.checked)}
                  className="rounded border border-input"
                />
                Featured Car
              </FieldLabel>
            </Field>
          )}
        </form.Field>

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
      </form>
    </div>
  )
}
