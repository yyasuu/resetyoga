'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Lock, Sparkles } from 'lucide-react'
import { YogaPose, POSE_FAMILIES, DIFFICULTY_LEVELS } from '@/lib/poses'
import { CONCERNS } from '@/lib/concerns'
import { MemberGateModal } from './MemberGateModal'

interface PoseCardProps {
  pose: YogaPose
  locale: string
  isLoggedIn: boolean
}

export function PoseCard({ pose, locale, isLoggedIn }: PoseCardProps) {
  const [showGate, setShowGate] = useState(false)

  const accessLevel = pose.access_level ?? 'public'
  const isGated = accessLevel === 'member' || accessLevel === 'premium'

  const handleClick = (e: React.MouseEvent) => {
    if (!isLoggedIn && isGated) {
      e.preventDefault()
      setShowGate(true)
    }
  }

  const familyLabel = (() => {
    const f = POSE_FAMILIES.find(f => f.value === pose.pose_family)
    return f ? (locale === 'ja' ? f.ja : f.en) : pose.pose_family ?? ''
  })()

  const difficultyLabel = (() => {
    const d = DIFFICULTY_LEVELS.find(d => d.value === pose.difficulty)
    return d ? (locale === 'ja' ? d.ja : d.en) : pose.difficulty ?? ''
  })()

  const poseConcerns = (pose.concerns ?? [])
    .slice(0, 2)
    .map(id => CONCERNS.find(c => c.id === id))
    .filter(Boolean) as typeof CONCERNS

  const title = locale === 'ja' ? pose.name_ja : pose.name_en
  const imageUrl = locale === 'ja'
    ? (pose.image_url_ja ?? pose.image_url)
    : (pose.image_url_en ?? pose.image_url)

  return (
    <>
      {showGate && (
        <MemberGateModal
          contentPath={`/wellness/poses/${pose.id}`}
          locale={locale}
          onClose={() => setShowGate(false)}
        />
      )}

      <Link
        href={`/wellness/poses/${pose.id}`}
        onClick={handleClick}
        className="group bg-white dark:bg-navy-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-navy-700 shadow-sm hover:shadow-md transition-shadow block"
      >
        {/* Image / Fallback */}
        <div className="relative h-44 bg-gradient-to-br from-linen-100 to-sage-50 dark:from-navy-700 dark:to-navy-800 flex items-center justify-center overflow-hidden">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <span className="text-6xl select-none">🧘</span>
          )}

          {/* Access badge */}
          {accessLevel === 'premium' && (
            <span className="absolute top-2 left-2 inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">
              <Sparkles className="h-3 w-3" />
              {locale === 'ja' ? 'プレミアム' : 'Premium'}
            </span>
          )}
          {accessLevel === 'member' && (
            <span className="absolute top-2 left-2 inline-flex items-center gap-1 text-[10px] font-bold bg-sage-100 dark:bg-sage-900/60 text-sage-700 dark:text-sage-400 px-2 py-0.5 rounded-full">
              <Lock className="h-3 w-3" />
              {locale === 'ja' ? '無料会員' : 'Members'}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Sanskrit name */}
          <p className="text-xs text-sage-600 dark:text-sage-400 font-medium mb-0.5 truncate">
            {pose.name_sanskrit}
          </p>

          {/* Title */}
          <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-snug mb-2 truncate group-hover:text-navy-600 dark:group-hover:text-sage-400 transition-colors">
            {title}
          </h3>

          {/* Pose family + difficulty badges */}
          <div className="flex items-center gap-1.5 flex-wrap mb-2">
            {familyLabel && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-linen-100 dark:bg-navy-700 text-navy-600 dark:text-navy-300 border border-linen-200 dark:border-navy-600">
                {familyLabel}
              </span>
            )}
            {difficultyLabel && (
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                pose.difficulty === 'advanced'
                  ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  : pose.difficulty === 'intermediate'
                  ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                  : 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400'
              }`}>
                {difficultyLabel}
              </span>
            )}
          </div>

          {/* Concern tags */}
          {poseConcerns.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              {poseConcerns.map(c => (
                <span
                  key={c.id}
                  className="inline-flex items-center gap-0.5 text-[10px] font-medium text-sage-700 dark:text-sage-400 bg-sage-50 dark:bg-sage-900/30 border border-sage-200 dark:border-sage-800 px-1.5 py-0.5 rounded-full"
                >
                  {c.icon} {locale === 'ja' ? c.ja : c.en}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </>
  )
}
