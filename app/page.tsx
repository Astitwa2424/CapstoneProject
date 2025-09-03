import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Star, Clock, ChefHat, Facebook, Twitter, Instagram, Truck, Users, Award } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen hero-gradient">
      <nav className="bg-white/90 backdrop-blur-md border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 warm-gradient rounded-xl flex items-center justify-center shadow-lg">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              FoodHub
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/driver" className="text-muted-foreground hover:text-accent transition-colors font-medium">
              For Drivers
            </Link>
            <Link href="/restaurant" className="text-muted-foreground hover:text-accent transition-colors font-medium">
              For Restaurants
            </Link>
            <Link
              href="/customer-service"
              className="text-muted-foreground hover:text-accent transition-colors font-medium"
            >
              Support
            </Link>
            <Button
              asChild
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
            >
              <Link href="/auth/customer/signin">Sign In</Link>
            </Button>
          </div>
        </div>
      </nav>

      <section className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <Badge className="bg-accent/10 text-accent hover:bg-accent/20 border-accent/20">
              🎉 Claim Best Offer on Fast Food & Restaurants
            </Badge>
            <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Menu That Always
              <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Makes You Fall In Love
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-lg">
              Our job is to filling your tummy with delicious food and with fast and free delivery
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="warm-gradient hover:opacity-90 text-white px-8 py-6 text-lg rounded-xl shadow-lg"
              >
                <Link href="/auth/customer/signin">Get Started</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-6 text-lg rounded-xl bg-transparent"
              >
                <Link href="#menu">Watch Video</Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="w-96 h-96 mx-auto relative">
              <div className="absolute inset-0 warm-gradient rounded-full opacity-20 blur-3xl"></div>
              <div className="relative w-full h-full rounded-full overflow-hidden shadow-2xl">
                {/* 🖼️ WEB IMAGE INTEGRATION - HERO SECTION:
                  Replace the placeholder below with any web image URL:
                  Example: src="https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop"
                  
                  Popular food image sources:
                  - Unsplash: https://unsplash.com/s/photos/food
                  - Pexels: https://www.pexels.com/search/food/
                  - Pixabay: https://pixabay.com/images/search/food/
                */}
                <img
                  src="https://img.freepik.com/free-photo/poke-bowl-with-rice-salmoncucumbermangoonionwakame-salad-poppy-seeds-ands-sunflowers-seeds_123827-22754.jpg"
                  alt="Delicious Food"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -top-4 -right-4 bg-white rounded-xl p-3 shadow-lg">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="font-semibold text-sm">4.8</span>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl p-3 shadow-lg">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-accent" />
                  <span className="font-semibold text-sm">25 min</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">What We Serve</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Your Favourite Food Delivery Partner</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="food-card border-0">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Truck className="w-10 h-10 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Easy To Order</h3>
              <p className="text-muted-foreground">You only need a few steps in ordering food</p>
            </CardContent>
          </Card>

          <Card className="food-card border-0">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Clock className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Fastest Delivery</h3>
              <p className="text-muted-foreground">Delivery that is always ontime even faster</p>
            </CardContent>
          </Card>

          <Card className="food-card border-0">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Award className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Best Quality</h3>
              <p className="text-muted-foreground">Not only fast for us quality is also number one</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="menu" className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <Badge className="bg-accent/10 text-accent mb-4">OUR MENU</Badge>
          <h2 className="text-4xl font-bold text-foreground mb-4">Menu That Always Makes You Fall In Love</h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            {[
              { name: "Burger", icon: "🍔", active: false },
              { name: "Pizza", icon: "🍕", active: true },
              { name: "Cupcake", icon: "🧁", active: false },
              { name: "Ramen", icon: "🍜", active: false },
              { name: "Ice Cream", icon: "🍦", active: false },
            ].map((item, index) => (
              <div
                key={index}
                className={`flex items-center space-x-4 p-4 rounded-xl cursor-pointer transition-all ${
                  item.active ? "bg-accent text-white shadow-lg" : "hover:bg-card"
                }`}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="font-semibold text-lg">{item.name}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Card className="food-card border-0">
              <div className="aspect-square bg-gray-200 rounded-t-xl overflow-hidden">
                {/* 🍕 WEB IMAGE INTEGRATION - MENU ITEM 1:
                  Replace with pizza image URL:
                  Example: src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=200&fit=crop"
                */}
                <img
                  src="data:image/jpeg;base64,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"
                  alt="Italian Pizza"
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-1">Italian Pizza</h3>
                <p className="text-accent font-bold text-xl">$7.49</p>
                <p className="text-sm text-muted-foreground mt-1">Order Now →</p>
              </CardContent>
            </Card>

            <Card className="food-card border-0">
              <div className="aspect-square bg-gray-200 rounded-t-xl overflow-hidden">
                {/* 🌭 WEB IMAGE INTEGRATION - MENU ITEM 2:
                  Replace with sausage pizza image URL:
                  Example: src="https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=200&h=200&fit=crop"
                */}
                <img
                  src="https://keepingitsimpleitalian.com/wp-content/uploads/2022/11/Baked-Italian-Sausage.jpg"
                  alt="Sausage Pizza"
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-1">Sausage Pizza</h3>
                <p className="text-accent font-bold text-xl">$6.59</p>
                <p className="text-sm text-muted-foreground mt-1">Order Now →</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <Badge className="bg-primary/10 text-primary mb-4">WHAT THEY SAY</Badge>
          <h2 className="text-4xl font-bold text-foreground">What Our Customers Say About Us</h2>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="food-card border-0 p-8">
            <div className="text-center">
              <p className="text-lg text-muted-foreground mb-6 italic">
                "FoodHub is the best! Besides the many and delicious meals, the service is also very good, especially in
                the very fast delivery. I highly recommend FoodHub to you"
              </p>
              <div className="flex items-center justify-center space-x-4">
                {/* 👤 WEB IMAGE INTEGRATION - CUSTOMER AVATAR:
                  Replace the icon below with a customer photo:
                  Example: 
                  <img 
                    src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=48&h=48&fit=crop&crop=face" 
                    alt="Theresa Jordan"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                */}
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold">Theresa Jordan</p>
                  <p className="text-sm text-muted-foreground">Food Enthusiast</p>
                </div>
              </div>
              <div className="flex justify-center space-x-1 mt-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
            </div>
          </Card>
        </div>
      </section>

      <footer className="bg-foreground text-background">
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 warm-gradient rounded-xl flex items-center justify-center">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">FoodHub</span>
              </div>
              <p className="text-muted mb-6">
                Our job is to filling your tummy with delicious food and with fast and free delivery
              </p>
              <div className="flex space-x-4">
                <Link
                  href="#"
                  className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center hover:bg-primary/30 transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </Link>
                <Link
                  href="#"
                  className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center hover:bg-primary/30 transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </Link>
                <Link
                  href="#"
                  className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center hover:bg-primary/30 transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-6">About</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/about" className="text-muted hover:text-background transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/features" className="text-muted hover:text-background transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/news" className="text-muted hover:text-background transition-colors">
                    News
                  </Link>
                </li>
                <li>
                  <Link href="/menu" className="text-muted hover:text-background transition-colors">
                    Menu
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-6">Company</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/why-foodhub" className="text-muted hover:text-background transition-colors">
                    Why FoodHub?
                  </Link>
                </li>
                <li>
                  <Link href="/partner" className="text-muted hover:text-background transition-colors">
                    Partner With Us
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-muted hover:text-background transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-muted hover:text-background transition-colors">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-6">Support</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/account" className="text-muted hover:text-background transition-colors">
                    Account
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="text-muted hover:text-background transition-colors">
                    Support Center
                  </Link>
                </li>
                <li>
                  <Link href="/feedback" className="text-muted hover:text-background transition-colors">
                    Feedback
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-muted hover:text-background transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/accessibility" className="text-muted hover:text-background transition-colors">
                    Accessibility
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-muted/20 mt-12 pt-8 text-center text-muted">
            <p>&copy; 2024 FoodHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
