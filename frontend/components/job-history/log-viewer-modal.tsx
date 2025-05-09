"use client"

import { useState, useEffect } from "react"
import { X, Search, Download } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface LogViewerModalProps {
  isOpen: boolean
  onClose: () => void
  runId: string | null
}

export function LogViewerModal({ isOpen, onClose, runId }: LogViewerModalProps) {
  const [logs, setLogs] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredLogs, setFilteredLogs] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen && runId) {
      setIsLoading(true)
      // Simulate fetching logs
      setTimeout(() => {
        const sampleLogs = [
          `[${new Date().toISOString()}] INFO: Job started for run ${runId}`,
          `[${new Date().toISOString()}] INFO: Connecting to target URL: https://example.com/products`,
          `[${new Date().toISOString()}] INFO: Successfully connected to target`,
          `[${new Date().toISOString()}] INFO: Parsing page structure`,
          `[${new Date().toISOString()}] INFO: Found 24 product elements on page`,
          `[${new Date().toISOString()}] INFO: Extracting data from elements`,
          `[${new Date().toISOString()}] INFO: Extracted product #1: iPhone 13 Pro`,
          `[${new Date().toISOString()}] INFO: Extracted product #2: Samsung Galaxy S22`,
          `[${new Date().toISOString()}] INFO: Extracted product #3: Google Pixel 6`,
          `[${new Date().toISOString()}] WARNING: Missing price data for product #4`,
          `[${new Date().toISOString()}] INFO: Extracted product #4: OnePlus 10 Pro (partial data)`,
          `[${new Date().toISOString()}] INFO: Extracted product #5: Xiaomi 12 Pro`,
          `[${new Date().toISOString()}] ERROR: Failed to extract image URL for product #6`,
          `[${new Date().toISOString()}] INFO: Retrying image extraction for product #6`,
          `[${new Date().toISOString()}] INFO: Successfully extracted image URL on retry`,
          `[${new Date().toISOString()}] INFO: Extracted product #6: Sony Xperia 1 IV`,
          `[${new Date().toISOString()}] INFO: Navigating to next page`,
          `[${new Date().toISOString()}] INFO: Processing page 2 of 3`,
          `[${new Date().toISOString()}] INFO: Found 18 product elements on page 2`,
          `[${new Date().toISOString()}] INFO: Extracting data from elements`,
          `[${new Date().toISOString()}] INFO: Navigating to next page`,
          `[${new Date().toISOString()}] INFO: Processing page 3 of 3`,
          `[${new Date().toISOString()}] INFO: Found 12 product elements on page 3`,
          `[${new Date().toISOString()}] INFO: Extracting data from elements`,
          `[${new Date().toISOString()}] INFO: All pages processed`,
          `[${new Date().toISOString()}] INFO: Total records extracted: 54`,
          `[${new Date().toISOString()}] INFO: Saving data to database`,
          `[${new Date().toISOString()}] INFO: Data successfully saved`,
          `[${new Date().toISOString()}] INFO: Job completed successfully for run ${runId}`,
        ]
        setLogs(sampleLogs)
        setFilteredLogs(sampleLogs)
        setIsLoading(false)
      }, 1000)
    }
  }, [isOpen, runId])

  useEffect(() => {
    if (searchTerm) {
      const filtered = logs.filter((log) => log.toLowerCase().includes(searchTerm.toLowerCase()))
      setFilteredLogs(filtered)
    } else {
      setFilteredLogs(logs)
    }
  }, [searchTerm, logs])

  const handleDownloadLogs = () => {
    // Create a blob with the logs
    const blob = new Blob([filteredLogs.join("\n")], { type: "text/plain" })
    const url = URL.createObjectURL(blob)

    // Create a link and trigger download
    const a = document.createElement("a")
    a.href = url
    a.download = `logs-${runId}.txt`
    document.body.appendChild(a)
    a.click()

    // Clean up
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Logs for Run #{runId}</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>

        <div className="flex items-center gap-2 my-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search logs..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" onClick={handleDownloadLogs} className="h-9 w-9">
            <Download className="h-4 w-4" />
            <span className="sr-only">Download Logs</span>
          </Button>
        </div>

        <div className="flex-1 overflow-auto mt-2 border rounded-md bg-black text-white font-mono text-sm p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-pulse text-gray-400">Loading logs...</div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-400">No logs matching your search criteria</div>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap">
              {filteredLogs.map((log, index) => {
                // Colorize log levels
                let logClass = ""
                if (log.includes("ERROR")) logClass = "text-red-400"
                else if (log.includes("WARNING")) logClass = "text-yellow-400"
                else if (log.includes("INFO")) logClass = "text-blue-400"

                return (
                  <div key={index} className={`py-0.5 ${logClass}`}>
                    {log}
                  </div>
                )
              })}
            </pre>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
