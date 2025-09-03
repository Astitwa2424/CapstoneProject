import Stripe from "stripe"

let stripe: Stripe

export function getStripe(): Stripe {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set in the environment variables.")
    }

    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20",
      typescript: true,
    })
  }

  return stripe
}

// Export for backward compatibility
export { getStripe as stripe }
