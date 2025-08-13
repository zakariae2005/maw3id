"use client"

import type { Service } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Trash } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"

interface ServicesListProps {
  services: Service[]
  onEdit: (service: Service) => void
  onDelete: (service: Service) => void
}

export function ServicesList({ services, onEdit, onDelete }: ServicesListProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)") // md breakpoint

  if (services.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No services added yet. Click &quot;Add Service&quot; to get started!
      </div>
    )
  }

  if (isDesktop) {
    return (
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service Name</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id}>
                <TableCell className="font-medium">{service.name}</TableCell>
                <TableCell>{service.duration} minutes</TableCell>
                <TableCell className="text-right">{service.price ? `$${service.price.toFixed(2)}` : "N/A"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(service)}
                      aria-label={`Edit ${service.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(service)}
                      aria-label={`Delete ${service.name}`}
                    >
                      <Trash className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div className="grid gap-4 w-full">
      {services.map((service) => (
        <Card key={service.id} className="w-full">
          <CardHeader>
            <CardTitle>{service.name}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration:</span>
              <span>{service.duration} minutes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price:</span>
              <span>{service.price ? `$${service.price.toFixed(2)}` : "N/A"}</span>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(service)}>
              <Pencil className="h-4 w-4 mr-2" /> Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={() => onDelete(service)}>
              <Trash className="h-4 w-4 mr-2" /> Delete
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
