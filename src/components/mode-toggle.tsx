"use client"

import * as React from "react"
import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/components/ui/sidebar"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={cn("flex items-center p-1 rounded-xl bg-muted border border-border/50 shadow-inner h-[40px]", isCollapsed ? "w-10" : "w-full")} />
    )
  }

  if (isCollapsed) {
    return (
      <button
        onClick={(e) => {
          e.preventDefault()
          setTheme(theme === "light" ? "dark" : theme === "dark" ? "system" : "light")
        }}
        className="flex items-center justify-center w-8 h-8 rounded-lg bg-background text-foreground shadow-sm transition-all duration-300 ease-in-out border border-border/50 hover:bg-muted"
        title="Toggle Theme"
      >
        {theme === "light" ? <Sun className="h-4 w-4" /> : theme === "dark" ? <Moon className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
        <span className="sr-only">Toggle Theme</span>
      </button>
    )
  }

  return (
    <div className="flex items-center w-full p-1 rounded-xl bg-muted/60 border border-border/50 shadow-inner transition-colors duration-300">
      <button
        onClick={(e) => { e.preventDefault(); setTheme("light"); }}
        className={cn(
          "flex items-center justify-center w-full gap-2 h-8 rounded-lg transition-all duration-300 ease-in-out text-xs font-medium",
          theme === "light" 
            ? "bg-background text-foreground shadow-sm scale-100" 
            : "text-muted-foreground hover:bg-background/50 hover:text-foreground scale-95"
        )}
        title="Light Mode"
      >
        <Sun className="h-3.5 w-3.5" />
        Light
      </button>

      <button
        onClick={(e) => { e.preventDefault(); setTheme("system"); }}
        className={cn(
          "flex items-center justify-center w-full gap-2 h-8 rounded-lg transition-all duration-300 ease-in-out text-xs font-medium",
          (theme === "system" || !theme)
            ? "bg-background text-foreground shadow-sm scale-100" 
            : "text-muted-foreground hover:bg-background/50 hover:text-foreground scale-95"
        )}
        title="System Preference"
      >
        <Monitor className="h-3.5 w-3.5" />
        System
      </button>

      <button
        onClick={(e) => { e.preventDefault(); setTheme("dark"); }}
        className={cn(
          "flex items-center justify-center w-full gap-2 h-8 rounded-lg transition-all duration-300 ease-in-out text-xs font-medium",
          theme === "dark" 
            ? "bg-background text-foreground shadow-sm scale-100" 
            : "text-muted-foreground hover:bg-background/50 hover:text-foreground scale-95"
        )}
        title="Dark Mode"
      >
        <Moon className="h-3.5 w-3.5" />
        Dark
      </button>
    </div>
  )
}
