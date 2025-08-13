"use client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface FilterControlsProps {
  services: { id: string; name: string }[]
  clients: { id: string; name: string }[]
  selectedService: string | null
  selectedClient: string | null
  onServiceChange: (value: string | null) => void
  onClientChange: (value: string | null) => void
}

export function FilterControls({
  services,
  clients,
  selectedService,
  selectedClient,
  onServiceChange,
  onClientChange,
}: FilterControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full">
      <div className="flex-1">
        <Label htmlFor="service-filter" className="sr-only">
          Filter by Service
        </Label>
        <Select
          value={selectedService || ""}
          onValueChange={(value) => onServiceChange(value === "all" ? null : value)}
        >
          <SelectTrigger id="service-filter" className="w-full rounded-md shadow-sm">
            <SelectValue placeholder="Filter by Service" />
          </SelectTrigger>
          <SelectContent className="rounded-md shadow-lg">
            <SelectItem value="all">All Services</SelectItem>
            {services.map((service) => (
              <SelectItem key={service.id} value={service.id}>
                {service.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1">
        <Label htmlFor="client-filter" className="sr-only">
          Filter by Client
        </Label>
        <Select value={selectedClient || ""} onValueChange={(value) => onClientChange(value === "all" ? null : value)}>
          <SelectTrigger id="client-filter" className="w-full rounded-md shadow-sm">
            <SelectValue placeholder="Filter by Client" />
          </SelectTrigger>
          <SelectContent className="rounded-md shadow-lg">
            <SelectItem value="all">All Clients</SelectItem>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
