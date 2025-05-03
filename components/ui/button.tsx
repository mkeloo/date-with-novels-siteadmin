import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive active:scale-90 transition-transform duration-200",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        // NEW ADDITIONS:
        success:
          "bg-green-600 text-white shadow-xs hover:bg-green-700 focus-visible:ring-green-400/20 dark:bg-green-500 dark:hover:bg-green-600 dark:focus-visible:ring-green-500/40",
        info:
          "bg-blue-600 text-white shadow-xs hover:bg-sky-700 focus-visible:ring-sky-400/20 dark:bg-blue-500 dark:hover:bg-sky-600 dark:focus-visible:ring-sky-500/40",
        warning:
          "bg-yellow-500 text-black shadow-xs hover:bg-yellow-600 focus-visible:ring-yellow-400/20 dark:bg-yellow-500 dark:hover:bg-yellow-600 dark:focus-visible:ring-yellow-500/40",
        purple:
          "bg-purple-600 text-white shadow-xs hover:bg-purple-700 focus-visible:ring-purple-400/20 dark:bg-purple-500 dark:hover:bg-purple-600 dark:focus-visible:ring-purple-500/40",
        pink:
          "bg-pink-500 text-white shadow-xs hover:bg-pink-600 focus-visible:ring-pink-400/20 dark:bg-pink-500 dark:hover:bg-pink-600 dark:focus-visible:ring-pink-500/40",
        neutral:
          "bg-gray-500 text-white shadow-xs hover:bg-gray-600 focus-visible:ring-gray-400/20 dark:bg-gray-500 dark:hover:bg-gray-600 dark:focus-visible:ring-gray-500/40",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface ButtonProps extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  disableLoader?: boolean;  // Optional prop to disable loader
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disableLoader = false,
  children,
  onClick,
  ...props
}: ButtonProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const Comp = asChild ? Slot : "button"

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disableLoader) {
      onClick?.(e)
      return
    }

    setIsLoading(true)
    try {
      await Promise.resolve(onClick?.(e))
    } finally {
      setTimeout(() => setIsLoading(false), 500) // Loader visible for 500ms minimum
    }
  }

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={isLoading || loading || props.disabled}
      onClick={handleClick}
      {...props}
    >
      {(loading || isLoading) && <Loader2 className="mr-2 size-4 animate-spin" />}
      {children}
    </Comp>
  )
}

export { Button, buttonVariants }