import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { AlertCircle, Archive, Eye, MessageSquare, Reply } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export const Route = createFileRoute('/admin/console/contact-forms')({
  component: RouteComponent,
})

type ContactFormStatus = 'incoming' | 'read' | 'responded' | 'closed'

type ContactFormVehicle = {
  id: string
  year: number
  price: string
  mileage: number
  condition: string
  color: string
  transmission: string
  fuelType: string
  make: string
  model: string
}

type ContactFormRecord = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  subject: string
  message: string
  interestedInVehicles: boolean
  vehicles: ContactFormVehicle[]
  status: ContactFormStatus
  createdAt: string
}

type ContactFormsResponse = {
  forms: ContactFormRecord[]
  stats: {
    incoming: number
    read: number
    responded: number
    closed: number
    total: number
  }
}

const statusTabs: Array<{ key: ContactFormStatus; label: string }> = [
  { key: 'incoming', label: 'Incoming' },
  { key: 'read', label: 'Read' },
  { key: 'responded', label: 'Responded' },
  { key: 'closed', label: 'Closed' },
]

function RouteComponent() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<ContactFormStatus>('incoming')

  const { data, isLoading } = useQuery<ContactFormsResponse>({
    queryKey: ['contactForms', activeTab],
    queryFn: async () => {
      const response = await fetch(`/api/contact-forms/?status=${activeTab}`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error?.error || 'Failed to fetch contact forms')
      }
      return response.json()
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ContactFormStatus }) => {
      const response = await fetch(`/api/contact-forms/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result?.error || 'Failed to update form status')
      }

      return result
    },
    onSuccess: () => {
      toast.success('Contact form status updated')
      queryClient.invalidateQueries({ queryKey: ['contactForms'] })
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to update status'
      toast.error(message)
    },
  })

  const stats = useMemo(() => {
    return data?.stats || { incoming: 0, read: 0, responded: 0, closed: 0, total: 0 }
  }, [data])

  const forms = data?.forms || []

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString))
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-4xl font-bold">Contact Forms</h1>
        <p className="text-muted-foreground mt-2">Manage customer inquiries and contact form submissions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Incoming</p>
                <p className="text-3xl font-bold text-primary mt-1">{stats.incoming}</p>
              </div>
              <AlertCircle className="size-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Read</p>
                <p className="text-3xl font-bold text-primary mt-1">{stats.read}</p>
              </div>
              <Eye className="size-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Responded</p>
                <p className="text-3xl font-bold text-primary mt-1">{stats.responded}</p>
              </div>
              <Reply className="size-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-3xl font-bold mt-1">{stats.total}</p>
              </div>
              <MessageSquare className="size-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 rounded-lg bg-muted p-1 w-fit">
          {statusTabs.map((tab) => {
            const count = stats[tab.key]
            const active = activeTab === tab.key
            return (
              <Button
                key={tab.key}
                variant={active ? 'default' : 'ghost'}
                size="sm"
                className="gap-2"
                onClick={() => setActiveTab(tab.key)}
              >
                <span>{tab.label}</span>
                <Badge variant={active ? 'secondary' : 'outline'}>{count}</Badge>
              </Button>
            )
          })}
        </div>

        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <p className="text-muted-foreground">Loading contact forms...</p>
            ) : forms.length === 0 ? (
              <div className="py-14 flex flex-col items-center justify-center text-center">
                <Archive className="size-12 text-muted-foreground mb-3" />
                <p className="text-2xl font-semibold mb-2">No {activeTab} forms.</p>
                <p className="text-muted-foreground">New submissions will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {forms.map((form) => (
                  <div key={form.id} className="border border-border rounded-lg p-4 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        <p className="font-semibold text-lg">{form.firstName} {form.lastName}</p>
                        <p className="text-sm text-muted-foreground">{form.email} {form.phone ? `• ${form.phone}` : ''}</p>
                        <p className="text-xs text-muted-foreground mt-1">{formatDate(form.createdAt)}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {form.status !== 'read' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatusMutation.mutate({ id: form.id, status: 'read' })}
                            disabled={updateStatusMutation.isPending}
                          >
                            Mark Read
                          </Button>
                        )}

                        {form.status !== 'responded' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatusMutation.mutate({ id: form.id, status: 'responded' })}
                            disabled={updateStatusMutation.isPending}
                          >
                            Mark Responded
                          </Button>
                        )}

                        {form.status !== 'closed' && (
                          <Button
                            size="sm"
                            onClick={() => updateStatusMutation.mutate({ id: form.id, status: 'closed' })}
                            disabled={updateStatusMutation.isPending}
                          >
                            Close
                          </Button>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium">Subject</p>
                      <p className="text-sm text-muted-foreground">{form.subject}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium">Message</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{form.message}</p>
                    </div>

                    {form.interestedInVehicles && form.vehicles.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-3">Interested Vehicles</p>
                        <div className="grid gap-3">
                          {form.vehicles.map((vehicle) => (
                            <div key={vehicle.id} className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
                              <p className="font-medium">
                                {vehicle.year} {vehicle.make} {vehicle.model}
                              </p>
                              <div className="grid grid-cols-2 gap-2 text-muted-foreground text-xs">
                                <p>💰 ${parseFloat(vehicle.price).toLocaleString()}</p>
                                <p>🔧 {vehicle.transmission}</p>
                                <p>📏 {vehicle.mileage.toLocaleString()} mi</p>
                                <p>⛽ {vehicle.fuelType}</p>
                                <p>🎨 {vehicle.color}</p>
                                <p>📊 {vehicle.condition}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
