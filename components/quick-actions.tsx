import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, FileText, RefreshCw } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Link href="/invoices/create" passHref>
          <Button className="w-full justify-start bg-transparent" variant="outline">
            <PlusCircle className="h-4 w-4 mr-2" /> Create New Invoice
          </Button>
        </Link>
        <Button className="w-full justify-start bg-transparent" variant="outline">
          <FileText className="h-4 w-4 mr-2" /> Generate Sales Report
        </Button>
        <Button className="w-full justify-start bg-transparent" variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" /> Sync All Data
        </Button>
      </CardContent>
    </Card>
  )
}
