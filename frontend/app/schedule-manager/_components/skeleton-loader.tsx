"use client"

import { Skeleton } from "@/components/ui/skeleton"
import type { ViewMode } from "@/app/schedule-manager/page"

interface SkeletonLoaderProps {
  viewMode: ViewMode
}

export function SkeletonLoader({ viewMode }: SkeletonLoaderProps) {
  if (viewMode === "calendar") {
    return (
      <div className="space-y-6">
        {/* Calendar Header Skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-40" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>

        {/* Calendar Grid Skeleton */}
        <div className="rounded-lg border bg-white overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="py-2 text-center">
                <Skeleton className="h-5 w-8 mx-auto" />
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 grid-rows-6">
            {Array.from({ length: 42 }).map((_, i) => (
              <div key={i} className="h-24 sm:h-32 p-2 border-r border-b relative">
                <Skeleton className="h-5 w-5 absolute top-2 left-2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-md border bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left">
                <Skeleton className="h-5 w-32" />
              </th>
              <th className="px-4 py-3 text-left">
                <Skeleton className="h-5 w-24" />
              </th>
              <th className="px-4 py-3 text-left">
                <Skeleton className="h-5 w-24" />
              </th>
              <th className="px-4 py-3 text-left">
                <Skeleton className="h-5 w-16" />
              </th>
              <th className="px-4 py-3 text-right">
                <Skeleton className="h-5 w-20 ml-auto" />
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b">
                <td className="px-4 py-3">
                  <Skeleton className="h-5 w-40" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-5 w-32" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-5 w-36" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-7 w-24 rounded-full" />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
