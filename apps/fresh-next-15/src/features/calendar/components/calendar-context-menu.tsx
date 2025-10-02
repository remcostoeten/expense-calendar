"use client"

import { useState } from "react"
import {
  RiEditLine,
  RiDeleteBinLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiMoreLine,
} from "@remixicon/react"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import type { Calendar } from "@/stores/calendar-store"
import { EditCalendarModal } from "./edit-calendar-modal"

type TProps = {
  calendar: Calendar
  onReorder: (calendarId: string, direction: 'up' | 'down') => void
  onEdit: (calendar: Calendar) => void
  onDelete: (calendarId: string) => void
  children: React.ReactNode
}

export function CalendarContextMenu({
  calendar,
  onReorder,
  onEdit,
  onDelete,
  children,
}: TProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  const handleDeleteConfirm = () => {
    onDelete(calendar.id)
    setShowDeleteDialog(false)
  }

  const handleEdit = () => {
    onEdit(calendar)
    setShowEditModal(true)
  }

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          {children}
        </ContextMenuTrigger>
        <ContextMenuContent className="w-48">
          <ContextMenuItem onClick={handleEdit}>
            <RiEditLine className="mr-2 h-4 w-4" />
            Edit calendar
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => onReorder(calendar.id, 'up')}>
            <RiArrowUpLine className="mr-2 h-4 w-4" />
            Move up
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onReorder(calendar.id, 'down')}>
            <RiArrowDownLine className="mr-2 h-4 w-4" />
            Move down
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <RiDeleteBinLine className="mr-2 h-4 w-4" />
            Delete calendar
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Calendar</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{calendar.name}"? This action cannot be undone and will permanently remove all calendar items associated with this calendar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditCalendarModal
        calendar={calendar}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={(updatedCalendar: any) => {
          onEdit(updatedCalendar)
          setShowEditModal(false)
        }}
      />
    </>
  )
}
