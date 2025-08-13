// src/app/api/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { businessName, email, password } = body;
    
    console.log("Registration attempt:", { email, hasBusinessName: !!businessName });

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" }, 
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Please enter a valid email address" }, 
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters long" }, 
        { status: 400 }
      );
    }

    // Validate business name if provided
    if (businessName && businessName.trim().length < 2) {
      return NextResponse.json(
        { message: "Business name must be at least 2 characters long" }, 
        { status: 400 }
      );
    }

    // Test database connection
    await prisma.$connect();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" }, 
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        businessName: businessName?.trim() || null,
        email: email.toLowerCase().trim(),
        password: hashedPassword,
      },
      select: {
        id: true,
        businessName: true,
        email: true,
        createdAt: true,
      }
    });

    console.log("User created successfully:", { id: newUser.id, email: newUser.email });

    return NextResponse.json(
      { 
        message: "Account created successfully",
        user: {
          id: newUser.id,
          email: newUser.email,
          businessName: newUser.businessName
        }
      }, 
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    
    // More specific error handling
    if (error instanceof Error) {
      if (error.message.includes('connect')) {
        return NextResponse.json(
          { message: "Database connection error. Please try again." }, 
          { status: 503 }
        );
      }
    }
    
    return NextResponse.json(
      { message: "Internal server error. Please try again later." }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}