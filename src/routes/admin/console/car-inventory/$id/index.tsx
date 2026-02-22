import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useMemo } from 'react'

export const Route = createFileRoute(
  '/admin/console/car-inventory/$id/' as '/admin/console/car-inventory/$id/',
)({
  component: RouteComponent,
  errorComponent: ({ error }) => (
    <div className="p-8">
      <p className="text-destructive">Error: {String(error)}</p>
    </div>
  ),
})

function RouteComponent() {
  const params = Route.useParams()
  const navigate = Route.useNavigate()
  const queryClient = useQueryClient()

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

  const bodyTypes = carBodyTypes && Array.isArray(carBodyTypes)
    ? carBodyTypes.map((item: any) => ({
        id: item.car_body_types?.id,
        name: item.car_body_types?.name,
      }))
    : []

  const { data: carFeatures = [] } = useQuery({
    queryKey: ['carFeatures'],
    queryFn: async () => {
      const response = await fetch('/api/cars/features')
      if (!response.ok) {
        throw new Error('Failed to fetch car features')
      }
      const data = await response.json()
      return data.features || []
    },
  })

  const { data: carHistoryChecklist = [] } = useQuery({
    queryKey: ['carHistoryChecklist'],
    queryFn: async () => {
      const response = await fetch('/api/cars/history-checklist')
      if (!response.ok) {
        throw new Error('Failed to fetch history checklist')
      }
      const data = await response.json()
      return data.items || []
    },
  })

  const { data: carData, isLoading } = useQuery({
    queryKey: ['car', params.id],
    queryFn: async () => {
      const response = await fetch(`/api/cars/inventory/${params.id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch car')
      }
      return response.json()
    },
  })

  const featureRows = useMemo(
    () => carFeatures.map((feature: any) => feature.car_feature_types || feature),
    [carFeatures],
  )

  const historyRows = useMemo(
    () => carHistoryChecklist.map((item: any) => item.car_history_checklist || item),
    [carHistoryChecklist],
  )

  const form = useForm({
    defaultValues: {
      sku: carData?.cars?.sku || '',
      year: carData?.cars?.year || 2024,
      price: carData?.cars?.price || '',
      bodyTypeId: carData?.cars?.bodyTypeId || '',
      mileage: carData?.cars?.mileage || 0,
      condition: carData?.cars?.condition || 'Good',
      color: carData?.cars?.color || '',
      transmission: carData?.cars?.transmission || 'Automatic',
      fuelType: carData?.cars?.fuelType || 'Diesel',
      featureIds: (carData as any)?.featureIds || [],
      historyChecklistIds: (carData as any)?.historyChecklistIds || [],
    },
    onSubmit: async ({ value }) => {
      try {
        const response = await fetch(`/api/cars/inventory/${params.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(value),
        })

        if (!response.ok) {
          const error = await response.json()
          toast.error(error.error || 'Failed to update car')
          return
        }

        queryClient.invalidateQueries({ queryKey: ['car', params.id] })
        queryClient.invalidateQueries({ queryKey: ['cars'] })
        toast.success('Car updated successfully')

        navigate({
          to: '/admin/console/car-inventory',
          replace: true,
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update car'
        toast.error(message)
      }
    },
  })

  if (isLoading) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Loading car details...</p>
      </div>
    )
  }

  if (!carData) {
    return (
      <div className="p-8">
        <p className="text-destructive">Failed to load car details</p>
      </div>
    )
  }

  const isSold = carData?.cars?.sold

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
              <BreadcrumbPage>Edit Car</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Edit Car</h1>
          <Link
            to="/admin/console/car-inventory"
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            Back to Inventory
          </Link>
        </div>
      </div>

      {isSold && (
        <div className="p-4 bg-destructive/10 border border-destructive rounded text-destructive">
          This car is marked as sold and cannot be edited.
        </div>
      )}

      <form
        className="space-y-4"
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
                      disabled={isSold}
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
                    disabled={isSold}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </FieldContent>
              </Field>
            )}
          </form.Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
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
                        if (value && !isSold) {
                          field.handleChange(value)
                        }
                      }}
                      disabled={isSold}
                    >
                      <SelectTrigger id={field.name}>
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
                    disabled={isSold}
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
                    disabled={isSold}
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
                      onValueChange={(value) => field.handleChange(value)}
                      disabled={isSold}
                    >
                      <SelectTrigger id={field.name}>
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

          <form.Field name="transmission">
            {(field) => {
              const transmissionOptions = ['Automatic', 'Manual']
              const selectedTransmission = transmissionOptions.includes(field.state.value) ? field.state.value : 'Automatic'
              return (
                <Field>
                  <FieldLabel htmlFor={field.name}>Transmission</FieldLabel>
                  <FieldContent>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) => field.handleChange(value)}
                      disabled={isSold}
                    >
                      <SelectTrigger id={field.name}>
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

          <form.Field name="fuelType">
            {(field) => {
              const fuelOptions = ['Diesel', 'Petrol', 'Hybrid', 'Electric']
              const selectedFuel = fuelOptions.includes(field.state.value) ? field.state.value : 'Diesel'
              return (
                <Field>
                  <FieldLabel htmlFor={field.name}>Fuel Type</FieldLabel>
                  <FieldContent>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) => field.handleChange(value)}
                      disabled={isSold}
                    >
                      <SelectTrigger id={field.name}>
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

          <form.Field name="sku">
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>SKU</FieldLabel>
                <FieldContent>
                  <Input
                    id={field.name}
                    value={carData?.cars?.sku || ''}
                    disabled={true}
                    className="opacity-50"
                  />
                </FieldContent>
              </Field>
            )}
          </form.Field>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Features</h2>
          {featureRows.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Selected</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {featureRows.map((feature: any) => (
                  <TableRow key={feature.id}>
                    <TableCell>{feature.name}</TableCell>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={form.state.values.featureIds.includes(feature.id)}
                        onChange={(event) => {
                          const checked = event.target.checked
                          const next = checked
                            ? [...form.state.values.featureIds, feature.id]
                            : form.state.values.featureIds.filter((id: string) => id !== feature.id)
                          form.setFieldValue('featureIds', next)
                        }}
                        disabled={isSold}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">No features available.</p>
          )}
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold">History Checklist</h2>
          {historyRows.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Selected</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyRows.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={form.state.values.historyChecklistIds.includes(item.id)}
                        onChange={(event) => {
                          const checked = event.target.checked
                          const next = checked
                            ? [...form.state.values.historyChecklistIds, item.id]
                            : form.state.values.historyChecklistIds.filter((id: string) => id !== item.id)
                          form.setFieldValue('historyChecklistIds', next)
                        }}
                        disabled={isSold}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">No checklist items available.</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={form.state.isSubmitting || isSold}
          className="gap-2"
        >
          {form.state.isSubmitting ? (
            <>⏳ Saving...</>
          ) : (
            <>✓ Save Changes</>
          )}
        </Button>
      </form>
    </div>
  )
}
