import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function EarningsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Earnings & Wallet</CardTitle>
        <CardDescription>View your earnings, payouts, and manage payment methods.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center items-center h-64 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">Earnings page functionality coming soon.</p>
        </div>
      </CardContent>
    </Card>
  )
}
