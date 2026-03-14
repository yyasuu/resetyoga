"use client"

import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { CheckIcon, ChevronDownIcon, SearchIcon, GlobeIcon } from "lucide-react"
import { cn } from "@/lib/utils"

// Timezones shown when no query is entered
const POPULAR_TZ = [
  'Asia/Tokyo',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Singapore',
  'Australia/Sydney',
  'Asia/Kolkata',
  'Asia/Dubai',
  'UTC',
]

interface Option { value: string; label: string; city: string }

function buildOptions(): Option[] {
  const intl = Intl as unknown as { supportedValuesOf?: (k: 'timeZone') => string[] }
  const tzList: string[] =
    typeof intl.supportedValuesOf === 'function'
      ? Array.from(new Set(['UTC', ...intl.supportedValuesOf('timeZone')]))
      : ['UTC', 'Asia/Tokyo', 'Asia/Kolkata', 'America/New_York', 'America/Los_Angeles',
         'Europe/London', 'Europe/Paris', 'Australia/Sydney', 'Asia/Singapore', 'Asia/Dubai']
  return tzList.map(tz => ({
    value: tz,
    label: tz === 'UTC' ? 'UTC' : tz.replaceAll('_', ' '),
    city: tz.includes('/') ? tz.split('/').pop()!.replaceAll('_', ' ') : tz,
  }))
}

interface TimezoneComboboxProps {
  value: string
  onValueChange: (value: string) => void
  className?: string
  id?: string
}

export function TimezoneCombobox({ value, onValueChange, className, id }: TimezoneComboboxProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlighted, setHighlighted] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const allOptions = useMemo(buildOptions, [])

  const filteredOptions = useMemo<Option[]>(() => {
    if (!query.trim()) {
      const popular = POPULAR_TZ.map(tz => allOptions.find(o => o.value === tz)).filter(Boolean) as Option[]
      const rest = allOptions.filter(o => !POPULAR_TZ.includes(o.value))
      return [...popular, ...rest]
    }
    const q = query.toLowerCase()
    return allOptions.filter(o =>
      o.label.toLowerCase().includes(q) ||
      o.value.toLowerCase().includes(q) ||
      o.city.toLowerCase().includes(q)
    )
  }, [query, allOptions])

  // Ghost text: city name completion (e.g. type "tok" → ghost "yo")
  const ghost = useMemo(() => {
    if (!query || filteredOptions.length === 0) return null
    const city = filteredOptions[0].city.toLowerCase()
    const q = query.toLowerCase()
    if (city.startsWith(q)) return filteredOptions[0].city.slice(query.length)
    return null
  }, [query, filteredOptions])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const openDropdown = useCallback(() => {
    setOpen(true)
    setHighlighted(0)
    requestAnimationFrame(() => inputRef.current?.focus())
  }, [])

  const select = useCallback((tz: string) => {
    onValueChange(tz)
    setOpen(false)
    setQuery('')
  }, [onValueChange])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlighted(h => Math.min(h + 1, filteredOptions.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlighted(h => Math.max(h - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (filteredOptions[highlighted]) select(filteredOptions[highlighted].value)
        break
      case 'Tab':
        if (ghost) {
          e.preventDefault()
          setQuery(q => q + ghost)
          setHighlighted(0)
        }
        break
      case 'Escape':
        setOpen(false)
        setQuery('')
        break
    }
  }

  // Scroll highlighted item into view
  useEffect(() => {
    if (!listRef.current) return
    const item = listRef.current.children[highlighted] as HTMLElement | undefined
    item?.scrollIntoView({ block: 'nearest' })
  }, [highlighted])

  const selectedLabel = allOptions.find(o => o.value === value)?.label ?? value

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {/* Trigger */}
      <button
        type="button"
        id={id}
        onClick={openDropdown}
        className={cn(
          "border-input dark:bg-input/30 dark:hover:bg-input/50",
          "focus-visible:border-ring focus-visible:ring-ring/50",
          "flex h-9 w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none",
          open && "border-ring ring-ring/50 ring-[3px]"
        )}
      >
        <span className="flex items-center gap-2 min-w-0">
          <GlobeIcon className="size-4 text-muted-foreground shrink-0" />
          <span className="truncate text-left">{selectedLabel}</span>
        </span>
        <ChevronDownIcon className={cn("size-4 opacity-50 shrink-0 transition-transform duration-150", open && "rotate-180")} />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-50 mt-1 w-full min-w-[260px] rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95">

          {/* Search row */}
          <div className="flex items-center gap-2 border-b px-3 py-2">
            <SearchIcon className="size-4 text-muted-foreground shrink-0" />
            {/* Ghost text layer sits behind the real input */}
            <div className="relative flex-1 text-sm">
              {ghost && (
                <span aria-hidden className="pointer-events-none absolute inset-0 flex items-center whitespace-pre text-muted-foreground/40 select-none overflow-hidden">
                  <span className="invisible">{query}</span>{ghost}
                </span>
              )}
              <input
                ref={inputRef}
                value={query}
                onChange={e => { setQuery(e.target.value); setHighlighted(0) }}
                onKeyDown={handleKeyDown}
                placeholder="都市名 / city name…"
                className="w-full bg-transparent outline-none placeholder:text-muted-foreground/60"
              />
            </div>
            {ghost && (
              <kbd className="pointer-events-none shrink-0 rounded border border-border bg-muted px-1 py-0.5 text-[10px] text-muted-foreground">Tab</kbd>
            )}
          </div>

          {/* Option list */}
          <ul ref={listRef} className="max-h-60 overflow-y-auto py-1 scroll-py-1" role="listbox">
            {!query.trim() && (
              <li className="px-3 py-1 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                Popular / よく使われる
              </li>
            )}
            {filteredOptions.length === 0 && (
              <li className="px-3 py-5 text-center text-sm text-muted-foreground">見つかりません / Not found</li>
            )}
            {filteredOptions.map((opt, i) => {
              const isSelected = opt.value === value
              const isHighlighted = i === highlighted
              return (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setHighlighted(i)}
                  onMouseDown={e => { e.preventDefault(); select(opt.value) }}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-sm mx-1 px-2 py-1.5 text-sm",
                    isHighlighted && "bg-accent text-accent-foreground",
                    !query.trim() && i === POPULAR_TZ.length && "mt-1 border-t border-border rounded-t-none pt-2"
                  )}
                >
                  <CheckIcon className={cn("size-4 shrink-0", isSelected ? "opacity-100 text-navy-600 dark:text-navy-300" : "opacity-0")} />
                  <span className={cn("flex-1", isSelected && "font-medium")}>{opt.label}</span>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
