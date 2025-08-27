import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>Manage your account settings.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center items-center h-64 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">Settings page functionality coming soon.</p>
        </div>
      </CardContent>
    </Card>
  )
}
