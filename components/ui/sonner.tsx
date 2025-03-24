"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {

  return (
    <Sonner
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--success-bg": "var(--toast-success-bg)",
          "--success-text": "var(--toast-success-text)",
          "--success-border": "var(--toast-success-border)",
          "--warning-bg": "var(--toast-warning-bg)",
          "--warning-text": "var(--toast-warning-text)",
          "--warning-border": "var(--toast-warning-border)",
          "--error-bg": "var(--toast-error-bg)",
          "--error-text": "var(--toast-error-text)",
          "--error-border": "var(--toast-error-border)",
          "--info-bg": "var(--toast-info-bg)",
          "--info-text": "var(--toast-info-text)",
          "--info-border": "var(--toast-info-border)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
