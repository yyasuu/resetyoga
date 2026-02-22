'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useCallback } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { YOGA_STYLES, LANGUAGES } from '@/types'
import { Search } from 'lucide-react'

export function InstructorFilters() {
  const t = useTranslations('instructors')
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value && value !== 'all') {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`/instructors?${params.toString()}`)
    },
    [router, searchParams]
  )

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder={t('search_placeholder')}
          defaultValue={searchParams.get('q') || ''}
          onChange={(e) => updateFilter('q', e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Style filter */}
      <Select
        defaultValue={searchParams.get('style') || 'all'}
        onValueChange={(v) => updateFilter('style', v)}
      >
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder={t('filter_style')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('all_styles')}</SelectItem>
          {YOGA_STYLES.map((style) => (
            <SelectItem key={style} value={style}>
              {style}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Language filter */}
      <Select
        defaultValue={searchParams.get('language') || 'all'}
        onValueChange={(v) => updateFilter('language', v)}
      >
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue placeholder={t('filter_language')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('all_languages')}</SelectItem>
          {LANGUAGES.map((lang) => (
            <SelectItem key={lang} value={lang}>
              {lang}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
