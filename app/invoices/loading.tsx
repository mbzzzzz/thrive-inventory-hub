import { Loader2 } from "lucide-react"

export default function InvoicesLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="h-12 w-12 animate-spin text-thrive-500" />
      <p className="mt-4 text-lg text-muted-foreground">Loading invoices...</p>
    </div>
  )
}
