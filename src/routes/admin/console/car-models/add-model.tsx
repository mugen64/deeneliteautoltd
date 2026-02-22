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
import { createFileRoute, Link } from '@tanstack/react-router'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export const Route = createFileRoute('/admin/console/car-models/add-model')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = Route.useNavigate()
  const queryClient = useQueryClient()

  const { data: carMakes = [] } = useQuery({
    queryKey: ['carMakes'],
    queryFn: async () => {
      const response = await fetch('/api/cars');
      if (!response.ok) {
        throw new Error('Failed to fetch car makes');
      }
      return response.json();
    },
  })

  const makes = carMakes && Array.isArray(carMakes)
    ? carMakes.map((item: any) => ({
        id: item.car_makes?.id,
        name: item.car_makes?.name,
      }))
    : []

  // Helper to get make name from ID
  const getMakeNameById = (makeId: string) => {
    return makes.find((make: any) => make.id === makeId)?.name || ''
  }

  const form = useForm({
    defaultValues: {
      name: '',
      makeId: '',
    },
    onSubmit: async ({ value }) => {
      try {
        const response = await fetch('/api/cars/models/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: value.name.trim(),
            makeId: value.makeId,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          toast.error(error.error || 'Failed to create car model');
          return;
        }

        // Invalidate the carModels query to refetch the data
        queryClient.invalidateQueries({ queryKey: ['carModels'] })
        toast.success('Car model created successfully');

        navigate({
          to: '/admin/console/car-models',
          search: { active: 'models' },
          replace: true,
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create car model';
        toast.error(message);
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
              <BreadcrumbLink
                render={<Link to="/admin/console/car-models" search={{ active: 'models' }} />}
              >
                Car Models
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Add Model</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Add New Model</h1>
          <Link
            to="/admin/console/car-models"
            search={{ active: 'models' }}
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            Back to Models
          </Link>
        </div>
      </div>

      <form
        className="space-y-4 max-w-xl"
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          form.handleSubmit()
        }}
      >
        <form.Field
          name="makeId"
          validators={{
            onChange: ({ value }) =>
              value ? undefined : { message: 'Please select a make' },
          }}
        >
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Make</FieldLabel>
              <FieldContent>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value || '')}
                >
                  <SelectTrigger id={field.name}>
                    <SelectValue placeholder="Select a make">
                      {field.state.value ? getMakeNameById(field.state.value) : 'Select a make'}
                    </SelectValue>
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
          name="name"
          validators={{
            onChange: ({ value }) =>
              value.trim().length ? undefined : { message: 'Model name is required' },
          }}
        >
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Model name</FieldLabel>
              <FieldContent>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="e.g. Camry"
                />
                <FieldError errors={field.state.meta.errors} />
              </FieldContent>
            </Field>
          )}
        </form.Field>

        <div className="flex items-center gap-2">
          <Button 
            type="submit" 
            disabled={form.state.isSubmitting}
            className="gap-2"
          >
            {form.state.isSubmitting ? (
              <>⏳ Creating Model...</>
            ) : (
              <>✓ Create Model</>
            )}
          </Button>
          <Link
            to="/admin/console/car-models"
            search={{ active: 'models' }}
            className={buttonVariants({ variant: 'ghost', size: 'sm' })}
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
