// src/app/api/appointment/[id]/route.ts
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { clientName, startTime, duration, serviceId } = body

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 })
        }

        // Check if appointment exists and belongs to user
        const existingAppointment = await prisma.appointment.findFirst({
            where: {
                id: params.id,
                userId: user.id
            }
        })

        if (!existingAppointment) {
            return NextResponse.json({ 
                message: 'Appointment not found or does not belong to user' 
            }, { status: 404 })
        }

        // If serviceId is being updated, verify it belongs to the user
        if (serviceId) {
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
        }

        // Update appointment
        const updatedAppointment = await prisma.appointment.update({
            where: { id: params.id },
            data: {
                ...(clientName && { clientName }),
                ...(startTime && { startTime: new Date(startTime) }),
                ...(duration && { duration }),
                ...(serviceId && { serviceId })
            },
            include: {
                service: true
            }
        })

        return NextResponse.json(updatedAppointment)
    } catch (error) {
        console.error('Appointment update error:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
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

        // Check if appointment exists and belongs to user
        const existingAppointment = await prisma.appointment.findFirst({
            where: {
                id: params.id,
                userId: user.id
            }
        })

        if (!existingAppointment) {
            return NextResponse.json({ 
                message: 'Appointment not found or does not belong to user' 
            }, { status: 404 })
        }

        // Delete appointment
        await prisma.appointment.delete({
            where: { id: params.id }
        })

        return NextResponse.json({ message: 'Appointment deleted successfully' })
    } catch (error) {
        console.error('Appointment deletion error:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}