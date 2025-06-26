import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Star, Clock, Shield, ChefHat, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Food Hub
            </span>
          </div>
          <div className="flex items-center space-x-6">
            <Link href="/driver" className="text-gray-600 hover:text-orange-500 transition-colors">
              Food Hub Driver
            </Link>
            <Link href="/restaurant" className="text-gray-600 hover:text-orange-500 transition-colors">
              Food Hub Restaurant
            </Link>
            <Link href="/customer-service" className="text-gray-600 hover:text-orange-500 transition-colors">
              Support
            </Link>
            <Button asChild variant="outline">
              <Link href="/auth/customer/signin">Sign In</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <Badge className="mb-6 bg-orange-100 text-orange-700 hover:bg-orange-100">
            🎉 Free delivery on your first order!
          </Badge>
          <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Delicious food
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              {" "}
              delivered fast
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Order from your favorite restaurants and get fresh, hot meals delivered to your doorstep in minutes with
            real-time tracking.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-6 text-lg"
            >
              <Link href="/auth/customer/signin">Order Now</Link>
            </Button>
            <div className="flex items-center space-x-2 text-gray-600">
              <MapPin className="w-5 h-5" />
              <span>Available in 50+ cities with live tracking</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-gray-600">Get your food delivered in 30 minutes or less with real-time tracking</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Safe & Secure</h3>
              <p className="text-gray-600">Your payments and data are always protected with bank-level security</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Top Rated</h3>
              <p className="text-gray-600">4.8/5 rating from thousands of happy customers worldwide</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Popular Restaurants */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Popular Restaurants</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            {
              name: "Pizza Palace",
              cuisine: "Italian",
              rating: 4.8,
              time: "25-35 min",
              image: "/placeholder.svg?height=200&width=300",
            },
            {
              name: "Burger Barn",
              cuisine: "American",
              rating: 4.7,
              time: "20-30 min",
              image: "/placeholder.svg?height=200&width=300",
            },
            {
              name: "Sushi Zen",
              cuisine: "Japanese",
              rating: 4.9,
              time: "30-40 min",
              image: "/placeholder.svg?height=200&width=300",
            },
            {
              name: "Taco Fiesta",
              cuisine: "Mexican",
              rating: 4.6,
              time: "15-25 min",
              image: "/placeholder.svg?height=200&width=300",
            },
          ].map((restaurant, index) => (
            <Card
              key={index}
              className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                <img
                  src={restaurant.image || "/placeholder.svg"}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-1">{restaurant.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{restaurant.cuisine}</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{restaurant.rating}</span>
                  </div>
                  <span className="text-sm text-gray-600">{restaurant.time}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <ChefHat className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold">Food Hub</span>
              </div>
              <p className="text-gray-400 mb-4">
                Delivering happiness, one meal at a time. Fast, fresh, and always delicious.
              </p>
              <div className="flex space-x-4">
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Facebook className="w-5 h-5" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="w-5 h-5" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Instagram className="w-5 h-5" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Linkedin className="w-5 h-5" />
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="text-gray-400 hover:text-white transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/news" className="text-gray-400 hover:text-white transition-colors">
                    News
                  </Link>
                </li>
                <li>
                  <Link href="/investor" className="text-gray-400 hover:text-white transition-colors">
                    Investor Relations
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/customer-service" className="text-gray-400 hover:text-white transition-colors">
                    Customer Service
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="text-gray-400 hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/safety" className="text-gray-400 hover:text-white transition-colors">
                    Safety
                  </Link>
                </li>
                <li>
                  <Link href="/accessibility" className="text-gray-400 hover:text-white transition-colors">
                    Accessibility
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="text-gray-400 hover:text-white transition-colors">
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link href="/california-privacy" className="text-gray-400 hover:text-white transition-colors">
                    California Privacy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Food Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
