import { buttonVariants, Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit, Trash2, Eye } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/admin/console/car-models/')({
  component: RouteComponent,
  validateSearch: (search) => {
    const active =
      typeof search.active === 'string' &&
        (search.active === 'makes' || search.active === 'models')
        ? search.active
        : 'makes'
    return { active }
  },
})

function RouteComponent() {
  const { active } = Route.useSearch()
  const navigate = Route.useNavigate()

  const { data: carMakes = [], isLoading } = useQuery({
    queryKey: ['carMakes'],
    queryFn: async () => {
      const response = await fetch('/api/cars');
      if (!response.ok) {
        throw new Error('Failed to fetch car makes');
      }
      return response.json();
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
              <BreadcrumbPage>Car Models</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-4">
          <h1 className="text-3xl">Car Models Management</h1>
          <p className="text-muted-foreground">
            Manage car makes and models. Use the tabs below to switch between
            makes and models.
          </p>
        </div>
      </div>

      <Tabs
        value={active}
        onValueChange={(value) =>
          navigate({
            search: { active: value as 'makes' | 'models' },
            replace: true,
          })
        }
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="makes">Makes</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
        </TabsList>
        <TabsContent value="makes">
          <MakesTab carMakes={carMakes} isLoading={isLoading} />
        </TabsContent>
        <TabsContent value="models">
          <ModelsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function MakesTab({ carMakes, isLoading }: { carMakes: unknown; isLoading: boolean }) {
  const navigate = Route.useNavigate()
  const queryClient = useQueryClient()
  const [selectedMake, setSelectedMake] = useState<string | null>(null)
  
  const makes = carMakes && Array.isArray(carMakes)
    ? carMakes
      .map((item) => getMakeData(item))
      .filter((make): make is { id: string; name: string; logoUrl: string } => Boolean(make))
    : []

  const handleDelete = async (makeId: string) => {
    if (!confirm('Are you sure you want to delete this make?')) {
      return
    }
    
    try {
      const response = await fetch(`/api/cars/${makeId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete car make');
        return;
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['carMakes'] })
      setSelectedMake(null)
      toast.success('Car make deleted successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete car make';
      toast.error(message);
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Makes</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-right mb-4">
          <Link
            to="/admin/console/car-models/add-make"
            className={buttonVariants({ size: 'sm' })}
          >
            <Plus className="size-4 mr-2" />
            Add Make
          </Link>
        </p>
        {isLoading ? (
          <div className="text-sm text-muted-foreground">
            Loading makes...
          </div>
        ) : makes.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="w-32">Logo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {makes.map((make) => (
                <TableRow 
                  key={make.id}
                  className={selectedMake === make.id ? 'bg-muted' : 'cursor-pointer'}
                  onClick={() => setSelectedMake(make.id)}
                >
                  <TableCell>
                    <input
                      type="radio"
                      checked={selectedMake === make.id}
                      onChange={() => setSelectedMake(make.id)}
                      className="cursor-pointer"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{make.name}</TableCell>
                  <TableCell>
                    <img
                      src={make.logoUrl}
                      alt={`${make.name} logo`}
                      className="object-contain rounded border border-border"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-sm text-muted-foreground">
            No makes loaded yet.
          </div>
        )}
      </CardContent>
      {selectedMake && (
        <CardFooter className="flex gap-2 justify-end border-t bg-muted/50 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigate({
                to: '/admin/console/car-models/makes',
                search: { id: selectedMake }
              })
            }}
            className="gap-2"
          >
            <Eye className="w-4 h-4" />
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigate({
                to: '/admin/console/car-models/edit-make/$makeId',
                params: { makeId: selectedMake }
              })
            }}
            className="gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDelete(selectedMake)}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

function ModelsTab() {
  const navigate = Route.useNavigate()
  const queryClient = useQueryClient()

  const { data: modelsByMake = {}, isLoading } = useQuery({
    queryKey: ['modelsByMake'],
    queryFn: async () => {
      const response = await fetch('/api/cars/models/by-make');
      if (!response.ok) {
        throw new Error('Failed to fetch models by make');
      }
      return response.json();
    },
  })

  const handleDelete = async (modelId: string) => {
    if (!confirm('Are you sure you want to delete this model?')) {
      return
    }
    
    try {
      const response = await fetch(`/api/cars/models/${modelId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete car model');
        return;
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['modelsByMake'] })
      toast.success('Car model deleted successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete car model';
      toast.error(message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div></div>
        <Link
          to="/admin/console/car-models/add-model"
          className={buttonVariants({ size: 'default', className: 'gap-2' })}
        >
          <Plus className="size-4" />
          Add New Model
        </Link>
      </div>


      {isLoading ? (
        <div className="text-sm text-muted-foreground">
          Loading models...
        </div>
      ) : Object.keys(modelsByMake).length > 0 ? (
        <div className="space-y-4">
          {Object.entries(modelsByMake).map(([makeId, models]: [string, any]) => (
            <Card key={makeId}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{(models as any[])[0]?.makeName}</h3>
                  <span className="text-sm text-muted-foreground">
                    {(models as any[]).length} {(models as any[]).length === 1 ? 'model' : 'models'}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(models as any[]).map((model: any) => (
                    <div
                      key={model.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <span className="font-medium">{model.name}</span>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            navigate({
                              to: '/admin/console/car-models/edit-model/$modelId',
                              params: { modelId: model.id }
                            })
                          }}
                          className="h-8 w-8"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(model.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              No models loaded yet. Create a model to get started.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function getMakeData(item: unknown): { id: string; name: string; logoUrl: string } | null {
  if (!item || typeof item !== 'object') {
    return null
  }

  const record = item as Record<string, unknown>
  
  // Try direct structure (if data is already flattened)
  if (typeof record.name === 'string' && typeof record.media_url === 'string' && typeof record.id === 'string') {
    return { id: record.id, name: record.name, logoUrl: record.media_url }
  }

  // Try joined structure from database
  const carMakesData = record.car_makes
  const filesData = record.files
  
  if (carMakesData && typeof carMakesData === 'object' && filesData && typeof filesData === 'object') {
    const makeRecord = carMakesData as Record<string, unknown>
    const fileRecord = filesData as Record<string, unknown>
    
    if (typeof makeRecord.name === 'string' && typeof fileRecord.media_url === 'string' && typeof makeRecord.id === 'string') {
      return { id: makeRecord.id, name: makeRecord.name, logoUrl: fileRecord.media_url }
    }
  }

  return null
}
