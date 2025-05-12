"use client"

import type * as React from "react"
import { createContext, useContext, useState } from "react"

type ToastProps = {
  title: string
  description?: string
  variant?: "default" | "destructive"
}

type ToastContextProps = {
  toast: (props: ToastProps) => void
}

const ToastContext = createContext<ToastContextProps>({
  toast: () => {},
})

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [_toasts, setToasts] = useState<ToastProps[]>([])

  const toast = (props: ToastProps) => {
    setToasts((prev) => [...prev, props])
  }

  return <ToastContext.Provider value={{ toast }}>{children}</ToastContext.Provider>
}

export const useToast = () => {
  return useContext(ToastContext)
}
