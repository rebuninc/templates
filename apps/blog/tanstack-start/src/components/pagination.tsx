import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Link } from "@tanstack/react-router"

const pill =
  "press flex items-center gap-1 rounded-full border border-line px-3.5 py-1.5 hover:bg-surface aria-disabled:pointer-events-none aria-disabled:opacity-40"

// Page 1 has no ?page in the URL, so links stay clean.
const search = (page: number) => ({ page: page > 1 ? page : undefined })

export function Pagination({ page, pages }: { page: number; pages: number }) {
  if (pages <= 1) return null
  return (
    <nav
      aria-label="Paginação"
      className="flex items-center justify-center gap-4 text-sm font-[510]"
    >
      <Link
        to="."
        search={search(page - 1)}
        aria-disabled={page <= 1}
        className={pill}
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
        Anterior
      </Link>
      <span className="text-muted">
        Página {page} de {pages}
      </span>
      <Link
        to="."
        search={search(page + 1)}
        aria-disabled={page >= pages}
        className={pill}
      >
        Próxima
        <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
      </Link>
    </nav>
  )
}
