import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface TableSkeletonProps {
  columns?: number
  rows?: number
}

export function TableSkeleton({ columns = 5, rows = 5 }: TableSkeletonProps) {
  return (
    <div className="w-full relative">
        <Table>
            <TableHeader className="bg-muted/50">
            <TableRow>
                {Array.from({ length: columns }).map((_, i) => (
                <TableHead key={i}>
                    <Skeleton className="h-4 w-[100px]" />
                </TableHead>
                ))}
            </TableRow>
            </TableHeader>
            <TableBody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                    <TableCell key={colIndex}>
                    <div className="flex items-center gap-3">
                        {colIndex === 0 && (
                        <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                        )}
                        <div className="space-y-2 w-full">
                        <Skeleton className="h-4 w-3/4" />
                        {colIndex === 0 && <Skeleton className="h-3 w-1/2" />}
                        </div>
                    </div>
                    </TableCell>
                ))}
                </TableRow>
            ))}
            </TableBody>
        </Table>
    </div>
  )
}
