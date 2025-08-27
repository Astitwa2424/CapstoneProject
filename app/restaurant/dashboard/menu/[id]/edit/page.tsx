import { notFound } from "next/navigation"
import { getMenuItemById } from "@/app/restaurant/actions"
import { MenuItemForm } from "@/components/restaurant/menu-item-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface EditMenuItemPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditMenuItemPage({ params }: EditMenuItemPageProps) {
  const { id } = await params
  const result = await getMenuItemById(id)

  if (!result.success || !result.menuItem) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Menu Item</CardTitle>
          <CardDescription>Update the details for &quot;{result.menuItem.name}&quot; below.</CardDescription>
        </CardHeader>
        <CardContent>
          <MenuItemForm initialData={result.menuItem} />
        </CardContent>
      </Card>
    </div>
  )
}
