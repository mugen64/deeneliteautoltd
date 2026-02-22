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
import { useState } from 'react'
import { IconUpload } from '../components/-icon-upload'

export const Route = createFileRoute('/admin/console/car-models/edit-body-type/$bodyTypeId')({
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
  const [uploadingIcon, setUploadingIcon] = useState(false)

  const { data: bodyTypeData, isLoading } = useQuery({
    queryKey: ['carBodyType', params.bodyTypeId],
    queryFn: async () => {
      const response = await fetch(`/api/cars/body-types/${params.bodyTypeId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch car body type')
      }
      return response.json()
    },
  })

  // Extract the body type and icon data from the joined structure
  const bodyTypeInfo = bodyTypeData?.car_body_types
  const iconInfo = bodyTypeData?.files

  // Form for editing name only
  const nameForm = useForm({
    defaultValues: {
      name: bodyTypeInfo?.name || '',
    },
    onSubmit: async ({ value }) => {
      try {
        const response = await fetch('/api/cars/body-types/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: params.bodyTypeId,
            name: value.name.trim(),
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          toast.error(error.error || 'Failed to update car body type name')
          return
        }

        queryClient.invalidateQueries({ queryKey: ['carBodyTypes'] })
        queryClient.invalidateQueries({ queryKey: ['carBodyType', params.bodyTypeId] })
        toast.success('Car body type name updated successfully')
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update car body type name'
        toast.error(message)
      }
    },
  })

  // Form for editing icon only
  const iconForm = useForm({
    defaultValues: {
      icon: iconInfo ? {
        public_id: iconInfo.public_id,
        secure_url: iconInfo.media_url,
        resource_type: iconInfo.resource_type,
      } : null as null | {
        public_id: string
        secure_url: string
        resource_type: string
      },
    },
    onSubmit: async ({ value }) => {
      try {
        if (!value.icon) {
          toast.error('Please upload an icon')
          return
        }

        const response = await fetch('/api/cars/body-types/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: params.bodyTypeId,
            icon: value.icon,
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          toast.error(error.error || 'Failed to update car body type icon')
          return
        }

        queryClient.invalidateQueries({ queryKey: ['carBodyTypes'] })
        queryClient.invalidateQueries({ queryKey: ['carBodyType', params.bodyTypeId] })
        toast.success('Car body type icon updated successfully')
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update car body type icon'
        toast.error(message)
      }
    },
  })

  if (isLoading) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Loading body type details...</p>
      </div>
    )
  }

  if (!bodyTypeData) {
    return (
      <div className="p-8">
        <p className="text-destructive">Failed to load body type details</p>
      </div>
    )
  }

  // Check if each form is busy
  const isNameFormBusy = nameForm.state.isSubmitting
  const isIconFormBusy = iconForm.state.isSubmitting || uploadingIcon

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
              <BreadcrumbPage>Edit Body Type</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Edit Body Type</h1>
          <Link
            to="/admin/console/car-models"
            search={{ active: 'body-types' }}
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            Back to Body Types
          </Link>
        </div>
      </div>

      <div className="w-full space-y-6">
        {/* Name Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle>Body Type Name</CardTitle>
            <CardDescription>Update the name of this body type</CardDescription>
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
                        disabled={isIconFormBusy}
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </FieldContent>
                  </Field>
                )}
              </nameForm.Field>

              <Button 
                type="submit" 
                disabled={isIconFormBusy || nameForm.state.isSubmitting}
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

        {/* Icon Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle>Body Type Icon</CardTitle>
            <CardDescription>Update the icon image for this body type (PNG, max 512 KB)</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="flex flex-col gap-4"
              onSubmit={(event) => {
                event.preventDefault()
                event.stopPropagation()
                iconForm.handleSubmit()
              }}
            >
              <iconForm.Field
                name="icon"
                validators={{
                  onChange: ({ value }) =>
                    value ? undefined : { message: 'Icon is required' },
                }}
              >
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor="icon">Icon</FieldLabel>
                    <FieldContent>
                      <IconUpload
                        value={field.state.value}
                        onChange={field.handleChange}
                        folder="body-type-icons"
                        onUploadingChange={setUploadingIcon}
                        disabled={isNameFormBusy}
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </FieldContent>
                  </Field>
                )}
              </iconForm.Field>

              <Button 
                type="submit" 
                disabled={isNameFormBusy || uploadingIcon || iconForm.state.isSubmitting}
                className="gap-2 ml-auto"
              >
                {uploadingIcon ? (
                  <>⏳ Uploading Icon...</>
                ) : iconForm.state.isSubmitting ? (
                  <>⏳ Saving Icon...</>
                ) : (
                  <>✓ Update Icon</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

