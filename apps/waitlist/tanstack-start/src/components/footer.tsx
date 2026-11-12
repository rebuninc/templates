import { Link } from "@tanstack/react-router"

import { LogoMark } from "./logo"

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-5 md:px-10">
        <Link
          to="/"
          className="flex items-center gap-2 font-[590] tracking-tight"
        >
          <LogoMark size={18} />
          Waitlist
        </Link>
        <p className="text-sm text-muted">Feito com Rebun</p>
      </div>
    </footer>
  )
}
