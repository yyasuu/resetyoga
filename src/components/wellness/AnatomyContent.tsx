'use client'

import { useState } from 'react'
import { BODY_SYSTEMS, type BodySystem } from '@/lib/anatomy'
import { ChevronDown, ChevronUp, FlaskConical, Microscope, Leaf, BookOpen } from 'lucide-react'

interface AnatomyContentProps {
  locale: string
}

function SystemCard({ system, locale }: { system: BodySystem; locale: string }) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'yoga' | 'science'>('yoga')
  const ja = locale === 'ja'

  return (
    <div className={`rounded-2xl border ${system.border} ${system.bg} overflow-hidden transition-all`}>
      {/* Card header — always visible */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left"
        aria-expanded={open}
      >
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 shadow-sm border ${system.border} bg-white/60 dark:bg-black/20`}>
              {system.icon}
            </div>

            {/* Title block */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className={`text-lg font-bold ${system.text} leading-tight`}>
                    {ja ? system.nameJa : system.nameEn}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-navy-400 mt-0.5">
                    {ja ? system.taglineJa : system.taglineEn}
                  </p>
                </div>
                <div className={`flex-shrink-0 ${system.text}`}>
                  {open ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
              </div>

              {/* Summary */}
              <p className="mt-2 text-sm text-gray-600 dark:text-navy-200 leading-relaxed">
                {ja ? system.summaryJa : system.summaryEn}
              </p>
            </div>
          </div>

          {/* Key facts row */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            {system.facts.map((f, i) => (
              <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-xl bg-white/50 dark:bg-black/20 border border-white/60 dark:border-white/5">
                <span className="text-base flex-shrink-0 mt-0.5">{f.icon}</span>
                <p className="text-[11px] text-gray-600 dark:text-navy-200 leading-snug">
                  {ja ? f.ja : f.en}
                </p>
              </div>
            ))}
          </div>
        </div>
      </button>

      {/* Expanded content */}
      {open && (
        <div className="border-t border-white/40 dark:border-white/5">
          {/* Mechanism */}
          <div className="px-5 sm:px-6 py-5 bg-white/40 dark:bg-black/20">
            <div className="flex items-center gap-2 mb-3">
              <Microscope className={`h-4 w-4 ${system.text}`} />
              <span className={`text-xs font-bold uppercase tracking-widest ${system.text}`}>
                {ja ? '仕組み' : 'How It Works'}
              </span>
            </div>
            <p className="text-sm text-gray-700 dark:text-navy-100 leading-relaxed">
              {ja ? system.mechanismJa : system.mechanismEn}
            </p>
          </div>

          {/* Tab switcher: Yoga + Science */}
          <div className="px-5 sm:px-6 pt-5">
            <div className="flex gap-1 mb-4 border-b border-white/30 dark:border-white/5">
              <button
                onClick={() => setTab('yoga')}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 -mb-px transition-colors ${
                  tab === 'yoga'
                    ? `border-current ${system.text}`
                    : 'border-transparent text-gray-400 dark:text-navy-400 hover:text-gray-600 dark:hover:text-navy-200'
                }`}
              >
                <Leaf className="h-3.5 w-3.5" />
                {ja ? 'ヨガとの関係' : 'Yoga Connection'}
              </button>
              <button
                onClick={() => setTab('science')}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 -mb-px transition-colors ${
                  tab === 'science'
                    ? `border-current ${system.text}`
                    : 'border-transparent text-gray-400 dark:text-navy-400 hover:text-gray-600 dark:hover:text-navy-200'
                }`}
              >
                <FlaskConical className="h-3.5 w-3.5" />
                {ja ? 'サイエンス' : 'The Science'}
              </button>
            </div>

            {tab === 'yoga' && (
              <div>
                <p className="text-sm text-gray-700 dark:text-navy-100 leading-relaxed mb-5">
                  {ja ? system.yogaJa : system.yogaEn}
                </p>

                {/* Recommended poses */}
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className={`h-4 w-4 ${system.text}`} />
                    <span className={`text-xs font-bold uppercase tracking-widest ${system.text}`}>
                      {ja ? 'おすすめポーズ' : 'Key Poses'}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {system.poses.map((p, i) => (
                      <div key={i} className="flex items-start gap-3 px-3 py-2.5 rounded-xl bg-white/50 dark:bg-black/20 border border-white/60 dark:border-white/5">
                        <span className={`text-xs font-bold ${system.badge} px-1.5 py-0.5 rounded-md flex-shrink-0 mt-0.5`}>
                          {p.name.split(' ')[0]}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-800 dark:text-white truncate">{p.name}</p>
                          <p className="text-[11px] text-gray-500 dark:text-navy-300 leading-snug mt-0.5">
                            {ja ? p.effectJa : p.effectEn}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === 'science' && (
              <div className="pb-5">
                <div className="px-4 py-3 rounded-xl bg-white/50 dark:bg-black/20 border border-white/60 dark:border-white/5 mb-4">
                  <p className="text-[11px] font-bold text-gray-400 dark:text-navy-400 uppercase tracking-widest mb-2">
                    {ja ? '研究エビデンス' : 'Research Evidence'}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-navy-100 leading-relaxed">
                    {ja ? system.scienceJa : system.scienceEn}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Human body overview — visual silhouette with system icons
function BodyOverview({ locale, onSelect }: { locale: string; onSelect: (id: string) => void }) {
  const ja = locale === 'ja'

  const positions: { id: string; icon: string; label: string; labelJa: string; style: string }[] = [
    { id: 'nervous',       icon: '🧠', label: 'Brain',      labelJa: '神経',   style: 'top-[2%]  left-[50%] -translate-x-1/2' },
    { id: 'endocrine',     icon: '⚗️', label: 'Thyroid',   labelJa: '内分泌', style: 'top-[13%] left-[50%] -translate-x-1/2' },
    { id: 'respiratory',   icon: '🫁', label: 'Lungs',     labelJa: '呼吸器', style: 'top-[20%] left-[24%]' },
    { id: 'cardiovascular',icon: '🫀', label: 'Heart',     labelJa: '心臓',   style: 'top-[22%] right-[24%]' },
    { id: 'lymphatic',     icon: '🛡️', label: 'Lymph',    labelJa: 'リンパ', style: 'top-[30%] left-[14%]' },
    { id: 'digestive',     icon: '🌿', label: 'Gut',       labelJa: '消化器', style: 'top-[40%] left-[50%] -translate-x-1/2' },
    { id: 'muscular',      icon: '💪', label: 'Muscle',    labelJa: '筋',     style: 'top-[35%] right-[12%]' },
    { id: 'urinary',       icon: '💧', label: 'Kidney',    labelJa: '泌尿器', style: 'top-[50%] left-[50%] -translate-x-1/2' },
    { id: 'reproductive',  icon: '🌸', label: 'Pelvis',    labelJa: '骨盤',   style: 'top-[60%] left-[50%] -translate-x-1/2' },
    { id: 'skeletal',      icon: '🦴', label: 'Bone',      labelJa: '骨格',   style: 'top-[70%] left-[22%]' },
    { id: 'cell',          icon: '🔬', label: 'Cell',      labelJa: '細胞',   style: 'top-[70%] right-[22%]' },
  ]

  return (
    <div className="relative w-full max-w-xs mx-auto select-none">
      {/* Silhouette */}
      <div className="relative h-[360px]">
        {/* Body shape SVG */}
        <svg viewBox="0 0 120 320" className="absolute inset-0 w-full h-full" fill="none">
          {/* Head */}
          <ellipse cx="60" cy="28" rx="22" ry="26" fill="currentColor" className="text-linen-300 dark:text-navy-700" stroke="currentColor" strokeWidth="1" />
          {/* Neck */}
          <rect x="52" y="52" width="16" height="12" rx="4" fill="currentColor" className="text-linen-200 dark:text-navy-700" />
          {/* Torso */}
          <path d="M30 64 Q20 80 22 140 Q24 160 60 162 Q96 160 98 140 Q100 80 90 64 Z" fill="currentColor" className="text-linen-200 dark:text-navy-700" />
          {/* Left arm */}
          <path d="M30 68 Q10 90 8 140 Q8 150 14 150 Q20 150 22 140 Q26 95 38 76 Z" fill="currentColor" className="text-linen-200 dark:text-navy-700" />
          {/* Right arm */}
          <path d="M90 68 Q110 90 112 140 Q112 150 106 150 Q100 150 98 140 Q94 95 82 76 Z" fill="currentColor" className="text-linen-200 dark:text-navy-700" />
          {/* Hips */}
          <path d="M22 160 Q18 175 24 190 Q40 210 60 210 Q80 210 96 190 Q102 175 98 160 Z" fill="currentColor" className="text-linen-200 dark:text-navy-700" />
          {/* Left leg */}
          <path d="M24 200 Q20 240 22 290 Q22 300 32 300 Q40 300 40 290 Q44 240 46 200 Z" fill="currentColor" className="text-linen-200 dark:text-navy-700" />
          {/* Right leg */}
          <path d="M96 200 Q100 240 98 290 Q98 300 88 300 Q80 300 80 290 Q76 240 74 200 Z" fill="currentColor" className="text-linen-200 dark:text-navy-700" />
        </svg>

        {/* System dots */}
        {positions.map(p => (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            style={{ position: 'absolute', ...Object.fromEntries(
              p.style.split(' ').map(cls => {
                if (cls.startsWith('top-')) return ['top', cls.replace('top-[','').replace(']','')]
                if (cls.startsWith('left-')) return ['left', cls.replace('left-[','').replace(']','')]
                if (cls.startsWith('right-')) return ['right', cls.replace('right-[','').replace(']','')]
                return [null, null]
              }).filter(([k]) => k)
            )}}
            className="group flex flex-col items-center gap-0.5 hover:scale-110 active:scale-95 transition-transform cursor-pointer z-10"
            title={ja ? p.labelJa : p.label}
          >
            <span className="text-xl drop-shadow-sm">{p.icon}</span>
            <span className="text-[9px] font-semibold text-gray-500 dark:text-navy-300 group-hover:text-navy-600 dark:group-hover:text-sage-400 whitespace-nowrap leading-none">
              {ja ? p.labelJa : p.label}
            </span>
          </button>
        ))}
      </div>

      <p className="text-center text-[10px] text-gray-400 dark:text-navy-500 mt-1">
        {ja ? 'アイコンをタップで詳細へ' : 'Tap an icon to jump to details'}
      </p>
    </div>
  )
}

export function AnatomyContent({ locale }: AnatomyContentProps) {
  const ja = locale === 'ja'
  const [highlightId, setHighlightId] = useState<string | null>(null)

  const handleSelect = (id: string) => {
    setHighlightId(id)
    setTimeout(() => {
      document.getElementById(`system-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  return (
    <div>
      {/* Intro */}
      <div className="text-center mb-10">
        <p className="text-sm text-gray-500 dark:text-navy-300 max-w-2xl mx-auto leading-relaxed">
          {ja
            ? '人体は11の器官系が互いに連携して働く精密なシステム。ヨガと瞑想がそれぞれの器官にどう作用するかを解剖学と最新の医学研究から解説します。'
            : 'The body is a precise system of 11 organ systems working in concert. Explore how yoga and meditation act on each system — through anatomy and the latest medical research.'}
        </p>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-8 lg:gap-12">
        {/* Left: Body map (sticky on desktop) */}
        <div className="lg:sticky lg:top-24 lg:self-start hidden lg:block">
          <div className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-100 dark:border-navy-700 p-5 shadow-sm">
            <p className="text-xs font-bold text-gray-400 dark:text-navy-400 uppercase tracking-widest text-center mb-4">
              {ja ? '身体マップ' : 'Body Map'}
            </p>
            <BodyOverview locale={locale} onSelect={handleSelect} />
          </div>
        </div>

        {/* Right: System cards */}
        <div className="space-y-4">
          {BODY_SYSTEMS.map(system => (
            <div
              key={system.id}
              id={`system-${system.id}`}
              className={`scroll-mt-24 transition-all duration-300 ${
                highlightId === system.id ? 'ring-2 ring-offset-2 ring-navy-400 dark:ring-sage-400 rounded-2xl' : ''
              }`}
            >
              <SystemCard system={system} locale={locale} />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile body map — below the cards */}
      <div className="lg:hidden mt-10">
        <div className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-100 dark:border-navy-700 p-5 shadow-sm">
          <p className="text-xs font-bold text-gray-400 dark:text-navy-400 uppercase tracking-widest text-center mb-4">
            {ja ? '身体マップ — タップしてジャンプ' : 'Body Map — tap to jump'}
          </p>
          <BodyOverview locale={locale} onSelect={handleSelect} />
        </div>
      </div>
    </div>
  )
}
