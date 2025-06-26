"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, CheckCircle, AlertCircle, X } from "lucide-react"

interface DocumentUploadProps {
  userType: "driver" | "restaurant"
}

interface Document {
  id: string
  name: string
  required: boolean
  uploaded: boolean
  status: "pending" | "approved" | "rejected"
  file?: File
}

export function DocumentUpload({ userType }: DocumentUploadProps) {
  const [documents, setDocuments] = useState<Document[]>(
    userType === "driver"
      ? [
          { id: "license", name: "Driver's License", required: true, uploaded: false, status: "pending" },
          { id: "insurance", name: "Vehicle Insurance", required: true, uploaded: false, status: "pending" },
          { id: "registration", name: "Vehicle Registration", required: true, uploaded: false, status: "pending" },
          {
            id: "background",
            name: "Background Check Authorization",
            required: true,
            uploaded: false,
            status: "pending",
          },
          { id: "photo", name: "Profile Photo", required: true, uploaded: false, status: "pending" },
          { id: "vehicle_photo", name: "Vehicle Photo", required: true, uploaded: false, status: "pending" },
        ]
      : [
          { id: "business_license", name: "Business License", required: true, uploaded: false, status: "pending" },
          { id: "food_permit", name: "Food Service Permit", required: true, uploaded: false, status: "pending" },
          { id: "tax_id", name: "Tax ID Certificate", required: true, uploaded: false, status: "pending" },
          { id: "menu", name: "Current Menu", required: true, uploaded: false, status: "pending" },
          { id: "insurance", name: "General Liability Insurance", required: true, uploaded: false, status: "pending" },
          { id: "bank_info", name: "Bank Account Information", required: true, uploaded: false, status: "pending" },
          {
            id: "health_permit",
            name: "Health Department Permit",
            required: false,
            uploaded: false,
            status: "pending",
          },
        ],
  )

  const handleFileUpload = (documentId: string, file: File) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === documentId ? { ...doc, uploaded: true, file, status: "pending" as const } : doc)),
    )
  }

  const removeDocument = (documentId: string) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === documentId ? { ...doc, uploaded: false, file: undefined, status: "pending" as const } : doc,
      ),
    )
  }

  const getStatusBadge = (status: string, uploaded: boolean) => {
    if (!uploaded) return <Badge variant="secondary">Not Uploaded</Badge>

    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-700">Approved</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-700">Rejected</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-700">Under Review</Badge>
    }
  }

  const getStatusIcon = (status: string, uploaded: boolean) => {
    if (!uploaded) return <Upload className="w-5 h-5 text-gray-400" />

    switch (status) {
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "rejected":
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <FileText className="w-5 h-5 text-yellow-500" />
    }
  }

  const requiredDocs = documents.filter((doc) => doc.required)
  const uploadedRequired = requiredDocs.filter((doc) => doc.uploaded).length
  const approvedRequired = requiredDocs.filter((doc) => doc.status === "approved").length

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Document Verification Progress</CardTitle>
          <CardDescription>Upload all required documents to complete your {userType} verification</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {uploadedRequired}/{requiredDocs.length}
              </p>
              <p className="text-sm text-gray-600">Documents Uploaded</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{uploadedRequired - approvedRequired}</p>
              <p className="text-sm text-gray-600">Under Review</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{approvedRequired}</p>
              <p className="text-sm text-gray-600">Approved</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(approvedRequired / requiredDocs.length) * 100}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {approvedRequired === requiredDocs.length
                ? "All required documents approved! 🎉"
                : `${requiredDocs.length - approvedRequired} more documents needed for approval`}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Document List */}
      <div className="space-y-4">
        {documents.map((document) => (
          <Card key={document.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(document.status, document.uploaded)}
                  <div>
                    <h3 className="font-semibold flex items-center space-x-2">
                      <span>{document.name}</span>
                      {document.required && (
                        <Badge variant="outline" className="text-xs">
                          Required
                        </Badge>
                      )}
                    </h3>
                    {document.uploaded && document.file && (
                      <p className="text-sm text-gray-600">{document.file.name}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {getStatusBadge(document.status, document.uploaded)}

                  {document.uploaded ? (
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => removeDocument(document.id)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
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
                  )}
                </div>
              </div>

              {document.status === "rejected" && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">
                    <strong>Rejection Reason:</strong> Document quality is too low. Please upload a clearer image.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upload Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Accepted formats: PDF, JPG, JPEG, PNG</li>
            <li>• Maximum file size: 10MB per document</li>
            <li>• Ensure documents are clear and readable</li>
            <li>• All information must be visible and not cut off</li>
            <li>• Documents must be current and not expired</li>
            <li>• Processing time: 1-3 business days</li>
          </ul>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-center">
        <Button
          size="lg"
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          disabled={uploadedRequired < requiredDocs.length}
        >
          Submit for Review
        </Button>
      </div>
    </div>
  )
}
