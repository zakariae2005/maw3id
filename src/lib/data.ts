import { v4 as uuidv4 } from "uuid"

export interface Service {
  id: string
  name: string
  duration: number // in minutes
  price?: number
}

// Mock data store
let services: Service[] = [
  { id: uuidv4(), name: "Haircut", duration: 30, price: 25.0 },
  { id: uuidv4(), name: "Beard Trim", duration: 15, price: 10.0 },
  { id: uuidv4(), name: "Full Styling", duration: 60, price: 50.0 },
  { id: uuidv4(), name: "Coloring", duration: 120, price: 100.0 },
]

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))

export async function getServices(): Promise<Service[]> {
  await delay(300) // Simulate network delay
  return [...services]
}

export async function addService(newService: Omit<Service, "id">): Promise<Service> {
  await delay(300)
  const serviceWithId = { ...newService, id: uuidv4() }
  services.push(serviceWithId)
  return serviceWithId
}

export async function updateService(id: string, updatedFields: Partial<Service>): Promise<Service | null> {
  await delay(300)
  const index = services.findIndex((s) => s.id === id)
  if (index > -1) {
    services[index] = { ...services[index], ...updatedFields }
    return services[index]
  }
  return null
}

export async function deleteService(id: string): Promise<boolean> {
  await delay(300)
  const initialLength = services.length
  services = services.filter((s) => s.id !== id)
  return services.length < initialLength
}
