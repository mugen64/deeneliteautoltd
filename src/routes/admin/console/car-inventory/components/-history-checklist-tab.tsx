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
import { IconDisplay, IconPicker } from '@/components/IconPicker'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, X } from 'lucide-react'
import { isHistoryIconName } from '@/lib/icon-names'
import { toast } from 'sonner'

export function HistoryChecklistTab() {
  const queryClient = useQueryClient()
  const { data: carHistoryChecklist = [], isLoading: isLoadingHistory } = useQuery({
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

  const [historyForm, setHistoryForm] = useState({
    id: '',
    description: '',
    iconName: '',
  })
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false)

  const historyRows = useMemo(
    () => carHistoryChecklist.map((item: any) => item.car_history_checklist || item),
    [carHistoryChecklist],
  )

  const resetHistoryForm = () => setHistoryForm({ id: '', description: '', iconName: '' })

  const handleSaveHistory = async () => {
    const description = historyForm.description.trim()
    const iconName = historyForm.iconName.trim()

    if (!description) {
      toast.error('Description is required')
      return
    }

    if (!iconName || !isHistoryIconName(iconName)) {
      toast.error('Select a supported icon')
      return
    }

    const isEditing = Boolean(historyForm.id)
    const endpoint = isEditing
      ? '/api/cars/history-checklist/update'
      : '/api/cars/history-checklist/create'

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: historyForm.id,
          description,
          iconName,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || 'Failed to save checklist item')
        return
      }

      queryClient.invalidateQueries({ queryKey: ['carHistoryChecklist'] })
      toast.success(isEditing ? 'Checklist item updated' : 'Checklist item created')
      resetHistoryForm()
      setHistoryDialogOpen(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save checklist item'
      toast.error(message)
    }
  }

  const handleEditHistory = (item: any) => {
    setHistoryForm({
      id: item.id || '',
      description: item.description || '',
      iconName: item.iconSvg || '',
    })
    setHistoryDialogOpen(true)
  }

  const handleDeleteHistory = async (itemId: string) => {
    if (!confirm('Delete this checklist item?')) {
      return
    }

    try {
      const response = await fetch(`/api/cars/history-checklist/${itemId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete checklist item')
        return
      }

      queryClient.invalidateQueries({ queryKey: ['carHistoryChecklist'] })
      toast.success('Checklist item deleted')
      if (historyForm.id === itemId) {
        resetHistoryForm()
        setHistoryDialogOpen(false)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete checklist item'
      toast.error(message)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">History Checklist</h2>
          <p className="text-sm text-muted-foreground">Manage history checklist items.</p>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            resetHistoryForm()
            setHistoryDialogOpen(true)
          }}
        >
          <Plus className="size-4" />
          Add Checklist Item
        </Button>
        <Dialog
          open={historyDialogOpen}
          onOpenChange={(open) => {
            setHistoryDialogOpen(open)
            if (!open) resetHistoryForm()
          }}
        >
          <DialogContent>
            <form
              onSubmit={(event) => {
                event.preventDefault()
                handleSaveHistory()
              }}
            >
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle>
                    {historyForm.id ? 'Edit Checklist Item' : 'Add Checklist Item'}
                  </DialogTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setHistoryDialogOpen(false)
                      resetHistoryForm()
                    }}
                    aria-label="Close"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </DialogHeader>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="history-description">
                    Description
                  </label>
                  <Input
                    id="history-description"
                    value={historyForm.description}
                    onChange={(event) =>
                      setHistoryForm({ ...historyForm, description: event.target.value })
                    }
                    placeholder="e.g. Accident free"
                  />
                </div>
                <IconPicker
                  type="history"
                  label="Icon"
                  value={historyForm.iconName}
                  onChange={(value) => setHistoryForm({ ...historyForm, iconName: value })}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setHistoryDialogOpen(false)
                    resetHistoryForm()
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {historyForm.id ? 'Update Checklist Item' : 'Add Checklist Item'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoadingHistory ? (
        <div className="text-muted-foreground">Loading checklist items...</div>
      ) : historyRows.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Icon</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {historyRows.map((item: any) => (
              <TableRow key={item.id}>
                <TableCell>{item.description}</TableCell>
                <TableCell className="max-w-xs whitespace-normal">
                  <span className="inline-flex items-center gap-2">
                    <IconDisplay name={item.iconSvg} />
                    <span>{item.iconSvg}</span>
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditHistory(item)}>
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteHistory(item.id)}
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
        <div className="text-muted-foreground">No checklist items found</div>
      )}
    </div>
  )
}
