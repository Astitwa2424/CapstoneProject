import NextAuth, { type DefaultSession } from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers" // Import cookies
import type { UserRole as PrismaUserRole } from "@prisma/client" // Import Prisma enum

export type UserRole = PrismaUserRole // Use Prisma enum for consistency

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          redirect_uri:
            process.env.NODE_ENV === "production"
              ? "https://capstone-project-mu-wine.vercel.app/api/auth/callback/google"
              : undefined,
        },
      },
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("🔐 Credentials authorize called with:", { email: credentials?.email })
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Missing email or password")
          return null
        }
        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          })
          if (!user || !user.password) {
            console.log("❌ User not found or no password (OAuth user)")
            return null
          }
          const isPasswordValid = await bcrypt.compare(credentials.password as string, user.password)
          if (!isPasswordValid) {
            console.log("❌ Invalid password")
            return null
          }
          console.log("✅ Credentials Authentication successful for user:", user.email)
          return { id: user.id, email: user.email, name: user.name, role: user.role }
        } catch (error) {
          console.error("💥 Error in authorize function:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile, trigger }) {
      console.log(
        "🎫 JWT callback. Trigger:",
        trigger,
        "User:",
        !!user,
        "Account:",
        account?.provider,
        "Token Sub:",
        token.sub,
        "Token Role:",
        token.role,
      )

      // On initial sign-in or if user object is present (e.g. credentials sign-in)
      if (user && user.id) {
        token.id = user.id
        token.role = user.role as UserRole // Role from DB or credentials authorize

        // Handle OAuth role assignment/update
        if (account && (account.provider === "google" || account.provider === "github")) {
          const intendedRoleCookie = cookies().get("oauth_intended_role")
          let currentDbRole = user.role as UserRole

          if (intendedRoleCookie) {
            const intendedRoleValue = intendedRoleCookie.value.toUpperCase() as UserRole
            console.log(
              `OAuth sign-in. Provider: ${account.provider}, DB role: ${currentDbRole}, Intended role from cookie: ${intendedRoleValue}`,
            )

            if (
              currentDbRole !== intendedRoleValue &&
              (intendedRoleValue === "DRIVER" || intendedRoleValue === "RESTAURANT" || intendedRoleValue === "CUSTOMER")
            ) {
              console.log(`Attempting to update role for user ${user.id} from ${currentDbRole} to ${intendedRoleValue}`)
              try {
                const updatedUser = await prisma.user.update({
                  where: { id: user.id },
                  data: { role: intendedRoleValue },
                })
                currentDbRole = updatedUser.role // Update currentDbRole with the new role
                token.role = currentDbRole
                console.log(`Role updated to ${currentDbRole} for user ${user.id}`)

                // Create role-specific profile if it doesn't exist
                if (
                  currentDbRole === "DRIVER" &&
                  !(await prisma.driverProfile.findUnique({ where: { userId: user.id } }))
                ) {
                  await prisma.driverProfile.create({
                    data: {
                      userId: user.id,
                      licenseNumber: "PENDING",
                      vehicleType: "CAR",
                      vehicleModel: "PENDING",
                      plateNumber: "PENDING",
                    },
                  })
                  console.log(`Created DriverProfile for ${user.id}`)
                } else if (
                  currentDbRole === "RESTAURANT" &&
                  !(await prisma.restaurantProfile.findUnique({ where: { userId: user.id } }))
                ) {
                  await prisma.restaurantProfile.create({
                    data: {
                      userId: user.id,
                      name: user.name || `Restaurant ${user.id.substring(0, 5)}`,
                      address: "PENDING",
                      phone: "PENDING",
                      cuisine: ["PENDING"],
                    },
                  })
                  console.log(`Created RestaurantProfile for ${user.id}`)
                } else if (
                  currentDbRole === "CUSTOMER" &&
                  !(await prisma.customerProfile.findUnique({ where: { userId: user.id } }))
                ) {
                  await prisma.customerProfile.create({
                    data: {
                      userId: user.id,
                      phone: null,
                      address: null,
                    },
                  })
                  console.log(`Created CustomerProfile for OAuth user ${user.id}`)
                }
              } catch (e) {
                console.error("Error updating user role or creating profile:", e)
              }
            }
            cookies().set("oauth_intended_role", "", { path: "/api/auth", maxAge: -1, SameSite: "Lax", Secure: true })
          } else {
            token.role = currentDbRole // Ensure role is set even if no cookie
          }
        }
      } else if (token.sub) {
        // For subsequent JWT calls, verify user still exists and refresh role
        console.log(`Verifying user ${token.sub} from token in DB.`)
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true, id: true },
        })

        if (!dbUser) {
          console.warn(`User ${token.sub} from token not found in DB. Invalidating token.`)
          return {} // Return empty object to invalidate token
        }
        token.id = dbUser.id
        token.role = dbUser.role // Refresh role from DB
      }

      console.log("🎫 JWT - Final token:", { id: token.id, role: token.role, sub: token.sub })
      return token
    },
    async session({ session, token }) {
      console.log("📋 Session callback - Token role:", token.role, "Token ID:", token.id, "Token sub:", token.sub)

      // If token is empty (invalidated by JWT callback), then session.user should be null
      if (!token.id || !token.role) {
        console.warn("Session callback: Invalid token, returning unauthenticated session.")
        // @ts-ignore // NextAuth types might complain, but this is to clear the user
        session.user = null
        return session
      }

      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
      }
      console.log("📋 Session - Final session user:", {
        id: session.user?.id,
        email: session.user?.email,
        role: session.user?.role,
      })
      return session
    },
    async signIn({ user, account, profile }) {
      console.log("📝 SignIn callback. User:", user?.email, "Provider:", account?.provider)
      // This callback runs for all sign-in attempts.
      // For OAuth, if it's a new user, the adapter creates them with the default role.
      // Role update logic is now primarily in the JWT callback.
      // We can perform pre-checks here if needed.
      if (account?.provider === "google" || account?.provider === "github") {
        // Ensure email is verified for OAuth providers if possible (profile usually indicates this)
        if (profile && "email_verified" in profile && !profile.email_verified) {
          console.warn(`OAuth user ${user.email} has an unverified email with provider ${account.provider}.`)
          // Optionally, you could prevent sign-in or flag the account.
        }
      }
      return true // Allow the sign-in
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV === "development",
})

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: UserRole
    } & DefaultSession["user"]
  }
  // Redefine User interface for NextAuth to include role
  interface User {
    role: UserRole
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string // Ensure id is part of JWT
    role?: UserRole
  }
}
