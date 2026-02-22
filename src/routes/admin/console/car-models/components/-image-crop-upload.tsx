import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { FieldDescription } from '@/components/ui/field'
import { toast } from 'sonner'
import { generateFileUploadSignature } from '@/server/files'
import { useServerFn } from '@tanstack/react-start'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'

interface ImageCropUploadProps {
  value: {
    public_id: string
    secure_url: string
    resource_type: string
  } | null
  onChange: (value: {
    public_id: string
    secure_url: string
    resource_type: string
  } | null) => void
  folder?: string
  disabled?: boolean
  outputSize?: number
  outputWidth?: number
  outputHeight?: number
  aspectRatio?: number
  onUploadingChange?: (uploading: boolean) => void
}

// Helper function to create cropped image
const createCroppedImage = async (
  imageSrc: string,
  pixelCrop: Area,
  width: number = 200,
  height: number = 200,
): Promise<Blob> => {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = imageSrc
  })

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('No 2d context')
  }

  canvas.width = width
  canvas.height = height

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    width,
    height
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas is empty'))
        return
      }
      resolve(blob)
    }, 'image/png')
  })
}

export function ImageCropUpload({
  value,
  onChange,
  folder = 'uploads',
  disabled = false,
  outputSize = 200,
  outputWidth,
  outputHeight,
  aspectRatio,
  onUploadingChange,
}: ImageCropUploadProps) {
  const getUploadSignature = useServerFn(generateFileUploadSignature)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Crop states
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  const onCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels)
    },
    []
  )

  const handleFileSelect = (file: File | null) => {
    if (!file) {
      setImageSrc(null)
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setImageSrc(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleCropConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) {
      return
    }

    const width = outputWidth ?? outputSize
    const height = outputHeight ?? outputSize

    setUploading(true)
    onUploadingChange?.(true)
    setUploadError(null)

    try {
      // Create cropped blob
      const croppedBlob = await createCroppedImage(
        imageSrc,
        croppedAreaPixels,
        width,
        height,
      )

      // Upload to Cloudinary
      const signatureData = await getUploadSignature({ data: { folder } })
      if (!signatureData?.cloud_name || !signatureData?.api_key) {
        throw new Error('Missing Cloudinary configuration')
      }

      const formData = new FormData()
      formData.append('file', croppedBlob, 'logo.png')
      formData.append('api_key', signatureData.api_key)
      formData.append('timestamp', String(signatureData.timestamp))
      formData.append('signature', signatureData.signature)
      if (signatureData.folder) {
        formData.append('folder', signatureData.folder)
      }

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${signatureData.cloud_name}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      )

      if (!response.ok) {
        throw new Error('Failed to upload image')
      }

      const payload = await response.json()
      onChange({
        public_id: payload.public_id,
        secure_url: payload.secure_url,
        resource_type: payload.resource_type,
      })

      // Clear crop UI
      setImageSrc(null)
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      toast.success('Image uploaded successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      setUploadError(message);
      toast.error(message);
      onChange(null)
    } finally {
      setUploading(false)
      onUploadingChange?.(false)
    }
  }

  const handleCancel = () => {
    setImageSrc(null)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setUploadError(null)
  }

  const handleChangeImage = () => {
    onChange(null)
    setImageSrc(null)
  }

  // Show file input if no image is selected and no value
  if (!imageSrc && !value) {
    return (
      <div className="space-y-3">
        <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 hover:border-muted-foreground/50 transition-colors">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="text-3xl text-muted-foreground/40">📁</div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-foreground">Click to upload an image</p>
              <p className="text-xs text-muted-foreground">PNG, JPG, or GIF (Max 5MB)</p>
            </div>
            <Input
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null
                handleFileSelect(file)
              }}
              disabled={disabled || uploading}
              className="cursor-pointer"
            />
          </div>
        </div>
        <FieldDescription className="text-center">
          You'll be able to crop and zoom the image to a perfect square
        </FieldDescription>
      </div>
    )
  }

  // Show crop UI if image is selected but not uploaded yet
  if (imageSrc && !value) {
    return (
      <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-4 space-y-4">
        <Card className="border-muted overflow-hidden">
          <CardContent className="p-0 bg-muted/20">
            <div className="relative h-96 w-full border-b border-muted">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={
                  aspectRatio ??
                  (outputWidth && outputHeight
                    ? outputWidth / outputHeight
                    : 1)
                }
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
          </CardContent>
        </Card>
        <div className="space-y-3 bg-muted/40 rounded-lg p-4 border border-muted">
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold">Zoom & Position</label>
              <div className="text-sm font-medium text-primary">
                {zoom.toFixed(1)}×
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setZoom((prev) => Math.max(0.5, prev - 0.1))}
                disabled={zoom <= 0.5 || uploading || disabled}
                title="Zoom out"
              >
                −
              </Button>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 h-2 bg-muted-foreground/20 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setZoom((prev) => Math.min(3, prev + 0.1))}
                disabled={zoom >= 3 || uploading || disabled}
                title="Zoom in"
              >
                +
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCrop({ x: 0, y: 0 })}
                disabled={uploading || disabled}
                title="Center image"
                className="px-3"
              >
                ◉
              </Button>
            </div>
          </div>
        </div>
        {uploadError && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-sm text-destructive">
            ⚠️ {uploadError}
          </div>
        )}
        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            onClick={handleCropConfirm}
            disabled={uploading || disabled}
            className="flex-1"
          >
            {uploading ? '⏳ Uploading...' : '✓ Crop & Upload'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={uploading || disabled}
          >
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  // Show preview if image has been uploaded
  if (value?.secure_url) {
    return (
      <div className="flex-col gap-4">
        <div className="border border-muted rounded-lg p-3 inline-block bg-muted/30">
          <img
            src={value.secure_url}
            alt="Uploaded preview"
            className="h-32 w-32 rounded-md border border-muted-foreground/20 object-contain"
          />
        </div>
        <div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleChangeImage}
            disabled={disabled}
          >
            Change Image
          </Button>
        </div>
      </div>
    )
  }

  return null
}
