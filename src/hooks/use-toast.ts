// src/hooks/use-toast.ts
"use client"

import { toast as sonnerToast } from "sonner"

export function useToast() {
  return {
    toast: sonnerToast
  }
}
