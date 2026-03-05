'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useCallback, useState } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LANGUAGES } from '@/types'
import { Search, SlidersHorizontal } from 'lucide-react'
import { CONCERNS } from '@/lib/concerns'

export function InstructorFilters() {
  const t = useTranslations('instructors')
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showAdvanced, setShowAdvanced] = useState(false)

  const currentConcern = searchParams.get('concern') ?? ''

  const updateFilter = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([key, value]) => {
        if (value && value !== 'all') {
          params.set(key, value)
        } else {
          params.delete(key)
        }
      })
      router.push(`/instructors?${params.toString()}`)
    },
    [router, searchParams]
  )

  const handleConcernClick = (id: string) => {
    // Toggle off if already selected
    updateFilter({ concern: currentConcern === id ? '' : id })
  }

  const locale =
    typeof window !== 'undefined'
      ? document.cookie.includes('NEXT_LOCALE=ja') ? 'ja' : 'en'
      : 'ja'

  return (
    <div className="space-y-5">

      {/* Concern chips */}
      <div>
        <p className="text-sm font-semibold text-gray-500 dark:text-navy-300 uppercase tracking-wider mb-3">
          {locale === 'ja' ? 'あなたのお悩みは？' : "What's bothering you?"}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {CONCERNS.map((c) => {
            const selected = currentConcern === c.id
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => handleConcernClick(c.id)}
                className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-2xl border text-center transition-all duration-150 ${
                  selected
                    ? 'bg-navy-600 border-navy-600 text-white shadow-md scale-[1.02]'
                    : 'bg-white dark:bg-navy-800 border-gray-200 dark:border-navy-600 text-gray-700 dark:text-gray-200 hover:border-sage-400 hover:bg-sage-50 dark:hover:bg-navy-700'
                }`}
              >
                <span className="text-xl leading-none">{c.icon}</span>
                <span className="text-xs font-semibold leading-snug">
                  {locale === 'ja' ? c.ja : c.en}
                </span>
                <span className={`text-[10px] leading-snug ${selected ? 'text-navy-200' : 'text-gray-400 dark:text-navy-400'}`}>
                  {locale === 'ja' ? c.descJa : c.descEn}
                </span>
              </button>
            )
          })}
        </div>

        {/* Clear concern */}
        {currentConcern && (
          <button
            type="button"
            onClick={() => updateFilter({ concern: '' })}
            className="mt-3 text-xs text-sage-600 dark:text-sage-400 hover:underline"
          >
            {locale === 'ja' ? '× お悩みの選択を解除' : '× Clear concern filter'}
          </button>
        )}
      </div>

      {/* Advanced filters toggle */}
      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-navy-300 hover:text-navy-600 dark:hover:text-sage-400"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {locale === 'ja' ? '詳細フィルター' : 'Advanced filters'}
          <span className="text-xs">{showAdvanced ? '▲' : '▼'}</span>
        </button>

        {showAdvanced && (
          <div className="flex flex-col sm:flex-row gap-3 mt-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t('search_placeholder')}
                defaultValue={searchParams.get('q') || ''}
                onChange={(e) => updateFilter({ q: e.target.value })}
                className="pl-9"
              />
            </div>

            {/* Language filter */}
            <Select
              defaultValue={searchParams.get('language') || 'all'}
              onValueChange={(v) => updateFilter({ language: v })}
            >
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder={t('filter_language')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all_languages')}</SelectItem>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  )
}
