import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { DollarSign, Clock, MapPin, Star, Truck, Users, TrendingUp, Shield } from "lucide-react"

export default function DriverPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
              Food Hub Driver
            </span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-gray-600 hover:text-blue-500 transition-colors">
              Order Food
            </Link>
            <Link href="/restaurant" className="text-gray-600 hover:text-blue-500 transition-colors">
              Restaurant Partner
            </Link>
            <Button asChild variant="outline">
              <Link href="/auth/driver/signin">Driver Sign In</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <Badge className="mb-6 bg-blue-100 text-blue-700 hover:bg-blue-100">💰 Earn up to $25/hour</Badge>
            <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Drive and earn
              <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                {" "}
                on your schedule
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of drivers earning money by delivering food. Set your own hours, work when you want, and
              get paid weekly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-8 py-6 text-lg"
              >
                <Link href="/auth/driver/signin">Start Driving</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8 py-6 text-lg">
                <Link href="#requirements">View Requirements</Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <img
              src="https://placehold.co/600x500/3b82f6/ffffff?text=Drive+With+Us"
              alt="Driver"
              className="rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Earnings */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Maximize Your Earnings</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our drivers earn competitive rates with multiple ways to increase their income
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold mb-2">$18-25/hr</h3>
              <p className="text-gray-600">Average hourly earnings including tips</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold mb-2">+$5 Bonus</h3>
              <p className="text-gray-600">Peak hour bonuses during busy times</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="text-2xl font-bold mb-2">100% Tips</h3>
              <p className="text-gray-600">Keep all tips from satisfied customers</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Requirements */}
      <section id="requirements" className="container mx-auto px-4 py-16 bg-white rounded-2xl mx-4 shadow-lg">
        <h2 className="text-3xl font-bold text-center mb-12">Driver Requirements</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Users className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Age Requirement</h3>
                <p className="text-gray-600">Must be 18 years or older</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Truck className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Vehicle</h3>
                <p className="text-gray-600">Car, bike, or scooter in good condition</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Shield className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">License</h3>
                <p className="text-gray-600">Valid drivers license and insurance</p>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <MapPin className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Location</h3>
                <p className="text-gray-600">Available in your city</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Clock className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Availability</h3>
                <p className="text-gray-600">Flexible schedule, work when you want</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Star className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Background Check</h3>
                <p className="text-gray-600">Clean driving record required</p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-8 py-6 text-lg"
          >
            <Link href="/auth/driver/signin">Apply to Drive</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold">Food Hub Driver</span>
            </div>
            <p className="text-gray-400 mb-6">Join the Food Hub driver community and start earning today!</p>
            <div className="flex justify-center space-x-6">
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/customer-service" className="text-gray-400 hover:text-white transition-colors">
                Support
              </Link>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8">
              <p className="text-gray-400">&copy; 2024 Food Hub. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
