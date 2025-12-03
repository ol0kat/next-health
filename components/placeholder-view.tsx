import { Construction } from 'lucide-react'

interface PlaceholderViewProps {
  title: string
}

export function PlaceholderView({ title }: PlaceholderViewProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 text-muted-foreground">
      <div className="p-4 bg-muted rounded-full mb-4">
        <Construction className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-semibold mb-2">{title}</h2>
      <p>This page is currently under construction.</p>
    </div>
  )
}
