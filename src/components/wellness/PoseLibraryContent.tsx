'use client'

import { useState } from 'react'
import { YogaPose, POSE_FAMILIES, DIFFICULTY_LEVELS } from '@/lib/poses'
import { CONCERNS } from '@/lib/concerns'
import { PoseCard } from './PoseCard'

interface PoseLibraryContentProps {
  poses: YogaPose[]
  locale: string
  isLoggedIn: boolean
}

export function PoseLibraryContent({ poses, locale, isLoggedIn }: PoseLibraryContentProps) {
  const [selectedConcern, setSelectedConcern] = useState<string | null>(null)
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null)

  const filteredPoses = poses.filter(pose => {
    if (selectedConcern && !(pose.concerns ?? []).includes(selectedConcern)) return false
    if (selectedFamily && pose.pose_family !== selectedFamily) return false
    if (selectedDifficulty && pose.difficulty !== selectedDifficulty) return false
    return true
  })

  const hasActiveFilter = selectedConcern || selectedFamily || selectedDifficulty

  return (
    <div>
      {/* Filter Row 1: Concern Tags */}
      <section className="mb-6">
        <p className="text-xs font-semibold text-gray-400 dark:text-navy-400 uppercase tracking-wider mb-2">
          {locale === 'ja' ? 'お悩み別で探す' : 'Browse by concern'}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedConcern(null)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
              !selectedConcern
                ? 'bg-navy-600 text-white border-navy-600'
                : 'bg-white dark:bg-navy-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-navy-600 hover:border-sage-400 hover:bg-sage-50 dark:hover:bg-navy-700'
            }`}
          >
            {locale === 'ja' ? 'すべて' : 'All'}
          </button>
          {CONCERNS.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedConcern(selectedConcern === c.id ? null : c.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                selectedConcern === c.id
                  ? 'bg-navy-600 text-white border-navy-600 shadow-sm'
                  : 'bg-white dark:bg-navy-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-navy-600 hover:border-sage-400 hover:bg-sage-50 dark:hover:bg-navy-700'
              }`}
            >
              <span>{c.icon}</span>
              <span>{locale === 'ja' ? c.ja : c.en}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Filter Row 2: Pose Family */}
      <section className="mb-6">
        <p className="text-xs font-semibold text-gray-400 dark:text-navy-400 uppercase tracking-wider mb-2">
          {locale === 'ja' ? 'ポーズ種別' : 'Pose Family'}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedFamily(null)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
              !selectedFamily
                ? 'bg-navy-600 text-white border-navy-600'
                : 'bg-white dark:bg-navy-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-navy-600 hover:border-sage-400 hover:bg-sage-50 dark:hover:bg-navy-700'
            }`}
          >
            {locale === 'ja' ? 'すべて' : 'All'}
          </button>
          {POSE_FAMILIES.map(f => (
            <button
              key={f.value}
              onClick={() => setSelectedFamily(selectedFamily === f.value ? null : f.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                selectedFamily === f.value
                  ? 'bg-navy-600 text-white border-navy-600 shadow-sm'
                  : 'bg-white dark:bg-navy-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-navy-600 hover:border-sage-400 hover:bg-sage-50 dark:hover:bg-navy-700'
              }`}
            >
              {locale === 'ja' ? f.ja : f.en}
            </button>
          ))}
        </div>
      </section>

      {/* Filter Row 3: Difficulty */}
      <section className="mb-10">
        <p className="text-xs font-semibold text-gray-400 dark:text-navy-400 uppercase tracking-wider mb-2">
          {locale === 'ja' ? '難易度' : 'Difficulty'}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedDifficulty(null)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
              !selectedDifficulty
                ? 'bg-navy-600 text-white border-navy-600'
                : 'bg-white dark:bg-navy-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-navy-600 hover:border-sage-400 hover:bg-sage-50 dark:hover:bg-navy-700'
            }`}
          >
            {locale === 'ja' ? 'すべて' : 'All'}
          </button>
          {DIFFICULTY_LEVELS.map(d => (
            <button
              key={d.value}
              onClick={() => setSelectedDifficulty(selectedDifficulty === d.value ? null : d.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                selectedDifficulty === d.value
                  ? 'bg-navy-600 text-white border-navy-600 shadow-sm'
                  : 'bg-white dark:bg-navy-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-navy-600 hover:border-sage-400 hover:bg-sage-50 dark:hover:bg-navy-700'
              }`}
            >
              {locale === 'ja' ? d.ja : d.en}
            </button>
          ))}
        </div>

        {/* Reset */}
        {hasActiveFilter && (
          <button
            onClick={() => { setSelectedConcern(null); setSelectedFamily(null); setSelectedDifficulty(null) }}
            className="mt-3 text-xs text-gray-400 dark:text-navy-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          >
            {locale === 'ja' ? 'フィルターをリセット' : 'Reset filters'}
          </button>
        )}
      </section>

      {/* Pose Grid */}
      {filteredPoses.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-5xl mb-4">🧘</p>
          <p className="text-gray-400 dark:text-navy-400 text-sm">
            {locale === 'ja'
              ? '条件に一致するポーズが見つかりません。'
              : 'No poses found matching your filters.'}
          </p>
          {hasActiveFilter && (
            <button
              onClick={() => { setSelectedConcern(null); setSelectedFamily(null); setSelectedDifficulty(null) }}
              className="mt-4 text-sm text-navy-600 dark:text-sage-400 hover:underline"
            >
              {locale === 'ja' ? 'すべて表示' : 'Show all poses'}
            </button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-3 gap-5">
          {filteredPoses.map(pose => (
            <PoseCard
              key={pose.id}
              pose={pose}
              locale={locale}
              isLoggedIn={isLoggedIn}
            />
          ))}
        </div>
      )}
    </div>
  )
}
