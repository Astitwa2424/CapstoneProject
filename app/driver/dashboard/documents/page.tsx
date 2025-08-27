"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  X,
  Eye,
  Download,
  Clock,
  Shield,
  Car,
  CreditCard,
  User,
  Camera,
} from "lucide-react"

interface Document {
  id: string
  name: string
  description: string
  required: boolean
  uploaded: boolean
  status: "pending" | "approved" | "rejected" | "expired"
  file?: File
  uploadedAt?: string
  expiryDate?: string
  rejectionReason?: string
  icon: React.ComponentType<{ className?: string }>
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "license",
      name: "Driver's License",
      description: "Valid driver's license with clear photo and readable text",
      required: true,
      uploaded: false,
      status: "pending",
      icon: Shield,
    },
    {
      id: "insurance",
      name: "Vehicle Insurance",
      description: "Current vehicle insurance certificate or policy document",
      required: true,
      uploaded: false,
      status: "pending",
      icon: Car,
    },
    {
      id: "registration",
      name: "Vehicle Registration",
      description: "Official vehicle registration document",
      required: true,
      uploaded: false,
      status: "pending",
      icon: FileText,
    },
    {
      id: "background",
      name: "Background Check Authorization",
      description: "Signed authorization form for background verification",
      required: true,
      uploaded: false,
      status: "pending",
      icon: Shield,
    },
    {
      id: "profile_photo",
      name: "Profile Photo",
      description: "Clear headshot photo for your driver profile",
      required: true,
      uploaded: false,
      status: "pending",
      icon: User,
    },
    {
      id: "vehicle_photo",
      name: "Vehicle Photo",
      description: "Clear photo of your delivery vehicle",
      required: true,
      uploaded: false,
      status: "pending",
      icon: Camera,
    },
    {
      id: "bank_info",
      name: "Bank Account Information",
      description: "Bank account details for payment processing",
      required: false,
      uploaded: false,
      status: "pending",
      icon: CreditCard,
    },
  ])

  const [activeTab, setActiveTab] = useState("upload")
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})

  const handleFileUpload = async (documentId: string, file: File) => {
    // Simulate upload progress
    setUploadProgress((prev) => ({ ...prev, [documentId]: 0 }))

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        const currentProgress = prev[documentId] || 0
        if (currentProgress >= 100) {
          clearInterval(interval)
          // Update document status after upload completes
          setDocuments((prevDocs) =>
            prevDocs.map((doc) =>
              doc.id === documentId
                ? {
                    ...doc,
                    uploaded: true,
                    file,
                    status: "pending" as const,
                    uploadedAt: new Date().toISOString(),
                  }
                : doc,
            ),
          )
          return { ...prev, [documentId]: 100 }
        }
        return { ...prev, [documentId]: currentProgress + 10 }
      })
    }, 200)
  }

  const removeDocument = (documentId: string) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === documentId
          ? { ...doc, uploaded: false, file: undefined, status: "pending" as const, uploadedAt: undefined }
          : doc,
      ),
    )
    setUploadProgress((prev) => {
      const newProgress = { ...prev }
      delete newProgress[documentId]
      return newProgress
    })
  }

  const getStatusBadge = (status: string, uploaded: boolean) => {
    if (!uploaded) return <Badge variant="secondary">Not Uploaded</Badge>

    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>
      case "expired":
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Expired</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Under Review</Badge>
    }
  }

  const getStatusIcon = (status: string, uploaded: boolean) => {
    if (!uploaded) return <Upload className="w-5 h-5 text-gray-400" />

    switch (status) {
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "rejected":
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case "expired":
        return <Clock className="w-5 h-5 text-orange-500" />
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />
    }
  }

  const requiredDocs = documents.filter((doc) => doc.required)
  const uploadedRequired = requiredDocs.filter((doc) => doc.uploaded).length
  const approvedRequired = requiredDocs.filter((doc) => doc.status === "approved").length
  const rejectedDocs = documents.filter((doc) => doc.status === "rejected")
  const expiredDocs = documents.filter((doc) => doc.status === "expired")

  const overallProgress = (approvedRequired / requiredDocs.length) * 100

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Document Management</h1>
          <p className="text-gray-600">Upload and manage your verification documents</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download Forms
          </Button>
        </div>
      </div>

      {/* Alerts for rejected/expired documents */}
      {rejectedDocs.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {rejectedDocs.length} document{rejectedDocs.length > 1 ? "s" : ""} rejected. Please review and re-upload.
          </AlertDescription>
        </Alert>
      )}

      {expiredDocs.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <Clock className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            {expiredDocs.length} document{expiredDocs.length > 1 ? "s" : ""} expired. Please upload updated versions.
          </AlertDescription>
        </Alert>
      )}

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Verification Progress
          </CardTitle>
          <CardDescription>Complete all required documents to start delivering</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {uploadedRequired}/{requiredDocs.length}
              </p>
              <p className="text-sm text-gray-600">Uploaded</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{uploadedRequired - approvedRequired}</p>
              <p className="text-sm text-gray-600">Under Review</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{approvedRequired}</p>
              <p className="text-sm text-gray-600">Approved</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{rejectedDocs.length}</p>
              <p className="text-sm text-gray-600">Rejected</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
            <p className="text-sm text-gray-600">
              {approvedRequired === requiredDocs.length
                ? "All required documents approved! You can start delivering."
                : `${requiredDocs.length - approvedRequired} more documents needed for approval`}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Document Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload Documents</TabsTrigger>
          <TabsTrigger value="status">Review Status</TabsTrigger>
          <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          {documents.map((document) => {
            const IconComponent = document.icon
            const isUploading = uploadProgress[document.id] !== undefined && uploadProgress[document.id] < 100

            return (
              <Card key={document.id} className={document.status === "rejected" ? "border-red-200" : ""}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <IconComponent className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{document.name}</h3>
                          {document.required && (
                            <Badge variant="outline" className="text-xs">
                              Required
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{document.description}</p>

                        {document.uploaded && document.file && (
                          <div className="text-sm text-gray-500">
                            <p>File: {document.file.name}</p>
                            {document.uploadedAt && (
                              <p>Uploaded: {new Date(document.uploadedAt).toLocaleDateString()}</p>
                            )}
                          </div>
                        )}

                        {isUploading && (
                          <div className="mt-2">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Uploading...</span>
                              <span>{uploadProgress[document.id]}%</span>
                            </div>
                            <Progress value={uploadProgress[document.id]} className="h-2" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {getStatusBadge(document.status, document.uploaded)}

                      {document.uploaded && !isUploading ? (
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeDocument(document.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : !isUploading ? (
                        <div className="flex items-center space-x-2">
                          <Input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            id={`file-${document.id}`}
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleFileUpload(document.id, file)
                            }}
                          />
                          <Label htmlFor={`file-${document.id}`}>
                            <Button size="sm" asChild>
                              <span>
                                <Upload className="w-4 h-4 mr-2" />
                                Upload
                              </span>
                            </Button>
                          </Label>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {document.status === "rejected" && document.rejectionReason && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">
                        <strong>Rejection Reason:</strong>{" "}
                        {document.rejectionReason || "Document quality is too low. Please upload a clearer image."}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Status Overview</CardTitle>
              <CardDescription>Track the approval status of all your documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {documents
                  .filter((doc) => doc.uploaded)
                  .map((document) => {
                    const IconComponent = document.icon
                    return (
                      <div key={document.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <IconComponent className="w-5 h-5 text-gray-600" />
                          <div>
                            <p className="font-medium">{document.name}</p>
                            {document.uploadedAt && (
                              <p className="text-sm text-gray-500">
                                Uploaded {new Date(document.uploadedAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(document.status, document.uploaded)}
                          {getStatusBadge(document.status, document.uploaded)}
                        </div>
                      </div>
                    )
                  })}

                {documents.filter((doc) => doc.uploaded).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No documents uploaded yet</p>
                    <p className="text-sm">Upload your documents to see their status here</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guidelines" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Upload Guidelines</CardTitle>
              <CardDescription>Follow these guidelines for successful document approval</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">File Requirements</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Accepted formats: PDF, JPG, JPEG, PNG</li>
                  <li>• Maximum file size: 10MB per document</li>
                  <li>• Minimum resolution: 1200x800 pixels for photos</li>
                  <li>• Documents must be in color (not black and white)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Quality Standards</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• All text must be clearly readable</li>
                  <li>• No blurry, dark, or cut-off images</li>
                  <li>• Documents must be current and not expired</li>
                  <li>• Photos should be well-lit with no shadows</li>
                  <li>• Ensure all four corners of the document are visible</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Processing Information</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Review time: 1-3 business days</li>
                  <li>• You'll receive email notifications for status updates</li>
                  <li>• Rejected documents can be re-uploaded immediately</li>
                  <li>• Contact support if you need help with document requirements</li>
                </ul>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  All documents are securely encrypted and stored in compliance with privacy regulations. Your personal
                  information is protected and only used for verification purposes.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Submit Button */}
      {uploadedRequired === requiredDocs.length && approvedRequired < requiredDocs.length && (
        <div className="flex justify-center">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Shield className="w-4 h-4 mr-2" />
            Submit for Review
          </Button>
        </div>
      )}
    </div>
  )
}
