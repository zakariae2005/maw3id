"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Edit2, Trash2, DollarSign, Briefcase, Search, Settings, MoreVertical } from "lucide-react"
import { cn } from '@/lib/utils'
import { useService } from '@/store/useService'

// Professional color scheme for service cards
const colorOptions = [
  "bg-blue-50 border-blue-200 text-blue-900",
  "bg-emerald-50 border-emerald-200 text-emerald-900",
  "bg-amber-50 border-amber-200 text-amber-900",
  "bg-purple-50 border-purple-200 text-purple-900",
  "bg-rose-50 border-rose-200 text-rose-900",
  "bg-teal-50 border-teal-200 text-teal-900",
  "bg-indigo-50 border-indigo-200 text-indigo-900",
  "bg-orange-50 border-orange-200 text-orange-900",
]

type Service = {
  id: string
  name: string
  description: string | null
  price: number
}

export default function ServicesPage() {
  const { services, isLoading, error, fetchServices, createService, updateService, deleteService } = useService()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
  })

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  const handleAddServiceClick = () => {
    setEditingService(null)
    setFormData({
      name: "",
      description: "",
      price: "",
    })
    setIsFormOpen(true)
  }

  const handleEditService = (service: Service) => {
    setEditingService(service)
    setFormData({
      name: service.name,
      description: service.description || "",
      price: service.price.toString(),
    })
    setIsFormOpen(true)
  }

  const handleSaveService = async () => {
    try {
      const serviceData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
      }

      if (editingService) {
        await updateService(editingService.id, serviceData)
      } else {
        await createService(serviceData)
      }

      setIsFormOpen(false)
      setFormData({ name: "", description: "", price: "" })
      setEditingService(null)
    } catch (error) {
      console.error("Failed to save service:", error)
    }
  }

  const handleDeleteService = (service: Service) => {
    setServiceToDelete(service)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteService = async () => {
    if (serviceToDelete) {
      try {
        await deleteService(serviceToDelete.id)
        setIsDeleteDialogOpen(false)
        setServiceToDelete(null)
      } catch (error) {
        console.error("Failed to delete service:", error)
      }
    }
  }

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Function to get consistent color for each service
  const getServiceColor = (serviceId: string) => {
    const index = serviceId.length % colorOptions.length
    return colorOptions[index]
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-900">
        <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Services</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
          <Button onClick={fetchServices} className="bg-slate-900 hover:bg-slate-800 text-white">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-900">
      {/* Professional Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                Services
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Manage your service offerings and pricing
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80 h-9 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:border-slate-400 focus:ring-slate-400"
                />
              </div>
              
              <Button 
                variant="ghost" 
                size="sm"
                className="h-9 w-9 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="sm:hidden mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-3">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-slate-600 dark:text-slate-400">
              {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} found
            </span>
          </div>
          {filteredServices.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-slate-600 dark:text-slate-400">
                Average: ${(filteredServices.reduce((sum, s) => sum + s.price, 0) / filteredServices.length).toFixed(0)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <ScrollArea className="flex-1 p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Loading services...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-24">
            {filteredServices.map((service) => (
              <Card
                key={service.id}
                className={cn(
                  "p-4 border hover:shadow-md transition-all duration-200 cursor-pointer",
                  getServiceColor(service.id)
                )}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-white/60 flex items-center justify-center flex-shrink-0">
                      <Briefcase className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm truncate">{service.name}</h3>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditService(service)}
                      className="h-7 w-7 p-0 hover:bg-white/60"
                      disabled={isLoading}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteService(service)}
                      className="h-7 w-7 p-0 hover:bg-red-100 hover:text-red-600"
                      disabled={isLoading}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <p className="text-xs opacity-75 mb-3 line-clamp-2 leading-relaxed">
                  {service.description || "No description provided"}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    <span className="font-semibold text-sm">{service.price.toFixed(2)}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-white/60"
                  >
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </div>
              </Card>
            ))}

            {filteredServices.length === 0 && !isLoading && (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <Briefcase className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  {searchTerm ? "No services found" : "No services yet"}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-sm">
                  {searchTerm 
                    ? "Try adjusting your search terms to find what you're looking for" 
                    : "Get started by creating your first service offering"
                  }
                </p>
                {!searchTerm && (
                  <Button 
                    onClick={handleAddServiceClick}
                    className="bg-slate-900 hover:bg-slate-800 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Service
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Professional Floating Action Button */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogTrigger asChild>
          <Button 
            onClick={handleAddServiceClick}
            className="fixed bottom-6 right-6 h-12 w-12 rounded-full bg-slate-900 hover:bg-slate-800 shadow-lg hover:shadow-xl transition-all duration-200 z-50"
            size="icon"
            disabled={isLoading}
          >
            <Plus className="h-5 w-5 text-white" />
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {editingService ? "Edit Service" : "New Service"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="serviceName" className="text-sm font-medium">
                Service Name
              </Label>
              <Input
                id="serviceName"
                placeholder="Enter service name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="h-9"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Describe the service..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="min-h-[80px] resize-none"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Price (USD)
              </Label>
              <Input
                type="number"
                placeholder="0.00"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                className="h-9"
                disabled={isLoading}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline"
                onClick={() => {
                  setIsFormOpen(false)
                  setEditingService(null)
                  setFormData({ name: "", description: "", price: "" })
                }}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveService}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white"
                disabled={!formData.name || !formData.price || isLoading}
              >
                {isLoading ? "Saving..." : editingService ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-4 w-4" />
              Delete Service
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{serviceToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteService}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}