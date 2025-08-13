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
import { Plus, Edit2, Trash2, DollarSign, Briefcase, Search, Settings } from "lucide-react"
import { cn } from '@/lib/utils'
import { useService } from '@/store/useService'

// Generate a random color for each service card
const colorOptions = [
  "bg-gradient-to-r from-orange-100 to-orange-200 border-orange-300 text-orange-800",
  "bg-gradient-to-r from-purple-100 to-purple-200 border-purple-300 text-purple-800",
  "bg-gradient-to-r from-yellow-100 to-yellow-200 border-yellow-300 text-yellow-800",
  "bg-gradient-to-r from-green-100 to-green-200 border-green-300 text-green-800",
  "bg-gradient-to-r from-blue-100 to-blue-200 border-blue-300 text-blue-800",
  "bg-gradient-to-r from-indigo-100 to-indigo-200 border-indigo-300 text-indigo-800",
  "bg-gradient-to-r from-pink-100 to-pink-200 border-pink-300 text-pink-800",
  "bg-gradient-to-r from-teal-100 to-teal-200 border-teal-300 text-teal-800",
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
      // Error is already handled in the store and displayed in UI
    }
  }

  const handleDeleteService = (service: Service) => {
    setServiceToDelete(service)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteService = async () => {
    if (serviceToDelete) {
      try {
        // Call deleteService from Zustand store
        await deleteService(serviceToDelete.id)
        setIsDeleteDialogOpen(false)
        setServiceToDelete(null)
      } catch (error) {
        console.error("Failed to delete service:", error)
        // Error is already handled in the store
      }
    }
  }

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Function to get random color for each service
 const getServiceColor = (serviceId: string) => {
    const index = serviceId.length % colorOptions.length
    return colorOptions[index]
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchServices} className="bg-blue-500 hover:bg-blue-600">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Services
        </h1>
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64 bg-white/50 dark:bg-gray-800/50 border-blue-200 focus:border-blue-500 transition-colors duration-200"
            />
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            aria-label="Settings"
            className="hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-full transition-all duration-200"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Mobile Search */}
      <div className="sm:hidden p-4 bg-white/50 dark:bg-gray-800/50 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/50 dark:bg-gray-800/50 border-blue-200 focus:border-blue-500 transition-colors duration-200"
          />
        </div>
      </div>

      {/* Main Content */}
      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading services...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-24">
            {filteredServices.map((service) => (
              <Card
                key={service.id}
                className={cn(
                  "p-4 rounded-xl border-2 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1",
                  getServiceColor(service.id)
                )}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg leading-tight">{service.name}</h3>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditService(service)}
                      className="h-8 w-8 hover:bg-white/50 rounded-full transition-all duration-200"
                      disabled={isLoading}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteService(service)}
                      className="h-8 w-8 hover:bg-red-100 hover:text-red-600 rounded-full transition-all duration-200"
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <p className="text-sm opacity-80 mb-4 line-clamp-2">
                  {service.description || "No description provided"}
                </p>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1 text-sm">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-bold">${service.price}</span>
                  </div>
                </div>
              </Card>
            ))}

            {filteredServices.length === 0 && !isLoading && (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-200 rounded-full flex items-center justify-center mb-4">
                  <Briefcase className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                  {searchTerm ? "No services found" : "No services yet"}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {searchTerm 
                    ? "Try adjusting your search terms" 
                    : "Create your first service to get started"
                  }
                </p>
                {!searchTerm && (
                  <Button 
                    onClick={handleAddServiceClick}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white transition-all duration-200"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Service
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Floating Create Button */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogTrigger asChild>
          <Button 
            onClick={handleAddServiceClick}
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-xl hover:shadow-2xl transition-all duration-300 z-50 border-2 border-white dark:border-gray-800"
            size="icon"
            disabled={isLoading}
          >
            <Plus className="h-6 w-6 text-white" />
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[95vw] max-w-lg rounded-xl bg-gradient-to-b from-white to-blue-50 dark:from-gray-800 dark:to-gray-900">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-50 flex items-center gap-2">
              {editingService ? <Edit2 className="h-5 w-5 text-blue-600" /> : <Plus className="h-5 w-5 text-blue-600" />}
              {editingService ? "Edit Service" : "Create Service"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="serviceName" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-blue-600" />
                Service Name
              </Label>
              <Input
                id="serviceName"
                placeholder="Enter service name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-white/50 dark:bg-gray-800/50 border-blue-200 focus:border-blue-500 transition-colors duration-200"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Describe the service..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="bg-white/50 dark:bg-gray-800/50 border-blue-200 focus:border-blue-500 transition-colors duration-200 min-h-[80px]"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                Price ($)
              </Label>
              <Input
                type="number"
                placeholder="0.00"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                className="bg-white/50 dark:bg-gray-800/50 border-blue-200 focus:border-blue-500 transition-colors duration-200"
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
                className="flex-1 border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-all duration-200"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveService}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                disabled={!formData.name || !formData.price || isLoading}
              >
                {isLoading ? "Saving..." : editingService ? "Update" : "Create"} Service
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-xl bg-gradient-to-b from-white to-red-50 dark:from-gray-800 dark:to-red-900/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <Trash2 className="h-5 w-5" />
              Delete Service
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              Are you sure you want to delete &quot;{serviceToDelete?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
              disabled={isLoading}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteService}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
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