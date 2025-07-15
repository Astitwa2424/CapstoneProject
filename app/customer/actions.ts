"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { stripe } from "@/lib/stripe"
import type { CartItem } from "@/hooks/use-cart"

const addPaymentMethodSchema = z.object({
  cardHolder: z.string().min(1, "Cardholder name is required"),
  cardNumber: z.string().regex(/^(?:\d{4} ){3}\d{4}$/, "Invalid card number format"),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Expiry date must be in MM/YY format"),
  cvv: z.string().min(3, "CVV must be at least 3 digits").max(4),
})

export async function addPaymentMethod(prevState: any, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  const customerProfile = await prisma.customerProfile.findUnique({ where: { userId: session.user.id } })
  if (!customerProfile) return { error: "Customer profile not found" }

  const validatedFields = addPaymentMethodSchema.safeParse({
    cardHolder: formData.get("cardHolder"),
    cardNumber: formData.get("cardNumber"),
    expiryDate: formData.get("expiryDate"),
    cvv: formData.get("cvv"),
  })

  if (!validatedFields.success) {
    return { error: { _errors: validatedFields.error.flatten().formErrors } }
  }

  const { cardNumber, expiryDate, cvv, cardHolder } = validatedFields.data
  const [expiryMonth, expiryYear] = expiryDate.split("/")

  try {
    const stripePaymentMethod = await stripe.paymentMethods.create({
      type: "card",
      card: {
        number: cardNumber.replace(/\s/g, ""),
        exp_month: Number.parseInt(expiryMonth, 10),
        exp_year: Number.parseInt(`20${expiryYear}`, 10),
        cvc: cvv,
      },
      billing_details: {
        name: cardHolder,
      },
    })

    await prisma.paymentMethod.create({
      data: {
        customerProfileId: customerProfile.id,
        stripePaymentMethodId: stripePaymentMethod.id,
        type: stripePaymentMethod.card?.brand || "card",
        last4: stripePaymentMethod.card?.last4 || "",
        cardHolder: cardHolder,
        expiryMonth: expiryMonth,
        expiryYear: `20${expiryYear}`,
      },
    })

    revalidatePath("/customer/checkout")
    return { success: true }
  } catch (error: any) {
    console.error("Stripe/Prisma Error:", error)
    return { error: error.message || "Failed to add payment method." }
  }
}

const placeOrderSchema = z.object({
  cartItems: z.array(z.any()),
  paymentMethodId: z.string().min(1, "Payment method is required"),
  deliveryAddress: z.string().min(1, "Delivery address is required"),
  restaurantId: z.string(),
  subtotal: z.number(),
  deliveryFee: z.number(),
  serviceFee: z.number(),
  total: z.number(),
  specialInstructions: z.string().optional(),
})

export async function placeOrder(data: z.infer<typeof placeOrderSchema>) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Not authenticated" }

  const customerProfile = await prisma.customerProfile.findUnique({ where: { userId: session.user.id } })
  if (!customerProfile) return { success: false, error: "Customer profile not found" }

  const validatedFields = placeOrderSchema.safeParse(data)
  if (!validatedFields.success) {
    return { success: false, error: "Invalid order data." }
  }

  const {
    cartItems,
    paymentMethodId,
    deliveryAddress,
    restaurantId,
    subtotal,
    deliveryFee,
    serviceFee,
    total,
    specialInstructions,
  } = validatedFields.data

  try {
    const order = await prisma.order.create({
      data: {
        customerProfileId: customerProfile.id,
        restaurantId,
        subtotal,
        deliveryFee,
        serviceFee,
        total,
        deliveryAddress,
        paymentMethodId,
        specialInstructions,
        status: "NEW",
        orderItems: {
          create: cartItems.map((item: CartItem) => ({
            menuItemId: item.menuItem.id,
            quantity: item.quantity,
            price: item.menuItem.price,
            specialInstructions: item.specialInstructions,
            selectedModifications: item.selectedModifications as any,
          })),
        },
      },
    })

    // In a real app, you would confirm the payment with Stripe here.
    // For this mock flow, we'll just mark it as paid.
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: "PAID" },
    })

    revalidatePath("/customer/profile/orders")
    return { success: true, orderId: order.id }
  } catch (error) {
    console.error("Error placing order:", error)
    return { success: false, error: "Failed to place order." }
  }
}

export async function getPaymentMethods() {
  const session = await auth()
  if (!session?.user?.id) return []
  const customerProfile = await prisma.customerProfile.findUnique({
    where: { userId: session.user.id },
    include: { paymentMethods: { orderBy: { createdAt: "desc" } } },
  })
  return customerProfile?.paymentMethods || []
}

export async function getOrderDetails(orderId: string) {
  const session = await auth()
  if (!session?.user?.id) return null

  const customerProfile = await prisma.customerProfile.findUnique({ where: { userId: session.user.id } })
  if (!customerProfile) return null

  return prisma.order.findFirst({
    where: { id: orderId, customerProfileId: customerProfile.id },
    include: {
      orderItems: { include: { menuItem: true } },
      restaurant: true,
      customerProfile: { include: { user: true } },
    },
  })
}

export async function getRestaurantProfileById(id: string) {
  try {
    const restaurant = await prisma.restaurantProfile.findUnique({
      where: { id },
      include: {
        menuItems: {
          where: { isActive: true },
          include: {
            modifications: true,
          },
          orderBy: {
            name: "asc",
          },
        },
      },
    })
    return restaurant
  } catch (error) {
    console.error("Error fetching restaurant profile:", error)
    return null
  }
}

export async function getRestaurants() {
  try {
    const restaurants = await prisma.restaurantProfile.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
    })
    return restaurants
  } catch (error) {
    console.error("Error fetching restaurants:", error)
    return []
  }
}
