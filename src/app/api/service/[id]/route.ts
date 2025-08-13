import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// UPDATE Service
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const body = await req.json()
        const { name, price, description } = body

        // Validate required fields
        if (!name || !price) {
            return NextResponse.json({ 
                message: "Missing required fields: name and price are required"
            }, { status: 400 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 })
        }

        // Check if service exists and belongs to the user
        const existingService = await prisma.service.findFirst({
            where: {
                id,
                userId: user.id // Ensure user can only update their own services
            }
        })

        if (!existingService) {
            return NextResponse.json({ 
                message: 'Service not found or you do not have permission to update it' 
            }, { status: 404 })
        }

        // Update the service
        const updatedService = await prisma.service.update({
            where: { id },
            data: {
                name,
                price: parseFloat(price),
                description: description || null,
            }
        })
        
        return NextResponse.json(updatedService, { status: 200 })
    } catch (error) {
        console.error('Service update error:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

// DELETE Service
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

       const { id } = await params

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 })
        }

        // Check if service exists and belongs to the user
        const existingService = await prisma.service.findFirst({
            where: {
                id,
                userId: user.id // Ensure user can only delete their own services
            }
        })

        if (!existingService) {
            return NextResponse.json({ 
                message: 'Service not found or you do not have permission to delete it' 
            }, { status: 404 })
        }

        // Delete the service
        await prisma.service.delete({
            where: { id }
        })
        
        return NextResponse.json({ message: 'Service deleted successfully' }, { status: 200 })
    } catch (error) {
        console.error('Service deletion error:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

// GET Single Service (optional, for future use)
export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const { id } = params

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 })
        }

        // Get service that belongs to the user
        const service = await prisma.service.findFirst({
            where: {
                id,
                userId: user.id
            }
        })

        if (!service) {
            return NextResponse.json({ 
                message: 'Service not found' 
            }, { status: 404 })
        }
        
        return NextResponse.json(service, { status: 200 })
    } catch (error) {
        console.error('Service fetch error:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}