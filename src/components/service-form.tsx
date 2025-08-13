"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Service } from "@/lib/data"
import { useMediaQuery } from "@/hooks/use-media-query"

interface ServiceFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (service: Omit<Service, "id"> | Service) => void
  initialData?: Service | null
}

export function ServiceForm({ isOpen, onClose, onSave, initialData }: ServiceFormProps) {
  const [name, setName] = useState(initialData?.name || "")
  const [duration, setDuration] = useState(String(initialData?.duration || "15"))
  const [price, setPrice] = useState(initialData?.price?.toFixed(2) || "")
  const isDesktop = useMediaQuery("(min-width: 768px)") // md breakpoint

  useEffect(() => {
    if (initialData) {
      setName(initialData.name)
      setDuration(String(initialData.duration))
      setPrice(initialData.price?.toFixed(2) || "")
    } else {
      setName("")
      setDuration("15")
      setPrice("")
    }
  }, [initialData, isOpen]) // Reset form when initialData or isOpen changes

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      alert("Service Name is required.")
      return
    }

    const serviceData: Omit<Service, "id"> | Service = {
      name: name.trim(),
      duration: Number.parseInt(duration),
      price: price ? Number.parseFloat(price) : undefined,
    }

    if (initialData) {
      onSave({ ...serviceData, id: initialData.id } as Service)
    } else {
      onSave(serviceData)
    }
    onClose()
  }

  const FormContent = (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">
          Name
        </Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="duration" className="text-right">
          Duration
        </Label>
        <Select value={duration} onValueChange={setDuration}>
          <SelectTrigger id="duration" className="col-span-3">
            <SelectValue placeholder="Select duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="15">15 minutes</SelectItem>
            <SelectItem value="30">30 minutes</SelectItem>
            <SelectItem value="45">45 minutes</SelectItem>
            <SelectItem value="60">60 minutes</SelectItem>
            <SelectItem value="90">90 minutes</SelectItem>
            <SelectItem value="120">120 minutes</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="price" className="text-right">
          Price
        </Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="col-span-3"
          placeholder="e.g., 25.00"
        />
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Save Service</Button>
      </div>
    </form>
  )

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{initialData ? "Edit Service" : "Add New Service"}</DialogTitle>
            <DialogDescription>
              {initialData ? "Make changes to your service here." : "Create a new service to offer."}
            </DialogDescription>
          </DialogHeader>
          {FormContent}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{initialData ? "Edit Service" : "Add New Service"}</DrawerTitle>
          <DrawerDescription>
            {initialData ? "Make changes to your service here." : "Create a new service to offer."}
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4">{FormContent}</div>
        <DrawerFooter>{/* Buttons are already part of FormContent, so no need to duplicate here */}</DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
