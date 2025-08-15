// src/app/api/appointment/route.ts
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 })
        }

        // Get appointments with service information
        const appointments = await prisma.appointment.findMany({
            where: {
                userId: user.id
            },
            include: {
                service: true // Include service data
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(appointments)
    } catch (error) {
        console.error('Error fetching appointments:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { clientName, startTime, duration, serviceId } = body

        // Validate required fields
        if (!clientName || !startTime || !serviceId) {
            return NextResponse.json({ 
                message: "Missing required fields: Client Name, start Time, and Service are required"
            }, { status: 400 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 })
        }

        // Verify that the service belongs to the user
        const service = await prisma.service.findFirst({
            where: {
                id: serviceId,
                userId: user.id
            }
        })

        if (!service) {
            return NextResponse.json({ 
                message: 'Service not found or does not belong to user' 
            }, { status: 404 })
        }

        // Create appointment with service
        const appointment = await prisma.appointment.create({
            data: {
                clientName,
                startTime: new Date(startTime),
                duration: duration || 30, // Default to 30 minutes
                serviceId,
                userId: user.id  
            },
            include: {
                service: true // Include service data in response
            }
        })

        return NextResponse.json(appointment, { status: 201 })
    } catch (error) {
        console.error('Appointment creation error:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}