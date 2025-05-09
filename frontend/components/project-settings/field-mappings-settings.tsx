"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { GripVertical, Pencil, Trash2, Plus } from "lucide-react"
import type { ProjectSettings } from "@/app/projects/[id]/settings/page"

interface FieldMappingsSettingsProps {
  settings: ProjectSettings
  onChange: (settings: Partial<ProjectSettings>) => void
}

export function FieldMappingsSettings({ settings, onChange }: FieldMappingsSettingsProps) {
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false)
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null)
  const [ruleForm, setRuleForm] = useState({
    targetField: "",
    transformationType: "regex",
    parameters: "",
  })

  const transformationTypes = [
    { value: "regex", label: "Regular Expression" },
    { value: "trim", label: "Trim Whitespace" },
    { value: "replace", label: "Find and Replace" },
    { value: "extract", label: "Extract Substring" },
    { value: "date", label: "Date Format" },
    { value: "number", label: "Number Format" },
  ]

  const openAddRuleModal = () => {
    setRuleForm({
      targetField: "",
      transformationType: "regex",
      parameters: "",
    })
    setEditingRuleId(null)
    setIsRuleModalOpen(true)
  }

  const openEditRuleModal = (ruleId: string) => {
    const rule = settings.fieldMappings.find((r) => r.id === ruleId)
    if (rule) {
      setRuleForm({
        targetField: rule.targetField,
        transformationType: rule.transformationType,
        parameters: rule.parameters,
      })
      setEditingRuleId(ruleId)
      setIsRuleModalOpen(true)
    }
  }

  const handleDeleteRule = (ruleId: string) => {
    const updatedRules = settings.fieldMappings.filter((r) => r.id !== ruleId)
    onChange({
      fieldMappings: updatedRules,
    })
  }

  const handleSaveRule = () => {
    if (editingRuleId) {
      // Edit existing rule
      const updatedRules = settings.fieldMappings.map((r) => (r.id === editingRuleId ? { ...r, ...ruleForm } : r))
      onChange({
        fieldMappings: updatedRules,
      })
    } else {
      // Add new rule
      const newRule = {
        id: `rule-${Date.now()}`,
        ...ruleForm,
      }
      onChange({
        fieldMappings: [...settings.fieldMappings, newRule],
      })
    }
    setIsRuleModalOpen(false)
  }

  const handleMoveRule = (fromIndex: number, toIndex: number) => {
    if (
      fromIndex < 0 ||
      fromIndex >= settings.fieldMappings.length ||
      toIndex < 0 ||
      toIndex >= settings.fieldMappings.length
    ) {
      return
    }

    const updatedRules = [...settings.fieldMappings]
    const [movedItem] = updatedRules.splice(fromIndex, 1)
    updatedRules.splice(toIndex, 0, movedItem)

    onChange({
      fieldMappings: updatedRules,
    })
  }

  const getTransformationTypeLabel = (type: string) => {
    return transformationTypes.find((t) => t.value === type)?.label || type
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-[#4F46E5] mb-4">Field Mappings</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Configure transformations to apply to your scraped data fields.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-medium">Transformation Rules</h3>
          <Button onClick={openAddRuleModal} className="bg-[#4F46E5] hover:bg-[#4338CA]" size="sm">
            <Plus className="mr-1 h-4 w-4" />
            Add Rule
          </Button>
        </div>

        {settings.fieldMappings.length === 0 ? (
          <div className="text-center py-8 border rounded-md bg-muted/20">
            <p className="text-muted-foreground">No transformation rules added yet</p>
            <Button variant="link" onClick={openAddRuleModal} className="text-[#4F46E5]">
              Add your first rule
            </Button>
          </div>
        ) : (
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]"></TableHead>
                  <TableHead>Target Field</TableHead>
                  <TableHead>Transformation Type</TableHead>
                  <TableHead>Parameters</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settings.fieldMappings.map((rule, index) => (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <div className="flex items-center justify-center cursor-move">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{rule.targetField}</TableCell>
                    <TableCell>{getTransformationTypeLabel(rule.transformationType)}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {rule.parameters || <span className="text-muted-foreground">None</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditRuleModal(rule.id)}
                          className="h-8 w-8"
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteRule(rule.id)}
                          className="h-8 w-8 text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Drag and drop rules to change their order. Rules are applied in the order they appear.
        </p>
      </div>

      {/* Add/Edit Rule Modal */}
      <Dialog open={isRuleModalOpen} onOpenChange={setIsRuleModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingRuleId ? "Edit Rule" : "Add Rule"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="target-field">Target Field</Label>
              <Input
                id="target-field"
                value={ruleForm.targetField}
                onChange={(e) => setRuleForm({ ...ruleForm, targetField: e.target.value })}
                placeholder="e.g., price, title, description"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="transformation-type">Transformation Type</Label>
              <Select
                value={ruleForm.transformationType}
                onValueChange={(value) => setRuleForm({ ...ruleForm, transformationType: value })}
              >
                <SelectTrigger id="transformation-type">
                  <SelectValue placeholder="Select a transformation type" />
                </SelectTrigger>
                <SelectContent>
                  {transformationTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="parameters">Parameters</Label>
              <Input
                id="parameters"
                value={ruleForm.parameters}
                onChange={(e) => setRuleForm({ ...ruleForm, parameters: e.target.value })}
                placeholder={ruleForm.transformationType === "regex" ? "\\$([0-9.]+)" : ""}
              />
              <p className="text-xs text-muted-foreground">
                {ruleForm.transformationType === "regex" && "Regular expression pattern to extract data."}
                {ruleForm.transformationType === "replace" && "Format: 'find|replace'"}
                {ruleForm.transformationType === "extract" && "Format: 'startIndex,length' or 'startText|endText'"}
                {ruleForm.transformationType === "date" && "Date format string, e.g., 'YYYY-MM-DD'"}
                {ruleForm.transformationType === "number" && "Number format, e.g., '2' for 2 decimal places"}
                {ruleForm.transformationType === "trim" && "No parameters needed for trim operation"}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRuleModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveRule}
              disabled={!ruleForm.targetField}
              className="bg-[#4F46E5] hover:bg-[#4338CA]"
            >
              {editingRuleId ? "Update" : "Add"} Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
