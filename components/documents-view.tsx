import { FileText, Download, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface Document {
  id: number | string
  title: string
  type: string
  date: string
  size: string
  doctor: string
  status: string
}

interface DocumentsViewProps {
  documents: Document[]
  onAddToCart?: (testName: string) => void
}

export function DocumentsView({ documents, onAddToCart }: DocumentsViewProps) {
  return (
    <div className="space-y-4">
      {documents.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No documents available</div>
      ) : (
        documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">{doc.title}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <span>{doc.type}</span>
                  <span>•</span>
                  <span>{doc.date}</span>
                  <span>•</span>
                  <span>{doc.size}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
