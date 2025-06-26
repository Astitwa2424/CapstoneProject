import { ChefHat } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Food Hub
            </span>
          </Link>
          <Button asChild variant="outline">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms and Conditions</h1>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong> December 2024
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing and using Food Hubs services, you accept and agree to be bound by the terms and provision
                of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Service Description</h2>
              <p className="text-gray-700 mb-4">
                Food Hub is a platform that connects customers with local restaurants and independent delivery drivers.
                We facilitate food ordering and delivery services but do not directly prepare food or employ delivery
                drivers.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  When you create an account with us, you must provide information that is accurate, complete, and
                  current at all times.
                </p>
                <p>
                  You are responsible for safeguarding the password and for all activities that occur under your
                  account.
                </p>
                <p>
                  You must notify us immediately upon becoming aware of any breach of security or unauthorized use of
                  your account.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Orders and Payments</h2>
              <div className="text-gray-700 space-y-4">
                <p>All orders are subject to acceptance by the restaurant and availability of delivery drivers.</p>
                <p>Prices are set by individual restaurants and may change without notice.</p>
                <p>Payment is processed at the time of order placement.</p>
                <p>Delivery fees, service fees, and tips are clearly displayed before order confirmation.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Driver Terms</h2>
              <div className="text-gray-700 space-y-4">
                <p>Drivers are independent contractors, not employees of Food Hub.</p>
                <p>Drivers must maintain valid licenses, insurance, and vehicle registration.</p>
                <p>Background checks are required for all drivers.</p>
                <p>Drivers must comply with all local traffic laws and regulations.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Restaurant Partner Terms</h2>
              <div className="text-gray-700 space-y-4">
                <p>Restaurants must maintain all required licenses and permits.</p>
                <p>Food safety and quality standards must be maintained at all times.</p>
                <p>Menu information and pricing must be kept current and accurate.</p>
                <p>Commission fees apply to all orders processed through the platform.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cancellations and Refunds</h2>
              <div className="text-gray-700 space-y-4">
                <p>Orders may be cancelled before restaurant confirmation without charge.</p>
                <p>Refunds for cancelled orders will be processed within 3-5 business days.</p>
                <p>Issues with food quality should be reported within 24 hours of delivery.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Privacy and Data Protection</h2>
              <p className="text-gray-700 mb-4">
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the
                Service, to understand our practices.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                Food Hub shall not be liable for any indirect, incidental, special, consequential, or punitive damages,
                including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to Terms</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to modify or replace these Terms at any time. If a revision is material, we will
                try to provide at least 30 days notice prior to any new terms taking effect.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Information</h2>
              <div className="text-gray-700 space-y-2">
                <p>If you have any questions about these Terms and Conditions, please contact us:</p>
                <p>Email: legal@foodhub.com</p>
                <p>Phone: 1-800-FOOD-HUB</p>
                <p>Address: 123 Food Hub Street, San Francisco, CA 94105</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
