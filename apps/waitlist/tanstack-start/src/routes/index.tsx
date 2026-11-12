import { createFileRoute } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
import { type CSSProperties, Fragment } from "react"

import { Countdown } from "../components/countdown"
import { DotField } from "../components/dot-field"
import { WaitlistForm } from "../components/waitlist-form"
import { getHome, joinWaitlist } from "../lib/rebun"

const loadHome = createServerFn().handler(() => getHome())

const join = createServerFn({ method: "POST" })
  .validator((email: string) => String(email).trim())
  .handler(({ data }) => joinWaitlist(data))

export const Route = createFileRoute("/")({
  loader: () => loadHome(),
  component: Home,
})

const delay = (seconds: number) => ({ animationDelay: `${seconds}s` })

// The clip box pads around each word so descenders and accents aren't cut.
const WORD =
  "-mx-[0.06em] -mt-[0.1em] -mb-[0.17em] inline-block overflow-hidden px-[0.06em] pt-[0.1em] pb-[0.17em] align-top"

function Word({ word, i }: { word: string; i: number }) {
  return (
    <span className={WORD}>
      <span
        className="block animate-line-up"
        style={{ "--i": i } as CSSProperties}
      >
        {word}
      </span>
    </span>
  )
}

// The last word takes the accent and a hand-drawn underline once it lands.
function Headline({ text }: { text: string }) {
  const words = text.split(" ")
  const last = words.length - 1
  return words.map((word, i) => (
    <Fragment key={`${i}-${word}`}>
      {i < last ? (
        <>
          <Word word={word} i={i} />{" "}
        </>
      ) : (
        <span className="relative inline-block text-accent">
          <Word word={word} i={i} />
          <svg
            aria-hidden="true"
            viewBox="0 0 200 14"
            preserveAspectRatio="none"
            className="absolute -bottom-[0.14em] left-0 h-[0.16em] w-full overflow-visible"
          >
            <path
              d="M3 10 C 45 3, 120 2, 197 8"
              pathLength={1}
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              className="animate-draw"
              style={{ animationDelay: `${0.2 + i * 0.11 + 0.75}s` }}
            />
          </svg>
        </span>
      )}
    </Fragment>
  ))
}

const page = "relative isolate flex min-h-dvh flex-col overflow-hidden"

function Home() {
  const { data: home, error } = Route.useLoaderData()
  if (error !== null)
    return (
      <main className={`${page} items-center justify-center px-5`}>
        <p role="alert" className="text-sm text-danger">
          Erro ao carregar: {error}
        </p>
      </main>
    )
  return (
    <main className={page}>
      <div aria-hidden="true" className="curtain" />
      <div
        aria-hidden="true"
        className="absolute -inset-[5%] -z-10 animate-arrive"
      >
        <DotField className="size-full" />
      </div>
      <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-5 py-28 text-center">
        {/* Solid plate so the dots never run under the copy. */}
        <div className="flex flex-col items-center rounded-[2rem] bg-void px-4 py-10 sm:px-12">
          {home.eyebrow && (
            <p
              style={delay(0.15)}
              className="animate-rise-in inline-flex items-center gap-2.5 rounded-full border border-line bg-panel py-1.5 pr-3.5 pl-3 text-xs font-medium text-soft"
            >
              <span aria-hidden="true" className="relative flex size-2">
                <span className="absolute inset-0 animate-ping-soft rounded-full bg-accent" />
                <span className="relative size-2 animate-blink rounded-full bg-accent" />
              </span>
              {home.eyebrow}
            </p>
          )}
          <h1 className="mt-7 text-[clamp(2.6rem,6.5vw,4.75rem)] leading-[1.02] font-extrabold tracking-[-0.04em] text-balance">
            <Headline text={home.headline ?? ""} />
          </h1>
          {home.description && (
            <p
              style={delay(0.6)}
              className="animate-rise-in mt-6 max-w-xl text-base leading-relaxed text-pretty text-soft md:text-lg"
            >
              {home.description}
            </p>
          )}
          {home.launchAt && (
            <div style={delay(0.7)} className="animate-rise-in mt-10">
              <Countdown to={home.launchAt} />
            </div>
          )}
          <div
            style={delay(0.85)}
            className="animate-rise-in mt-10 flex w-full justify-center"
          >
            <WaitlistForm onJoin={(email) => join({ data: email })} />
          </div>
        </div>
      </section>
      <p className="pb-6 text-center text-xs font-medium tracking-wide text-faint">
        Feito com Rebun
      </p>
    </main>
  )
}
