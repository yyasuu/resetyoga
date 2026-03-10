'use client'

import { useState } from 'react'
import Image from 'next/image'
import { BODY_SYSTEMS, type BodySystem } from '@/lib/anatomy'
import { FlaskConical, Microscope, Leaf, BookOpen } from 'lucide-react'

interface AnatomyContentProps {
  locale: string
}

// Quick-jump nav items (matches BODY_SYSTEMS order)
const NAV_ITEMS = [
  { id: 'cell',           icon: '🔬', ja: '細胞',    en: 'Cell' },
  { id: 'skeletal',       icon: '🦴', ja: '骨格',    en: 'Skeletal' },
  { id: 'muscular',       icon: '💪', ja: '筋',      en: 'Muscle' },
  { id: 'nervous',        icon: '🧠', ja: '神経',    en: 'Nervous' },
  { id: 'endocrine',      icon: '⚗️', ja: '内分泌',  en: 'Endocrine' },
  { id: 'respiratory',    icon: '🫁', ja: '呼吸器',  en: 'Respiratory' },
  { id: 'cardiovascular', icon: '🫀', ja: '心臓血管', en: 'Cardiovascular' },
  { id: 'lymphatic',      icon: '🛡️', ja: 'リンパ',  en: 'Lymphatic' },
  { id: 'digestive',      icon: '🌿', ja: '消化器',  en: 'Digestive' },
  { id: 'urinary',        icon: '💧', ja: '泌尿器',  en: 'Urinary' },
  { id: 'reproductive',   icon: '🌸', ja: '生殖器',  en: 'Reproductive' },
]

function JumpNav({ locale, onSelect }: { locale: string; onSelect: (id: string) => void }) {
  const ja = locale === 'ja'
  return (
    <div className="overflow-x-auto pb-2 -mx-1 px-1">
      <div className="flex gap-2 min-w-max">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className="flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl bg-white dark:bg-navy-800 border border-gray-100 dark:border-navy-700 hover:border-navy-300 dark:hover:border-sage-500 hover:shadow-sm transition-all group cursor-pointer"
          >
            <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
            <span className="text-[10px] font-semibold text-gray-500 dark:text-navy-300 group-hover:text-navy-600 dark:group-hover:text-sage-400 whitespace-nowrap">
              {ja ? item.ja : item.en}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

function CellImages({ locale }: { locale: string }) {
  const ja = locale === 'ja'
  return (
    <div className="mb-6 space-y-3">
      <div className="rounded-xl overflow-hidden border border-gray-100 dark:border-navy-700 shadow-sm">
        <Image
          src={ja ? '/anatomy-cells-ja.jpg' : '/anatomy-cells-en.jpg'}
          alt={ja ? '小さな世界から人の体へ' : 'From Atoms to the Human Body'}
          width={1400}
          height={790}
          className="w-full h-auto"
        />
      </div>
      <div className="rounded-xl overflow-hidden border border-gray-100 dark:border-navy-700 shadow-sm">
        <Image
          src={ja ? '/anatomy-body-works-ja.jpg' : '/anatomy-body-works-en.jpg'}
          alt={ja ? '体の働きと健康' : 'How the Body Works'}
          width={1400}
          height={790}
          className="w-full h-auto"
        />
      </div>
    </div>
  )
}

function SystemCard({ system, locale }: { system: BodySystem; locale: string }) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'yoga' | 'science'>('yoga')
  const ja = locale === 'ja'

  return (
    <div className={`rounded-2xl border ${system.border} ${system.bg} overflow-hidden`}>
      {/* Header — always visible, clickable */}
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

            {/* Title + summary */}
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
                <span className={`flex-shrink-0 text-lg transition-transform duration-200 ${system.text} ${open ? 'rotate-180' : ''}`}>
                  ▾
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-navy-200 leading-relaxed">
                {ja ? system.summaryJa : system.summaryEn}
              </p>
            </div>
          </div>

          {/* Key facts */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
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

          {/* Cell biology: locale-appropriate infographic images first */}
          {system.id === 'cell' && (
            <div className="px-5 sm:px-6 pt-5">
              <CellImages locale={locale} />
            </div>
          )}

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

          {/* Tabs */}
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
                  <div className="grid sm:grid-cols-2 gap-2">
                    {system.poses.map((p, i) => (
                      <div key={i} className="flex items-start gap-3 px-3 py-2.5 rounded-xl bg-white/50 dark:bg-black/20 border border-white/60 dark:border-white/5">
                        <span className={`text-[10px] font-bold ${system.badge} px-1.5 py-0.5 rounded-md flex-shrink-0 mt-0.5 whitespace-nowrap`}>
                          {p.name.split(' ')[0]}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-800 dark:text-white">{p.name}</p>
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
                <div className="px-4 py-3 rounded-xl bg-white/50 dark:bg-black/20 border border-white/60 dark:border-white/5">
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

export function AnatomyContent({ locale }: AnatomyContentProps) {
  const ja = locale === 'ja'

  const handleJump = (id: string) => {
    setTimeout(() => {
      document.getElementById(`system-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  return (
    <div>
      {/* Intro */}
      <p className="text-sm text-gray-500 dark:text-navy-300 max-w-3xl mx-auto leading-relaxed text-center mb-8">
        {ja
          ? '人体は細胞から始まり、組織・器官・器官系が互いに連携して働く精密なシステム。ヨガと瞑想がそれぞれにどう作用するかを解剖学と最新の医学研究から解説します。'
          : 'The body is a precise system — from single cells to organ systems — all working in concert. Explore how yoga and meditation act on each, backed by anatomy and the latest medical research.'}
      </p>

      {/* Quick-jump nav */}
      <div className="mb-8">
        <p className="text-[10px] font-bold text-gray-400 dark:text-navy-500 uppercase tracking-widest mb-3">
          {ja ? 'カテゴリーへジャンプ' : 'Jump to category'}
        </p>
        <JumpNav locale={locale} onSelect={handleJump} />
      </div>

      {/* System cards — full width */}
      <div className="space-y-4">
        {BODY_SYSTEMS.map(system => (
          <div
            key={system.id}
            id={`system-${system.id}`}
            className="scroll-mt-24"
          >
            <SystemCard system={system} locale={locale} />
          </div>
        ))}
      </div>
    </div>
  )
}
