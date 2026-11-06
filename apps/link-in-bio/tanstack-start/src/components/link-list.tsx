import { ArrowDown01Icon, ArrowUp01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Link, useRouter } from "@tanstack/react-router"
import { AnimatePresence, motion } from "motion/react"
import { useState } from "react"
import { deleteLink, type LinkView, moveLink } from "@/lib/links"
import { spring } from "@/lib/motion"

const action =
  "press rounded-full border border-line px-3 py-1.5 hover:bg-surface disabled:opacity-40"

export const clicksLabel = (n: number) =>
  n === 1 ? "1 clique" : `${n} cliques`

export function LinkList({ links }: { links: LinkView[] }) {
  const router = useRouter()
  const [failed, setFailed] = useState<string | null>(null)

  async function run(task: () => Promise<unknown>) {
    setFailed(null)
    try {
      await task()
      await router.invalidate()
    } catch (err) {
      setFailed((err as Error).message)
    }
  }

  return (
    <div className="grid gap-4">
      {failed ? (
        <p role="alert" className="animate-alert-in text-red-400">
          {failed}
        </p>
      ) : null}
      {links.length ? null : <p className="text-muted">Nenhum link ainda.</p>}
      <ul aria-label="Meus links" className="grid gap-3">
        <AnimatePresence initial={false}>
          {links.map((link, i) => (
            <motion.li
              key={link.id}
              layout="position"
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={{ layout: spring }}
              className="flex flex-wrap items-center gap-4 rounded-xl border border-line bg-surface px-4 py-3"
            >
              <div className="grid min-w-0 flex-1 gap-0.5">
                <p className="truncate font-[510]">{link.title}</p>
                <p className="truncate text-sm text-muted">{link.url}</p>
              </div>
              <p className="text-sm text-muted tabular-nums">
                {clicksLabel(link.clicks)}
              </p>
              <div className="flex gap-1.5 text-xs font-[510]">
                <button
                  type="button"
                  aria-label="Mover para cima"
                  disabled={i === 0}
                  className={action}
                  onClick={() =>
                    run(() =>
                      moveLink({ data: { id: link.id, direction: "up" } }),
                    )
                  }
                >
                  <HugeiconsIcon icon={ArrowUp01Icon} size={14} />
                </button>
                <button
                  type="button"
                  aria-label="Mover para baixo"
                  disabled={i === links.length - 1}
                  className={action}
                  onClick={() =>
                    run(() =>
                      moveLink({ data: { id: link.id, direction: "down" } }),
                    )
                  }
                >
                  <HugeiconsIcon icon={ArrowDown01Icon} size={14} />
                </button>
                <Link
                  to="/admin/links/$linkId/edit"
                  params={{ linkId: link.id }}
                  className={action}
                >
                  Editar
                </Link>
                <button
                  type="button"
                  className={`${action} text-red-400`}
                  onClick={() => {
                    if (!window.confirm(`Excluir "${link.title}"?`)) return
                    run(() => deleteLink({ data: link.id }))
                  }}
                >
                  Excluir
                </button>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  )
}
