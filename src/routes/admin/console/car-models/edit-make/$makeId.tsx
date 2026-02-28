import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
import { buttonVariants, Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { ImageCropUpload } from '../components/-image-crop-upload'

export const Route = createFileRoute('/admin/console/car-models/edit-make/$makeId')({
  component: RouteComponent,
  errorComponent: ({ error }) => (
    <div className="p-8">
      <p className="text-destructive">Error: {String(error)}</p>
    </div>
  ),
})

function RouteComponent() {
  const params = Route.useParams()
  const queryClient = useQueryClient()
  const [uploadingImage, setUploadingImage] = useState(false)

  const { data: carMakeData, isLoading } = useQuery({
    queryKey: ['carMake', params.makeId],
    queryFn: async () => {
      const response = await fetch(`/api/cars/car-makes/${params.makeId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch car make');
      }
      return response.json();
    },
  })

  // Extract the make data from the joined structure
  const makeInfo = carMakeData?.car_makes
  const fileInfo = carMakeData?.files

  // Form for editing name only
  const nameForm = useForm({
    defaultValues: {
      name: makeInfo?.name || '',
    },
    onSubmit: async ({ value }) => {
      try {
        const response = await fetch('/api/cars/car-makes/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: params.makeId,
            name: value.name.trim(),
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          toast.error(error.error || 'Failed to update car make name');
          return;
        }

        // Invalidate the carMakes query to refetch the data
        queryClient.invalidateQueries({ queryKey: ['carMakes'] })
        queryClient.invalidateQueries({ queryKey: ['carMake', params.makeId] })
        toast.success('Car make name updated successfully');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update car make name';
        toast.error(message);
      }
    },
  })

  // Form for editing logo only
  const logoForm = useForm({
    defaultValues: {
      logo: fileInfo ? {
        public_id: fileInfo.public_id,
        secure_url: fileInfo.media_url,
        resource_type: fileInfo.resource_type,
      } : null as null | {
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

        const response = await fetch('/api/cars/car-makes/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: params.makeId,
            logo: value.logo,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          toast.error(error.error || 'Failed to update car make logo');
          return;
        }

        // Invalidate the carMakes query to refetch the data
        queryClient.invalidateQueries({ queryKey: ['carMakes'] })
        queryClient.invalidateQueries({ queryKey: ['carMake', params.makeId] })
        toast.success('Car make logo updated successfully');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update car make logo';
        toast.error(message);
      }
    },
  })

  if (isLoading) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Loading make details...</p>
      </div>
    )
  }

  if (!carMakeData) {
    return (
      <div className="p-8">
        <p className="text-destructive">Failed to load make details</p>
      </div>
    )
  }

  // Check if each form is busy
  const isNameFormBusy = nameForm.state.isSubmitting
  const isLogoFormBusy = logoForm.state.isSubmitting || uploadingImage

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
              <BreadcrumbPage>Edit Make</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Edit Make</h1>
          <Link
            to="/admin/console/car-models"
            search={{ active: 'makes' }}
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            Back to Makes
          </Link>
        </div>
      </div>

      <div className="w-full space-y-6">
        {/* Name Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle>Make Name</CardTitle>
            <CardDescription>Update the name of this car make</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="flex flex-col gap-4"
              onSubmit={(event) => {
                event.preventDefault()
                event.stopPropagation()
                nameForm.handleSubmit()
              }}
            >
              <nameForm.Field
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
                        disabled={isLogoFormBusy}
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </FieldContent>
                  </Field>
                )}
              </nameForm.Field>

              <Button 
                type="submit" 
                disabled={isLogoFormBusy || nameForm.state.isSubmitting}
                className="gap-2 ml-auto"
              >
                {nameForm.state.isSubmitting ? (
                  <>⏳ Saving Name...</>
                ) : (
                  <>✓ Update Name</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Logo Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle>Make Logo</CardTitle>
            <CardDescription>Update the logo image for this car make</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="flex flex-col gap-4"
              onSubmit={(event) => {
                event.preventDefault()
                event.stopPropagation()
                logoForm.handleSubmit()
              }}
            >
              <logoForm.Field
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
                        onUploadingChange={setUploadingImage}
                        disabled={isNameFormBusy}
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </FieldContent>
                  </Field>
                )}
              </logoForm.Field>

              <Button 
                type="submit" 
                disabled={isNameFormBusy || uploadingImage || logoForm.state.isSubmitting}
                className="gap-2 ml-auto"
              >
                {uploadingImage ? (
                  <>⏳ Uploading Image...</>
                ) : logoForm.state.isSubmitting ? (
                  <>⏳ Saving Logo...</>
                ) : (
                  <>✓ Update Logo</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
