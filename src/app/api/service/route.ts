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
        
        // CRITICAL FIX: Filter services by the authenticated user
        const services = await prisma.service.findMany({
            where: {
                userId: user.id  // Only get services for this specific user
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        
        return NextResponse.json(services)
    } catch (error) {
        console.error('Error fetching services:', error)
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
        const { name, price, description } = body

        // Validate required fields
        if (!name || !price) {
            return NextResponse.json({ 
                message: "Missing required fields: name and price are required"
            }, { status: 400 })  // 400 is more appropriate than 404
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 })
        }

        // CRITICAL FIX: Associate service with the user
        const service = await prisma.service.create({
            data: {
                name,
                price: parseFloat(price),
                description: description || null, // Handle optional description
                userId: user.id  // Associate with the logged-in user
            }
        })
        
        return NextResponse.json(service, { status: 201 })
    } catch (error) {
        console.error('Service creation error:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}