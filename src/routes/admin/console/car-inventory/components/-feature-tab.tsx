import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, X } from 'lucide-react'
import { toast } from 'sonner'

const isValidSvg = (value: string) => {
  const normalized = value.trim()
  return normalized.startsWith('<svg') && normalized.includes('</svg>')
}

export function FeatureTab() {
  const queryClient = useQueryClient()
  const { data: carFeatures = [], isLoading: isLoadingFeatures } = useQuery({
    queryKey: ['carFeatures'],
    queryFn: async () => {
      const response = await fetch('/api/cars/features')
      if (!response.ok) {
        throw new Error('Failed to fetch features')
      }
      const data = await response.json()
      return data.features || []
    },
  })

  const [featureForm, setFeatureForm] = useState({
    id: '',
    name: '',
    icon: '',
  })
  const [featureDialogOpen, setFeatureDialogOpen] = useState(false)

  const featureRows = useMemo(
    () => carFeatures.map((feature: any) => feature.car_feature_types || feature),
    [carFeatures],
  )

  const resetFeatureForm = () => setFeatureForm({ id: '', name: '', icon: '' })

  const handleSaveFeature = async () => {
    const name = featureForm.name.trim()
    const icon = featureForm.icon.trim()

    if (!name) {
      toast.error('Feature name is required')
      return
    }

    if (!icon || !isValidSvg(icon)) {
      toast.error('Feature icon must be valid SVG text')
      return
    }

    const isEditing = Boolean(featureForm.id)
    const endpoint = isEditing ? '/api/cars/features/update' : '/api/cars/features/create'

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: featureForm.id,
          name,
          icon,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || 'Failed to save feature')
        return
      }

      queryClient.invalidateQueries({ queryKey: ['carFeatures'] })
      toast.success(isEditing ? 'Feature updated' : 'Feature created')
      resetFeatureForm()
      setFeatureDialogOpen(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save feature'
      toast.error(message)
    }
  }

  const handleEditFeature = (feature: any) => {
    setFeatureForm({
      id: feature.id || '',
      name: feature.name || '',
      icon: feature.icon || '',
    })
    setFeatureDialogOpen(true)
  }

  const handleDeleteFeature = async (featureId: string) => {
    if (!confirm('Delete this feature?')) {
      return
    }

    try {
      const response = await fetch(`/api/cars/features/${featureId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete feature')
        return
      }

      queryClient.invalidateQueries({ queryKey: ['carFeatures'] })
      toast.success('Feature deleted')
      if (featureForm.id === featureId) {
        resetFeatureForm()
        setFeatureDialogOpen(false)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete feature'
      toast.error(message)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Features</h2>
          <p className="text-sm text-muted-foreground">Manage car feature types.</p>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            resetFeatureForm()
            setFeatureDialogOpen(true)
          }}
        >
          <Plus className="size-4" />
          Add Feature
        </Button>
        {featureDialogOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-2xl rounded-lg border bg-background p-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">
                  {featureForm.id ? 'Edit Feature' : 'Add Feature'}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setFeatureDialogOpen(false)
                    resetFeatureForm()
                  }}
                  aria-label="Close"
                >
                  <X className="size-4" />
                </Button>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="feature-name">
                    Feature Name
                  </label>
                  <Input
                    id="feature-name"
                    value={featureForm.name}
                    onChange={(event) =>
                      setFeatureForm({ ...featureForm, name: event.target.value })
                    }
                    placeholder="e.g. Sunroof"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="feature-icon">
                    SVG Icon
                  </label>
                  <Textarea
                    id="feature-icon"
                    value={featureForm.icon}
                    onChange={(event) =>
                      setFeatureForm({ ...featureForm, icon: event.target.value })
                    }
                    placeholder="<svg ...>...</svg>"
                    rows={4}
                  />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFeatureDialogOpen(false)
                    resetFeatureForm()
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveFeature}>
                  {featureForm.id ? 'Update Feature' : 'Add Feature'}
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {isLoadingFeatures ? (
        <div className="text-muted-foreground">Loading features...</div>
      ) : featureRows.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Icon</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {featureRows.map((feature: any) => (
              <TableRow key={feature.id}>
                <TableCell>{feature.name}</TableCell>
                <TableCell className="max-w-xs whitespace-normal">
                  {feature.icon}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditFeature(feature)}>
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteFeature(feature.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-muted-foreground">No features found</div>
      )}
    </div>
  )
}
