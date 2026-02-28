import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ImageCropUpload } from '@/routes/admin/console/car-models/components/-image-crop-upload'
import { Loader2, Trash2, ArrowLeft } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

type CarPhotoJoin = {
  car_photos: {
    id: string
    description: string | null
    isPrimary: boolean
  }
  files: {
    media_url: string
  }
}

type CarResponse = {
  cars: {
    id: string
    year: number
    color: string
  }
  car_models: {
    name: string
  }
  car_makes: {
    name: string
  }
}

export const Route = createFileRoute('/admin/console/car-inventory/$id/images')({
  component: CarImagesComponent,
})

function CarImagesComponent() {
  const { id } = Route.useParams()
  const navigate = Route.useNavigate()
  const queryClient = useQueryClient()
  const [pendingUpload, setPendingUpload] = useState<{
    public_id: string
    secure_url: string
    resource_type: string
  } | null>(null)
  const [description, setDescription] = useState('')

  const { data: carData, isLoading: isLoadingCar } = useQuery({
    queryKey: ['car', id],
    queryFn: async (): Promise<CarResponse> => {
      const response = await fetch(`/api/cars/inventory/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch car')
      }
      return response.json()
    },
  })

  const { data: photosData = [] } = useQuery({
    queryKey: ['car-photos', id],
    queryFn: async (): Promise<CarPhotoJoin[]> => {
      const response = await fetch(`/api/cars/inventory/${id}/photos`)
      if (!response.ok) {
        throw new Error('Failed to fetch car photos')
      }
      const data = await response.json()
      return data.photos || []
    },
  })

  const deletePhotoMutation = useMutation({
    mutationFn: async (photoId: string) => {
      const response = await fetch(`/api/cars/inventory/photos/${photoId}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to delete image')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['car-photos', id] })
      queryClient.invalidateQueries({ queryKey: ['car', id] })
      toast.success('Image deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete image')
    },
  })

  const createPhotoMutation = useMutation({
    mutationFn: async (payload: {
      public_id: string
      secure_url: string
      resource_type: string
      description: string
    }) => {
      const response = await fetch(`/api/cars/inventory/${id}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to save image')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['car-photos', id] })
      queryClient.invalidateQueries({ queryKey: ['car', id] })
      toast.success('Image saved successfully')
      setPendingUpload(null)
      setDescription('')
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to save image')
    },
  })

  const setPrimaryMutation = useMutation({
    mutationFn: async (photoId: string) => {
      const response = await fetch(`/api/cars/inventory/photos/${photoId}/primary`, {
        method: 'PATCH',
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to set primary image')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['car-photos', id] })
      queryClient.invalidateQueries({ queryKey: ['cars'] })
      toast.success('Primary image updated')
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to set primary image')
    },
  })

  const handleUploadChange = (value: {
    public_id: string
    secure_url: string
    resource_type: string
  } | null) => {
    setPendingUpload(value)
    if (!value) {
      return
    }

    if (!description.trim()) {
      toast.error('Description is required before uploading.')
      return
    }

    createPhotoMutation.mutate({
      public_id: value.public_id,
      secure_url: value.secure_url,
      resource_type: value.resource_type,
      description: description.trim(),
    })
  }

  const uploadDisabled = useMemo(
    () =>
      createPhotoMutation.isPending ||
      deletePhotoMutation.isPending ||
      setPrimaryMutation.isPending,
    [
      createPhotoMutation.isPending,
      deletePhotoMutation.isPending,
      setPrimaryMutation.isPending,
    ],
  )

  if (isLoadingCar) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="size-8 animate-spin" />
      </div>
    )
  }

  if (!carData) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <p className="text-lg font-semibold">Car not found</p>
          <Button onClick={() => navigate({ to: '/admin/console/car-inventory', search: { tab: 'inventory' } })} className="mt-4">
            Back to Inventory
          </Button>
        </div>
      </div>
    )
  }

  const car = carData.cars
  const carModels = carData.car_models
  const carMakes = carData.car_makes
  const photos = photosData
  const hasImages = photos.length > 0

  return (
    <div className="container py-8 px-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate({ to: '/admin/console/car-inventory', search: { tab: 'inventory' } })}>
          <ArrowLeft className="size-4 mr-2" />
          Back to Inventory
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {car.year} {carMakes.name} {carModels.name} - {car.color}
        </h1>
        <p className="text-muted-foreground">Manage images for this vehicle</p>
      </div>

      <div className="bg-card border rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Upload New Image</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <label className="text-sm font-medium" htmlFor="photo-description">
              Description
            </label>
            <Input
              id="photo-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Required description"
              disabled={uploadDisabled}
            />
          </div>
        </div>
        <div className="mt-4">
          <ImageCropUpload
            value={pendingUpload}
            onChange={handleUploadChange}
            folder="deenelite/cars"
            disabled={uploadDisabled || !description.trim()}
            outputWidth={1200}
            outputHeight={800}
          />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Current Images</h2>

        {!hasImages && (
          <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
            <p className="text-yellow-800 dark:text-yellow-200 font-medium">
              No images uploaded yet. Upload at least one image to list or feature this vehicle.
            </p>
          </div>
        )}

        {hasImages && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Preview</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Primary</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {photos.map((photo) => (
                <TableRow key={photo.car_photos.id}>
                  <TableCell>
                    <img
                      src={photo.files.media_url}
                      alt="Car photo"
                      className="h-16 w-24 rounded-md border object-cover"
                    />
                  </TableCell>
                  <TableCell className="max-w-xs whitespace-normal">
                    {photo.car_photos.description || '—'}
                  </TableCell>
                  <TableCell>
                    {photo.car_photos.isPrimary ? 'Yes' : 'No'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPrimaryMutation.mutate(photo.car_photos.id)}
                        disabled={photo.car_photos.isPrimary || uploadDisabled}
                      >
                        {photo.car_photos.isPrimary ? 'Primary' : 'Make Primary'}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger
                          render={
                            <Button variant="destructive" size="sm">
                              <Trash2 className="size-4 mr-2" />
                              Delete
                            </Button>
                          }
                        />
                        <AlertDialogContent>
                          <AlertDialogTitle>Delete Image</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this image? This action cannot be undone.
                          </AlertDialogDescription>
                          <div className="flex gap-4 justify-end">
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deletePhotoMutation.mutate(photo.car_photos.id)}
                              disabled={deletePhotoMutation.isPending}
                            >
                              {deletePhotoMutation.isPending && <Loader2 className="size-4 mr-2 animate-spin" />}
                              Delete
                            </AlertDialogAction>
                          </div>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
