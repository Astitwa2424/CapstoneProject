import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChefHat, MapPin, Clock, DollarSign, Users, Briefcase, Heart } from "lucide-react"
import Link from "next/link"

export default function CareersPage() {
  const jobOpenings = [
    {
      title: "Senior Software Engineer",
      department: "Engineering",
      location: "San Francisco, CA",
      type: "Full-time",
      salary: "$120k - $180k",
      description: "Build scalable systems that power millions of food deliveries.",
    },
    {
      title: "Product Manager",
      department: "Product",
      location: "New York, NY",
      type: "Full-time",
      salary: "$110k - $160k",
      description: "Drive product strategy and roadmap for our customer experience.",
    },
    {
      title: "UX Designer",
      department: "Design",
      location: "Remote",
      type: "Full-time",
      salary: "$90k - $130k",
      description: "Create intuitive and delightful user experiences across all platforms.",
    },
    {
      title: "Data Scientist",
      department: "Analytics",
      location: "Seattle, WA",
      type: "Full-time",
      salary: "$100k - $150k",
      description: "Analyze data to optimize delivery routes and improve customer satisfaction.",
    },
    {
      title: "Marketing Manager",
      department: "Marketing",
      location: "Los Angeles, CA",
      type: "Full-time",
      salary: "$80k - $120k",
      description: "Drive growth through innovative marketing campaigns and partnerships.",
    },
    {
      title: "Customer Success Manager",
      department: "Support",
      location: "Austin, TX",
      type: "Full-time",
      salary: "$70k - $100k",
      description: "Ensure our restaurant partners and drivers have the best experience possible.",
    },
  ]

  const benefits = [
    {
      icon: Heart,
      title: "Health & Wellness",
      description: "Comprehensive health, dental, and vision insurance plus wellness programs.",
    },
    {
      icon: DollarSign,
      title: "Competitive Pay",
      description: "Market-competitive salaries with equity participation and performance bonuses.",
    },
    {
      icon: Clock,
      title: "Work-Life Balance",
      description: "Flexible working hours, remote work options, and unlimited PTO.",
    },
    {
      icon: Users,
      title: "Great Team",
      description: "Work with talented, passionate people who care about making a difference.",
    },
  ]

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

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 to-red-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Join Our Team</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Help us revolutionize food delivery and create amazing experiences for millions of users worldwide.
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            View Open Positions
          </Button>
        </div>
      </section>

      {/* Why Work With Us */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Why Work at Food Hub?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <Card key={index} className="text-center border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Open Positions */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Open Positions</h2>
        <div className="space-y-6">
          {jobOpenings.map((job, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                    <p className="text-gray-600 mb-4">{job.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        <Briefcase className="w-3 h-3 mr-1" />
                        {job.department}
                      </Badge>
                      <Badge variant="secondary">
                        <MapPin className="w-3 h-3 mr-1" />
                        {job.location}
                      </Badge>
                      <Badge variant="secondary">
                        <Clock className="w-3 h-3 mr-1" />
                        {job.type}
                      </Badge>
                      <Badge variant="secondary">
                        <DollarSign className="w-3 h-3 mr-1" />
                        {job.salary}
                      </Badge>
                    </div>
                  </div>
                  <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                    Apply Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Company Culture */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Culture</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Innovation First</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We encourage creative thinking and provide the resources to turn great ideas into reality.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Diversity & Inclusion</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We believe diverse teams build better products and create a more inclusive world.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Growth Mindset</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We invest in our people s growth through mentorship, training, and career development programs.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Application Process */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Application Process</h2>
        <div className="grid md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-orange-500">1</span>
            </div>
            <h3 className="font-semibold mb-2">Apply Online</h3>
            <p className="text-gray-600 text-sm">Submit your application and resume through our careers portal.</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-orange-500">2</span>
            </div>
            <h3 className="font-semibold mb-2">Phone Screen</h3>
            <p className="text-gray-600 text-sm">
              Initial conversation with our recruiting team about your background.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-orange-500">3</span>
            </div>
            <h3 className="font-semibold mb-2">Interviews</h3>
            <p className="text-gray-600 text-sm">Meet with team members and hiring managers to discuss the role.</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-orange-500">4</span>
            </div>
            <h3 className="font-semibold mb-2">Welcome!</h3>
            <p className="text-gray-600 text-sm">Join the Food Hub family and start making an impact from day one.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-orange-500 to-red-500 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Join Us?</h2>
          <p className="text-xl text-white/90 mb-8">
            Don t see a role that fits? Send us your resume and we will keep you in mind for future opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              View All Positions
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent border-white text-white hover:bg-white hover:text-orange-500"
            >
              Send Resume
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
