// types/appointment.ts
export interface Appointment {
    id: string
    clientName: string
    startTime: Date
    duration: number
    createdAt: string
    updatedAt: string
    userId: string
    serviceId: string
    service: {
        id: string
        name: string
        price: number
        description: string | null
    }
}

export type AppointmentPayload = {
    clientName: string
    startTime: Date
    duration?: number
    serviceId: string // Added required serviceId
}

export type AppointmentFormData = {
    clientName: string
    startTime: Date
    duration: number
    serviceId: string // Added serviceId
}