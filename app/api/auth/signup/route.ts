import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { UserRole } from "@prisma/client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("📝 Signup request received for:", body.email)

    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      address,
      city,
      state,
      zipCode,
      userType,
      // Driver specific fields
      licenseNumber,
      vehicleType,
      vehicleModel,
      vehicleYear,
      plateNumber,
      insuranceProvider,
      // Restaurant specific fields
      restaurantName,
      businessType,
      cuisine,
      description,
      businessLicense,
      taxId,
    } = body

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      console.log("❌ Missing required fields")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      console.log("❌ User already exists:", email)
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Hash password
    console.log("🔐 Hashing password...")
    const hashedPassword = await bcrypt.hash(password, 12)

    // Determine user role
    let role: UserRole
    switch (userType) {
      case "driver":
        role = UserRole.DRIVER
        break
      case "restaurant":
        role = UserRole.RESTAURANT
        break
      default:
        role = UserRole.CUSTOMER
    }

    console.log("👤 Creating user with role:", role)

    // Create user with transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create the main user
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword, // Make sure to save the hashed password
          name: `${firstName} ${lastName}`,
          role,
          phone,
          address: `${address}, ${city}, ${state} ${zipCode}`,
        },
      })

      console.log("✅ User created:", user.id)

      // Create role-specific profile
      if (role === UserRole.CUSTOMER) {
        await tx.customerProfile.create({
          data: {
            userId: user.id,
            deliveryAddress: `${address}, ${city}, ${state} ${zipCode}`,
            paymentMethods: {},
          },
        })
        console.log("✅ Customer profile created")
      } else if (role === UserRole.DRIVER) {
        await tx.driverProfile.create({
          data: {
            userId: user.id,
            licenseNumber: licenseNumber || "PENDING",
            vehicleType: vehicleType ? (vehicleType.toUpperCase() as VehicleType) : VehicleType.CAR,
            vehicleModel: vehicleModel || "PENDING",
            plateNumber: plateNumber || "PENDING",
            isAvailable: false,
            rating: 0.0,
            totalDeliveries: 0,
          },
        })
        console.log("✅ Driver profile created")
      } else if (role === UserRole.RESTAURANT) {
        await tx.restaurantProfile.create({
          data: {
            userId: user.id,
            name: restaurantName || `${firstName}'s Restaurant`,
            description: description || "",
            address: `${address}, ${city}, ${state} ${zipCode}`,
            phone,
            cuisine: cuisine ? [cuisine] : [],
            isOpen: false,
            rating: 0.0,
            deliveryFee: 0.0,
            minOrder: 0.0,
          },
        })
        console.log("✅ Restaurant profile created")
      }

      return user
    })

    console.log("🎉 Signup successful for:", result.email)

    // Return success response without sensitive data
    return NextResponse.json({
      success: true,
      user: {
        id: result.id,
        email: result.email,
        name: result.name,
        role: result.role,
      },
    })
  } catch (error) {
    console.error("💥 Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Define VehicleType enum to match Prisma schema
enum VehicleType {
  BIKE = "BIKE",
  CAR = "CAR",
  SCOOTER = "SCOOTER",
  MOTORCYCLE = "MOTORCYCLE",
}
