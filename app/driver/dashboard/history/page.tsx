import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function OrderHistoryPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order History</CardTitle>
        <CardDescription>View and manage your delivery history.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center items-center h-64 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">Order History functionality coming soon.</p>
        </div>
      </CardContent>
    </Card>
  )
}
