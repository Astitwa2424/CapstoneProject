"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  HelpCircle,
  MessageCircle,
  Phone,
  Mail,
  FileText,
  Video,
  Search,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  Download,
  ExternalLink,
} from "lucide-react"
import { toast } from "sonner"

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
}

interface SupportTicket {
  id: string
  subject: string
  status: "open" | "in-progress" | "resolved"
  priority: "low" | "medium" | "high"
  createdAt: string
  lastUpdate: string
}

const faqs: FAQ[] = [
  {
    id: "1",
    question: "How do I update my menu items?",
    answer:
      "Go to Menu Management in your dashboard. You can add, edit, or remove items, update prices, and manage availability. Changes are reflected immediately on your storefront.",
    category: "menu",
  },
  {
    id: "2",
    question: "How do I change my restaurant's operating hours?",
    answer:
      "Navigate to Account & Settings > Hours tab. You can set different hours for each day of the week and toggle days on/off. Your restaurant status will automatically update based on these hours.",
    category: "settings",
  },
  {
    id: "3",
    question: "What payment methods are supported?",
    answer:
      "We support all major credit cards, debit cards, and cash on delivery. You can configure which payment methods to accept in your Account & Settings.",
    category: "payments",
  },
  {
    id: "4",
    question: "How do I handle order cancellations?",
    answer:
      "You can cancel orders from the Live Orders board before they're marked as 'Preparing'. For orders already in progress, contact our support team for assistance.",
    category: "orders",
  },
  {
    id: "5",
    question: "How do I print kitchen dockets?",
    answer:
      "Kitchen dockets can be printed from the Orders page > Kitchen Dockets tab. You can print individual dockets or all at once. Make sure your thermal printer is properly connected.",
    category: "orders",
  },
]

const supportTickets: SupportTicket[] = [
  {
    id: "TICK-001",
    subject: "Payment processing issue",
    status: "in-progress",
    priority: "high",
    createdAt: "2024-01-15T10:30:00Z",
    lastUpdate: "2024-01-15T14:20:00Z",
  },
  {
    id: "TICK-002",
    subject: "Menu item not displaying correctly",
    status: "resolved",
    priority: "medium",
    createdAt: "2024-01-14T16:45:00Z",
    lastUpdate: "2024-01-15T09:15:00Z",
  },
]

const statusConfig = {
  open: { color: "bg-blue-100 text-blue-800", icon: AlertCircle },
  "in-progress": { color: "bg-yellow-100 text-yellow-800", icon: Clock },
  resolved: { color: "bg-green-100 text-green-800", icon: CheckCircle },
}

const priorityConfig = {
  low: { color: "bg-gray-100 text-gray-800" },
  medium: { color: "bg-orange-100 text-orange-800" },
  high: { color: "bg-red-100 text-red-800" },
}

export function SupportCenter() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [ticketForm, setTicketForm] = useState({
    subject: "",
    category: "",
    priority: "",
    description: "",
  })

  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleSubmitTicket = () => {
    if (!ticketForm.subject || !ticketForm.category || !ticketForm.description) {
      toast.error("Please fill in all required fields")
      return
    }

    // In a real app, this would submit to your API
    toast.success("Support ticket submitted successfully! We'll get back to you within 24 hours.")
    setTicketForm({ subject: "", category: "", priority: "", description: "" })
  }

  return (
    <Tabs defaultValue="faq" className="space-y-4">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="faq">
          <HelpCircle className="h-4 w-4 mr-2" />
          FAQ
        </TabsTrigger>
        <TabsTrigger value="contact">
          <MessageCircle className="h-4 w-4 mr-2" />
          Contact Support
        </TabsTrigger>
        <TabsTrigger value="tickets">
          <FileText className="h-4 w-4 mr-2" />
          My Tickets
        </TabsTrigger>
        <TabsTrigger value="resources">
          <Video className="h-4 w-4 mr-2" />
          Resources
        </TabsTrigger>
      </TabsList>

      <TabsContent value="faq" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>Find quick answers to common questions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="menu">Menu Management</SelectItem>
                  <SelectItem value="orders">Orders & Kitchen</SelectItem>
                  <SelectItem value="settings">Settings</SelectItem>
                  <SelectItem value="payments">Payments</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              {filteredFAQs.map((faq) => (
                <Card key={faq.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-2">{faq.question}</h4>
                        <p className="text-sm text-gray-600">{faq.answer}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 mt-1" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredFAQs.length === 0 && (
              <div className="text-center py-8">
                <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No FAQs found</h3>
                <p className="text-gray-500">Try adjusting your search or contact support for help.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="contact" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Submit a Support Ticket</CardTitle>
              <CardDescription>Get personalized help from our support team</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm((prev) => ({ ...prev, subject: e.target.value }))}
                  placeholder="Brief description of your issue"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={ticketForm.category}
                    onValueChange={(value) => setTicketForm((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical Issue</SelectItem>
                      <SelectItem value="billing">Billing & Payments</SelectItem>
                      <SelectItem value="orders">Order Management</SelectItem>
                      <SelectItem value="account">Account Settings</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={ticketForm.priority}
                    onValueChange={(value) => setTicketForm((prev) => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Please provide detailed information about your issue..."
                  rows={4}
                />
              </div>

              <Button onClick={handleSubmitTicket} className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Submit Ticket
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Other Ways to Reach Us</CardTitle>
              <CardDescription>Choose the best way to get in touch</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Phone className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium">Phone Support</div>
                  <div className="text-sm text-gray-600">+1 (555) 123-FOOD</div>
                  <div className="text-xs text-gray-500">Mon-Fri 9AM-6PM EST</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Mail className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium">Email Support</div>
                  <div className="text-sm text-gray-600">support@foodhub.com</div>
                  <div className="text-xs text-gray-500">Response within 24 hours</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <MessageCircle className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="font-medium">Live Chat</div>
                  <div className="text-sm text-gray-600">Available 24/7</div>
                  <div className="text-xs text-gray-500">Instant responses</div>
                </div>
              </div>

              <Button variant="outline" className="w-full">
                <MessageCircle className="h-4 w-4 mr-2" />
                Start Live Chat
              </Button>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="tickets" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>My Support Tickets</CardTitle>
            <CardDescription>Track the status of your support requests</CardDescription>
          </CardHeader>
          <CardContent>
            {supportTickets.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Support Tickets</h3>
                <p className="text-gray-500">You haven't submitted any support tickets yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {supportTickets.map((ticket) => {
                  const StatusIcon = statusConfig[ticket.status].icon
                  return (
                    <Card key={ticket.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium">{ticket.id}</span>
                              <Badge className={statusConfig[ticket.status].color}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {ticket.status.replace("-", " ").toUpperCase()}
                              </Badge>
                              <Badge className={priorityConfig[ticket.priority].color}>
                                {ticket.priority.toUpperCase()}
                              </Badge>
                            </div>
                            <h4 className="font-medium text-gray-900 mb-1">{ticket.subject}</h4>
                            <div className="text-sm text-gray-600">
                              Created: {new Date(ticket.createdAt).toLocaleDateString()} • Last update:{" "}
                              {new Date(ticket.lastUpdate).toLocaleDateString()}
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="resources" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Video className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Video Tutorials</h3>
              <p className="text-sm text-gray-600 mb-4">Step-by-step guides for using the platform</p>
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                Watch Videos
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <FileText className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">User Manual</h3>
              <p className="text-sm text-gray-600 mb-4">Comprehensive documentation and guides</p>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <HelpCircle className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Best Practices</h3>
              <p className="text-sm text-gray-600 mb-4">Tips for optimizing your restaurant operations</p>
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                Read Guide
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Start Guide</CardTitle>
            <CardDescription>Essential steps to get your restaurant up and running</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <div>
                  <h4 className="font-medium">Complete Your Profile</h4>
                  <p className="text-sm text-gray-600">Add restaurant details, contact information, and location</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <div>
                  <h4 className="font-medium">Set Operating Hours</h4>
                  <p className="text-sm text-gray-600">Configure when your restaurant accepts orders</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <div>
                  <h4 className="font-medium">Add Menu Items</h4>
                  <p className="text-sm text-gray-600">Upload your menu with photos, descriptions, and prices</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  4
                </div>
                <div>
                  <h4 className="font-medium">Test Order Management</h4>
                  <p className="text-sm text-gray-600">Familiarize yourself with the order processing workflow</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium">
                  ✓
                </div>
                <div>
                  <h4 className="font-medium">Go Live!</h4>
                  <p className="text-sm text-gray-600">Open your restaurant and start accepting orders</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
