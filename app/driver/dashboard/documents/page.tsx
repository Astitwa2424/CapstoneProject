import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DocumentsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents</CardTitle>
        <CardDescription>Manage your required documents for verification.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center items-center h-64 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">Document management functionality coming soon.</p>
        </div>
      </CardContent>
    </Card>
  )
}
