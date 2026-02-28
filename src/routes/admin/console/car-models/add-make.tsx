import { useState } from 'react'
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
import { ImageCropUpload } from './components/-image-crop-upload'

export const Route = createFileRoute('/admin/console/car-models/add-make')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = Route.useNavigate()
  const queryClient = useQueryClient()
  const [uploading, setUploading] = useState(false)

  const form = useForm({
    defaultValues: {
      name: '',
      logo: null as null | {
        public_id: string
        secure_url: string
        resource_type: string
      },
    },
    onSubmit: async ({ value }) => {
      try {
        if (!value.logo) {
          toast.error('Please upload a logo');
          return;
        }

        const response = await fetch('/api/cars/car-makes/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: value.name.trim(),
            logo: value.logo,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          toast.error(error.error || 'Failed to create car make');
          return;
        }

        // Invalidate the carMakes query to refetch the data
        queryClient.invalidateQueries({ queryKey: ['carMakes'] })
        toast.success('Car make created successfully');

        navigate({
          to: '/admin/console/car-models',
          search: { active: 'makes' },
          replace: true,
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create car make';
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
                render={<Link to="/admin/console/car-models" search={{ active: 'makes' }} />}
              >
                Car Models
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Add Make</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center justify-between">
          <div></div>
          <Link
            to="/admin/console/car-models"
            search={{ active: 'makes' }}
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            Back to Makes
          </Link>
        </div>
      </div>

      <form
        className="space-y-4 max-w-xl mx-auto"
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          form.handleSubmit()
        }}
      >
        <h1 className="text-3xl font-bold text-center">Add Make</h1>
        <form.Field
          name="name"
          validators={{
            onChange: ({ value }) =>
              value.trim().length ? undefined : { message: 'Make name is required' },
          }}
        >
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Make name</FieldLabel>
              <FieldContent>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="e.g. Toyota"
                />
                <FieldError errors={field.state.meta.errors} />
              </FieldContent>
            </Field>
          )}
        </form.Field>

        <form.Field
          name="logo"
          validators={{
            onChange: ({ value }) =>
              value ? undefined : { message: 'Logo image is required' },
          }}
        >
          {(field) => (
            <Field>
              <FieldLabel htmlFor="logo">Logo</FieldLabel>
              <FieldContent>
                <ImageCropUpload
                  value={field.state.value}
                  onChange={field.handleChange}
                  folder="car-makes"
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
              <>⏳ Uploading Image...</>
            ) : form.state.isSubmitting ? (
              <>⏳ Saving Make...</>
            ) : (
              <>✓ Save Make</>
            )}
          </Button>
          <Link
            to="/admin/console/car-models"
            search={{ active: 'makes' }}
            className={buttonVariants({ variant: 'ghost', size: 'sm' })}
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
