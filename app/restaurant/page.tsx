import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Store, TrendingUp, Users, Clock, BarChart3, Smartphone, Headphones, Award } from "lucide-react"

export default async function RestaurantPage() {
  const session = await auth()

  // If the user is logged in and is a restaurant, redirect to their dashboard
  if (session?.user?.role === "RESTAURANT") {
    redirect("/restaurant/dashboard")
  }

  // If they are logged in but not a restaurant, redirect to a generic unauthorized page
  if (session?.user) {
    redirect("/unauthorized")
  }

  // If not logged in, show a landing page to sign in or register
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
              RestaurantHub
            </span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-gray-600 hover:text-green-500 transition-colors">
              Order Food
            </Link>
            <Link href="/driver" className="text-gray-600 hover:text-green-500 transition-colors">
              Become a Driver
            </Link>
            <Button asChild variant="outline">
              <Link href="/auth/restaurant/signin">Restaurant Sign In</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <Badge className="mb-6 bg-green-100 text-green-700 hover:bg-green-100">🚀 Grow your business by 40%</Badge>
            <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Partner with us and
              <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                {" "}
                reach more customers
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of restaurants growing their business with our delivery platform. Increase your revenue and
              reach new customers today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-6 text-lg"
              >
                <Link href="/auth/restaurant/signin">Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8 py-6 text-lg bg-transparent">
                <Link href="#benefits">Learn More</Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <img src="/placeholder.svg?height=500&width=600" alt="Restaurant" className="rounded-2xl shadow-2xl" />
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Partner With Us?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We provide everything you need to succeed in the delivery business
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Increase Revenue</h3>
              <p className="text-gray-600">Average 40% increase in sales within first month</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">New Customers</h3>
              <p className="text-gray-600">Reach millions of hungry customers in your area</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Analytics</h3>
              <p className="text-gray-600">Detailed insights to optimize your menu and pricing</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16 bg-white rounded-2xl mx-4 shadow-lg">
        <h2 className="text-3xl font-bold text-center mb-12">Everything You Need</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="font-semibold mb-2">Easy Setup</h3>
            <p className="text-gray-600 text-sm">Get online in minutes with our simple onboarding</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="font-semibold mb-2">Real-time Orders</h3>
            <p className="text-gray-600 text-sm">Receive and manage orders instantly</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Headphones className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className="font-semibold mb-2">24/7 Support</h3>
            <p className="text-gray-600 text-sm">Get help whenever you need it</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-orange-500" />
            </div>
            <h3 className="font-semibold mb-2">Marketing Tools</h3>
            <p className="text-gray-600 text-sm">Promote your restaurant to more customers</p>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Success Stories</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { name: "Mario's Pizza", increase: "45%", quote: "Our delivery orders increased by 45% in just 2 months!" },
            { name: "Sakura Sushi", increase: "60%", quote: "Best decision we made for our business growth." },
            { name: "Burger Palace", increase: "35%", quote: "The platform is easy to use and customers love it." },
          ].map((story, index) => (
            <Card key={index} className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-green-500 mb-2">+{story.increase}</div>
                  <div className="text-sm text-gray-600">Revenue Increase</div>
                </div>
                <blockquote className="text-gray-700 italic mb-4">"{story.quote}"</blockquote>
                <div className="font-semibold text-center">{story.name}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Grow Your Restaurant?</h2>
          <p className="text-xl mb-8 opacity-90">Join thousands of restaurants already growing with our platform</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-green-600 hover:bg-gray-100 px-8 py-6 text-lg">
              <Link href="/auth/restaurant/signin">Start Your Journey</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-green-600 px-8 py-6 text-lg bg-transparent"
            >
              <Link href="/customer-service">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">RestaurantHub</span>
              </div>
              <p className="text-gray-400">Helping restaurants grow their business through delivery partnerships.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Restaurants</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/auth/restaurant/signin" className="hover:text-white">
                    Get Started
                  </Link>
                </li>
                <li>
                  <Link href="#benefits" className="hover:text-white">
                    Benefits
                  </Link>
                </li>
                <li>
                  <Link href="/customer-service" className="hover:text-white">
                    Support
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/" className="hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="hover:text-white">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/customer-service" className="hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/terms" className="hover:text-white">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 RestaurantHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
