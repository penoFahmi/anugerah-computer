import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl group-[.toaster]:px-4 group-[.toaster]:py-3.5 group-[.toaster]:border-[0.5px] group-[.toaster]:gap-3",
          title: "group-[.toast]:font-semibold group-[.toast]:text-[14px]",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-[13px]",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:font-medium group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:rounded-md group-[.toast]:text-xs transition-colors hover:group-[.toast]:opacity-90",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:font-medium group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:rounded-md group-[.toast]:text-xs transition-colors hover:group-[.toast]:bg-muted/80",
          success: 
            "group-[.toaster]:!bg-emerald-50 group-[.toaster]:dark:!bg-emerald-950 group-[.toaster]:!border-emerald-200 group-[.toaster]:dark:!border-emerald-800 group-[.toaster]:!text-emerald-800 group-[.toaster]:dark:!text-emerald-300 [&_svg]:text-emerald-600 [&_svg]:dark:text-emerald-400",
          error: 
            "group-[.toaster]:!bg-rose-50 group-[.toaster]:dark:!bg-rose-950 group-[.toaster]:!border-rose-200 group-[.toaster]:dark:!border-rose-800 group-[.toaster]:!text-rose-800 group-[.toaster]:dark:!text-rose-300 [&_svg]:text-rose-600 [&_svg]:dark:text-rose-400",
          warning: 
            "group-[.toaster]:!bg-amber-50 group-[.toaster]:dark:!bg-amber-950 group-[.toaster]:!border-amber-200 group-[.toaster]:dark:!border-amber-800 group-[.toaster]:!text-amber-900 group-[.toaster]:dark:!text-amber-300 [&_svg]:text-amber-600 [&_svg]:dark:text-amber-400",
          info: 
            "group-[.toaster]:!bg-sky-50 group-[.toaster]:dark:!bg-sky-950 group-[.toaster]:!border-sky-200 group-[.toaster]:dark:!border-sky-800 group-[.toaster]:!text-sky-800 group-[.toaster]:dark:!text-sky-300 [&_svg]:text-sky-600 [&_svg]:dark:text-sky-400",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
