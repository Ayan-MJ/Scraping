import { Skeleton } from "@/components/ui/skeleton"
import type { ColumnDef } from "@/app/results-viewer/page"

interface TableSkeletonProps {
  columns: ColumnDef[]
}

export function TableSkeleton({ columns }: TableSkeletonProps) {
  return (
    <div className="rounded-md border bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              {columns.map((column) => (
                <th key={column.id} className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  {column.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <tr key={rowIndex} className="border-b">
                {columns.map((column, colIndex) => (
                  <td key={`${rowIndex}-${colIndex}`} className="px-4 py-3">
                    <Skeleton className="h-5 w-full max-w-[150px]" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
