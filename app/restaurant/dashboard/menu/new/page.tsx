import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MenuItemForm } from "@/components/restaurant/menu-item-form"

export default function NewMenuItemPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Menu Item</CardTitle>
          <CardDescription>Create a new menu item for your restaurant. Fill in all the details below.</CardDescription>
        </CardHeader>
        <CardContent>
          <MenuItemForm />
        </CardContent>
      </Card>
    </div>
  )
}
