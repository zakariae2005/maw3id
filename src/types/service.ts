export interface Service {
    id: string
    name: string
    price: number
    description: string | null
    createdAt: string
    updatedAt: string
    userId: string
}

export type ServicePayload = {
    name: string
    price: number
    description?: string
}

export type ServiceData = {
    name: string
    price: number
    description: string
}