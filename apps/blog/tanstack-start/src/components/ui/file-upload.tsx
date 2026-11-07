import {
  Cancel01Icon,
  CloudUploadIcon,
  File02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { AnimatePresence, motion } from "motion/react"
import { useEffect, useId, useRef, useState } from "react"
import { enter, spring, useEnterFrom } from "@/lib/motion"

const MB = 1024 * 1024

export const formatSize = (bytes: number) =>
  bytes < 1024
    ? `${bytes} B`
    : bytes < MB
      ? `${Math.round(bytes / 1024)} KB`
      : `${(bytes / MB).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} MB`

// Storage paths are `<uuid>-<name>`; show only the name.
export const fileName = (path: string) =>
  path.replace(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/,
    "",
  )

const accepts = (accept: string, file: File) =>
  accept.split(",").some((raw) => {
    const rule = raw.trim().toLowerCase()
    if (rule.startsWith(".")) return file.name.toLowerCase().endsWith(rule)
    if (rule.endsWith("/*")) return file.type.startsWith(rule.slice(0, -1))
    return file.type === rule
  })

type Current = { name: string; url: string | null }

export function FileUpload({
  label,
  name,
  accept,
  maxSize,
  multiple = false,
  maxFiles = multiple ? 12 : 1,
  current = null,
}: {
  label: string
  name: string
  accept: string
  maxSize: number
  multiple?: boolean
  maxFiles?: number
  current?: Current | null
}) {
  const labelId = useId()
  const input = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<File[]>([])
  const [keepCurrent, setKeepCurrent] = useState(current !== null)
  const [removed, setRemoved] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [dragging, setDragging] = useState(false)
  const from = useEnterFrom()
  // Files have no id, and the same file can be picked twice in multiple mode.
  const ids = useRef(new WeakMap<File, string>())
  const keyOf = (file: File) => {
    const id = ids.current.get(file) ?? crypto.randomUUID()
    ids.current.set(file, id)
    return id
  }

  const taken = files.length + (keepCurrent ? 1 : 0)
  const full = multiple && taken >= maxFiles

  // The native input is the source of truth for FormData, so mirror the list into it.
  const commit = (next: File[]) => {
    const transfer = new DataTransfer()
    for (const file of next) transfer.items.add(file)
    if (input.current) input.current.files = transfer.files
    setFiles(next)
  }

  const add = (picked: File[]) => {
    const problems: string[] = []
    const valid = picked.filter((file) => {
      if (!accepts(accept, file))
        problems.push(`${file.name} não é um tipo aceito`)
      else if (file.size > maxSize)
        problems.push(`${file.name} é maior que ${maxSize / MB} MB`)
      else return true
      return false
    })
    if (!multiple) {
      if (valid[0]) {
        setKeepCurrent(false)
        setRemoved(false)
        commit([valid[0]])
      } else commit(files)
    } else {
      const room = maxFiles - taken
      if (valid.length > room) problems.push("Limite de arquivos atingido")
      commit([...files, ...valid.slice(0, Math.max(0, room))])
    }
    setErrors(problems)
  }

  return (
    <div className="grid gap-2 text-sm font-[510]">
      <span id={labelId}>{label}</span>
      <label
        data-dragging={dragging || undefined}
        data-disabled={full || undefined}
        onDragOver={(e) => {
          e.preventDefault()
          if (!full) setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          if (!full) add([...e.dataTransfer.files])
        }}
        className="group cursor-pointer rounded-xl border border-line bg-surface p-1.5 transition-transform duration-200 has-focus-visible:outline-2 has-focus-visible:outline-fg data-dragging:scale-[1.01] data-disabled:cursor-not-allowed data-disabled:opacity-50 motion-reduce:transition-none"
      >
        <input
          ref={input}
          type="file"
          name={name}
          accept={accept}
          multiple={multiple}
          disabled={full}
          aria-labelledby={labelId}
          className="sr-only"
          onChange={(e) => add([...(e.currentTarget.files ?? [])])}
        />
        <span className="grid place-items-center gap-2 rounded-lg border border-dashed border-line px-4 py-8 text-center transition-colors group-data-dragging:border-solid group-data-dragging:border-fg group-data-dragging:bg-fg/5">
          <span className="rounded-lg border border-line bg-bg p-2 text-fg transition-colors group-data-dragging:bg-fg group-data-dragging:text-bg">
            <HugeiconsIcon icon={CloudUploadIcon} size={20} />
          </span>
          <span className="text-fg">
            {full
              ? "Limite de arquivos atingido"
              : "Arraste ou clique para escolher"}
          </span>
          <span className="font-normal text-muted">Até {maxSize / MB} MB</span>
        </span>
      </label>
      {removed ? (
        <input type="hidden" name={`${name}-remove`} value="on" />
      ) : null}
      {errors.length ? (
        <div
          role="alert"
          className="animate-alert-in grid gap-1 font-normal text-red-400"
        >
          {errors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      ) : null}
      <ul className="grid gap-2 font-normal empty:hidden">
        <AnimatePresence initial={false}>
          {keepCurrent && current ? (
            <Row
              key="current"
              from={from}
              name={current.name}
              src={current.url}
              onRemove={() => {
                setKeepCurrent(false)
                setRemoved(true)
              }}
            />
          ) : null}
          {files.map((file) => (
            <FileRow
              key={keyOf(file)}
              from={from}
              file={file}
              onRemove={() => commit(files.filter((f) => f !== file))}
            />
          ))}
        </AnimatePresence>
      </ul>
    </div>
  )
}

function FileRow({
  file,
  ...props
}: {
  file: File
  from: ReturnType<typeof useEnterFrom>
  onRemove: () => void
}) {
  const [src, setSrc] = useState<string | null>(null)
  useEffect(() => {
    if (!file.type.startsWith("image/")) return
    const url = URL.createObjectURL(file)
    setSrc(url)
    return () => URL.revokeObjectURL(url)
  }, [file])
  return <Row {...props} name={file.name} size={file.size} src={src} />
}

function Row({
  name,
  size,
  src,
  from,
  onRemove,
}: {
  name: string
  size?: number
  src: string | null
  from: ReturnType<typeof useEnterFrom>
  onRemove: () => void
}) {
  return (
    <motion.li
      layout="position"
      initial={from}
      animate="show"
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
      variants={enter}
      transition={{ ...spring, layout: spring }}
      className="flex items-center gap-3 rounded-lg border border-line bg-surface p-2"
    >
      {src ? (
        <img
          src={src}
          alt=""
          className="size-10 shrink-0 rounded-md object-cover"
        />
      ) : (
        <span className="grid size-10 shrink-0 place-items-center rounded-md bg-bg text-muted">
          <HugeiconsIcon icon={File02Icon} size={18} />
        </span>
      )}
      <span className="grid min-w-0 flex-1">
        <span className="truncate text-fg">{name}</span>
        {size === undefined ? null : (
          <span className="text-xs text-muted">{formatSize(size)}</span>
        )}
      </span>
      <button
        type="button"
        aria-label={`Remover ${name}`}
        onClick={onRemove}
        className="press rounded-md p-1.5 text-muted hover:bg-fg/5 hover:text-fg"
      >
        <HugeiconsIcon icon={Cancel01Icon} size={16} />
      </button>
    </motion.li>
  )
}
