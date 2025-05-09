"use client"

import { useState } from "react"
import { Check, Edit2, Save, Trash2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface UrlEntry {
  id: string
  url: string
  isValid: boolean
}

interface UrlListProps {
  urls: UrlEntry[]
  onUpdateUrl: (id: string, newUrl: string) => void
  onDeleteUrl: (id: string) => void
}

export function UrlList({ urls, onUpdateUrl, onDeleteUrl }: UrlListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [isValidEdit, setIsValidEdit] = useState(true)

  const validateUrl = (url: string) => {
    const isValid = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(url)
    setIsValidEdit(isValid)
    return isValid
  }

  const handleStartEdit = (url: UrlEntry) => {
    setEditingId(url.id)
    setEditValue(url.url)
    setIsValidEdit(url.isValid)
  }

  const handleSaveEdit = (id: string) => {
    if (isValidEdit) {
      onUpdateUrl(id, editValue)
      setEditingId(null)
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
  }

  if (urls.length === 0) {
    return (
      <div className="flex h-40 flex-col items-center justify-center rounded-md border border-dashed p-4 text-center">
        <p className="text-sm text-muted-foreground">No URLs added yet</p>
        <p className="text-xs text-muted-foreground mt-1">Add a URL using the form above</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60%]">URL</TableHead>
            <TableHead className="w-[20%]">Status</TableHead>
            <TableHead className="w-[20%] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {urls.map((url, index) => (
            <TableRow key={url.id} className={index % 2 === 0 ? "bg-muted/50" : ""}>
              <TableCell className="font-medium">
                {editingId === url.id ? (
                  <Input
                    value={editValue}
                    onChange={(e) => {
                      setEditValue(e.target.value)
                      validateUrl(e.target.value)
                    }}
                    className={`border-2 ${isValidEdit ? "border-green-500" : "border-red-500"}`}
                    autoFocus
                  />
                ) : (
                  <span className="font-mono text-sm">{url.url}</span>
                )}
              </TableCell>
              <TableCell>
                {url.isValid ? (
                  <div className="flex items-center text-green-600">
                    <Check className="mr-1 h-4 w-4" />
                    <span>Valid</span>
                  </div>
                ) : (
                  <div className="flex items-center text-amber-600">
                    <AlertTriangle className="mr-1 h-4 w-4" />
                    <span>Invalid</span>
                  </div>
                )}
              </TableCell>
              <TableCell className="text-right">
                {editingId === url.id ? (
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-green-600"
                      onClick={() => handleSaveEdit(url.id)}
                      disabled={!isValidEdit}
                    >
                      <Save className="h-4 w-4" />
                      <span className="sr-only">Save</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={handleCancelEdit}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Cancel</span>
                    </Button>
                  </div>
                ) : (
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleStartEdit(url)}>
                      <Edit2 className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600"
                      onClick={() => onDeleteUrl(url.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
