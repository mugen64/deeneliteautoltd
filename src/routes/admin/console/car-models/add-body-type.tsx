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
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { IconUpload } from './components/-icon-upload'

export const Route = createFileRoute('/admin/console/car-models/add-body-type')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = Route.useNavigate()
  const queryClient = useQueryClient()
  const [uploading, setUploading] = useState(false)

  const form = useForm({
    defaultValues: {
      name: '',
      icon: null as null | {
        public_id: string
        secure_url: string
        resource_type: string
      },
    },
    onSubmit: async ({ value }) => {
      try {
        if (!value.icon) {
          toast.error('Please upload an icon');
          return;
        }

        const response = await fetch('/api/cars/body-types/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: value.name.trim(),
            icon: value.icon,
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          toast.error(error.error || 'Failed to create car body type')
          return
        }

        queryClient.invalidateQueries({ queryKey: ['carBodyTypes'] })
        toast.success('Car body type created successfully')

        navigate({
          to: '/admin/console/car-models',
          search: { active: 'body-types' },
          replace: true,
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create car body type'
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
              <BreadcrumbLink
                render={<Link to="/admin/console/car-models" search={{ active: 'body-types' }} />}
              >
                Car Models
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Add Body Type</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Add Body Type</h1>
          <Link
            to="/admin/console/car-models"
            search={{ active: 'body-types' }}
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            Back to Body Types
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
          name="name"
          validators={{
            onChange: ({ value }) =>
              value.trim().length ? undefined : { message: 'Body type name is required' },
          }}
        >
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Body type name</FieldLabel>
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
          name="icon"
          validators={{
            onChange: ({ value }) =>
              value ? undefined : { message: 'Icon is required' },
          }}
        >
          {(field) => (
            <Field>
              <FieldLabel htmlFor="icon">Icon (PNG, max 512 KB)</FieldLabel>
              <FieldContent>
                <IconUpload
                  value={field.state.value}
                  onChange={field.handleChange}
                  folder="body-type-icons"
                  onUploadingChange={setUploading}
                />
                <FieldError errors={field.state.meta.errors} />
              </FieldContent>
            </Field>
          )}
        </form.Field>

        <div className="flex items-center gap-2">
          <Button 
            type="submit" 
            disabled={form.state.isSubmitting || uploading}
            className="gap-2"
          >
            {uploading ? (
              <>⏳ Uploading Icon...</>
            ) : form.state.isSubmitting ? (
              <>⏳ Creating Body Type...</>
            ) : (
              <>✓ Create Body Type</>
            )}
          </Button>
          <Link
            to="/admin/console/car-models"
            search={{ active: 'body-types' }}
            className={buttonVariants({ variant: 'ghost', size: 'sm' })}
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}

