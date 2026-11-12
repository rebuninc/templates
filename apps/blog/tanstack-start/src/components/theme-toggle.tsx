import { Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { toggleTheme, useTheme } from "../lib/theme"

export function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useTheme()
  return (
    <button
      type="button"
      aria-label={
        theme === "light" ? "Ativar tema escuro" : "Ativar tema claro"
      }
      onClick={(e) => toggleTheme(e.currentTarget)}
      className={`press grid size-8 place-items-center rounded-full text-muted hover:text-fg ${className}`}
    >
      {/* CSS picks the icon so it is right before hydration. */}
      <HugeiconsIcon
        icon={Moon02Icon}
        size={18}
        className="in-data-[theme=dark]:hidden"
      />
      <HugeiconsIcon
        icon={Sun03Icon}
        size={18}
        className="in-data-[theme=light]:hidden"
      />
    </button>
  )
}
