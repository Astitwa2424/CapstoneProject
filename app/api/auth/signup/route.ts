import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { UserRole } from "@prisma/client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      userType,
      // Restaurant specific fields
      restaurantName,
      cuisine,
      description,
      streetAddress,
      suburb,
      state,
      postcode,
      abn,
      operatingHours,
      bankName,
      bankAccountNumber,
      website,
      facebookUrl,
      instagramUrl,
    } = body

    // --- Validation ---
    if (!email || !password || !firstName || !lastName || !userType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // --- User Creation ---
    const hashedPassword = await bcrypt.hash(password, 12)
    const role: UserRole = userType.toUpperCase() as UserRole

    if (!Object.values(UserRole).includes(role)) {
      return NextResponse.json({ error: "Invalid user type" }, { status: 400 })
    }

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name: `${firstName} ${lastName}`,
          role,
        },
      })

      // --- Profile Creation ---
      if (role === UserRole.RESTAURANT) {
        if (!restaurantName || !streetAddress || !suburb || !state || !postcode || !abn) {
          throw new Error("Missing required fields for restaurant profile.")
        }
        const fullAddress = `${streetAddress}, ${suburb}, ${state} ${postcode}, Australia`

        await tx.restaurantProfile.create({
          data: {
            userId: user.id,
            name: restaurantName,
            description: description || null,
            address: fullAddress,
            phone: phone || null,
            cuisine: cuisine || null,
            businessRegistrationNumber: abn,
            streetAddress,
            city: suburb,
            state,
            postalCode: postcode,
            country: "Australia",
            operatingHours: operatingHours || null,
            bankName: bankName || null,
            
            bankAccountNumber: bankAccountNumber || null,
            website: website || null,
            facebookUrl: facebookUrl || null,
            instagramUrl: instagramUrl || null,
          },
        })
      } else if (role === UserRole.CUSTOMER) {
        await tx.customerProfile.create({
          data: {
            userId: user.id,
            phone: phone || null,
            address: body.address || null,
          },
        })
      } else if (role === UserRole.DRIVER) {
        await tx.driverProfile.create({
          data: {
            userId: user.id,
          },
        })
      }

      return user
    })

    return NextResponse.json({
      success: true,
      user: { id: result.id, email: result.email, name: result.name, role: result.role },
    })
  } catch (error) {
    console.error("💥 Signup error:", error)
    const errorMessage = error instanceof Error ? error.message : "An internal server error occurred."
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
