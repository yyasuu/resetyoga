'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Play, BookOpen } from 'lucide-react'
import { CONCERNS } from '@/lib/concerns'
import { WellnessVideoCard } from './WellnessVideoCard'

interface Video {
  id: string
  title_ja: string
  title_en: string
  description_ja: string | null
  description_en: string | null
  video_url: string
  thumbnail_url: string | null
  duration_label: string | null
  category: string
  is_published: boolean
}

interface Article {
  id: string
  title_ja: string
  title_en: string
  content_ja: string | null
  content_en: string | null
  category: string
  cover_image_url: string | null
  image_urls: string[] | null
  profiles: { full_name: string | null } | null
}

interface StaticVideo {
  id: string
  title_ja: string
  title_en: string
  description_ja: string
  description_en: string
  gradient: string
  video_url: null
  thumbnail_url: null
  is_static: true
}

interface StaticArticle {
  id: string
  category: string
  category_ja: string
  title_ja: string
  title_en: string
  excerpt_ja: string
  excerpt_en: string
  is_static: true
}

interface WellnessContentProps {
  dbVideos: Video[]
  dbArticles: Article[]
  staticVideos: StaticVideo[]
  staticArticles: StaticArticle[]
  locale: string
  gradients: string[]
}

const GRADIENTS = [
  'from-linen-200 to-sage-100 dark:from-navy-700 dark:to-navy-800',
  'from-sage-100 to-linen-100 dark:from-navy-800 dark:to-navy-700',
  'from-navy-100 to-sage-50 dark:from-navy-900 dark:to-navy-800',
]

export function WellnessContent({
  dbVideos,
  dbArticles,
  staticVideos,
  staticArticles,
  locale,
}: WellnessContentProps) {
  const [selectedConcern, setSelectedConcern] = useState<string | null>(null)

  const concern = selectedConcern ? CONCERNS.find((c) => c.id === selectedConcern) : null

  // Filter videos by concern
  const filteredVideos = concern
    ? dbVideos.filter((v) => concern.videoCategories.includes(v.category))
    : dbVideos

  // Filter articles by concern
  const filteredArticles = concern
    ? dbArticles.filter((a) => concern.articleCategories.includes(a.category))
    : dbArticles

  const hasVideos = filteredVideos.length > 0
  const hasArticles = filteredArticles.length > 0
  const showStaticVideos = !concern && dbVideos.length === 0
  const showStaticArticles = !concern && dbArticles.length === 0

  return (
    <div>
      {/* Concern filter chips */}
      <section className="mb-10">
        <p className="text-xs font-semibold text-gray-400 dark:text-navy-400 uppercase tracking-wider mb-3">
          {locale === 'ja' ? 'お悩み別で探す' : 'Browse by concern'}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedConcern(null)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
              !selectedConcern
                ? 'bg-navy-600 text-white border-navy-600'
                : 'bg-white dark:bg-navy-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-navy-600 hover:border-sage-400'
            }`}
          >
            {locale === 'ja' ? 'すべて' : 'All'}
          </button>
          {CONCERNS.map((c) => (
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

        {/* Concern description banner */}
        {concern && (
          <div className="mt-4 px-4 py-3 bg-sage-50 dark:bg-navy-800 rounded-xl border border-sage-200 dark:border-navy-700">
            <p className="text-sm text-sage-700 dark:text-sage-300 font-medium">
              {concern.icon} {locale === 'ja' ? concern.descJa : concern.descEn}
            </p>
            {hasVideos === false && hasArticles === false && (
              <p className="text-xs text-gray-400 dark:text-navy-400 mt-1">
                {locale === 'ja'
                  ? 'このお悩みに対応したコンテンツは近日公開予定です。'
                  : 'Content for this concern is coming soon.'}
              </p>
            )}
          </div>
        )}
      </section>

      {/* Meditation Videos */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-sage-100 dark:bg-sage-900/40 rounded-xl flex items-center justify-center">
            <Play className="h-5 w-5 text-sage-600 dark:text-sage-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {locale === 'ja' ? '瞑想ガイド動画' : 'Guided Meditation Videos'}
            </h2>
            <p className="text-sm text-gray-400 dark:text-navy-400">
              {locale === 'ja' ? '5〜10分 · いつでも視聴できます' : '5–10 minutes · Watch anytime'}
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          {showStaticVideos
            ? staticVideos.map((video, i) => (
                <div
                  key={video.id}
                  className="bg-white dark:bg-navy-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-navy-700 shadow-sm"
                >
                  <div className={`h-40 bg-gradient-to-br ${video.gradient} flex items-center justify-center relative`}>
                    <div className="w-14 h-14 bg-white/80 dark:bg-navy-900/80 rounded-full flex items-center justify-center shadow-md">
                      <Play className="h-6 w-6 text-sage-600 dark:text-sage-400 ml-0.5" />
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                      {locale === 'ja' ? video.title_ja : video.title_en}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-navy-300 leading-relaxed">
                      {locale === 'ja' ? video.description_ja : video.description_en}
                    </p>
                    <p className="text-xs text-sage-500 dark:text-sage-400 mt-3 font-medium">
                      {locale === 'ja' ? '近日公開' : 'Coming soon'}
                    </p>
                  </div>
                </div>
              ))
            : hasVideos
            ? filteredVideos.map((video, i) => (
                <WellnessVideoCard
                  key={video.id}
                  video={video}
                  gradient={GRADIENTS[i % GRADIENTS.length]}
                  locale={locale}
                />
              ))
            : (
              <div className="col-span-3 py-10 text-center text-gray-400 dark:text-navy-400 text-sm">
                {locale === 'ja' ? 'このカテゴリの動画は近日公開予定です' : 'Videos for this concern coming soon'}
              </div>
            )}
        </div>
      </section>

      {/* Wellness Articles */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-linen-200 dark:bg-navy-700 rounded-xl flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-navy-600 dark:text-navy-300" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {locale === 'ja' ? 'ウェルネスコラム' : 'Wellness Articles'}
            </h2>
            <p className="text-sm text-gray-400 dark:text-navy-400">
              {locale === 'ja'
                ? 'アーユルヴェーダ · 食事 · 呼吸法 · マインドフルネス'
                : 'Ayurveda · Nutrition · Breathing · Mindfulness'}
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          {showStaticArticles
            ? staticArticles.map((col) => (
                <div
                  key={col.id}
                  className="bg-white dark:bg-navy-800 rounded-2xl p-6 border border-gray-100 dark:border-navy-700 shadow-sm"
                >
                  <span className="text-xs font-semibold text-sage-600 dark:text-sage-400 uppercase tracking-wider">
                    {locale === 'ja' ? col.category_ja : col.category}
                  </span>
                  <h3 className="font-bold text-gray-900 dark:text-white mt-2 mb-3 leading-snug">
                    {locale === 'ja' ? col.title_ja : col.title_en}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-navy-300 leading-relaxed">
                    {locale === 'ja' ? col.excerpt_ja : col.excerpt_en}
                  </p>
                  <p className="text-xs text-sage-500 dark:text-sage-400 mt-4 font-medium">
                    {locale === 'ja' ? '近日公開' : 'Coming soon'}
                  </p>
                </div>
              ))
            : hasArticles
            ? filteredArticles.map((article) => {
                const coverImage =
                  (article.image_urls)?.[0] ?? article.cover_image_url ?? null
                return (
                  <Link
                    key={article.id}
                    href={`/wellness/articles/${article.id}`}
                    className="bg-white dark:bg-navy-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-navy-700 shadow-sm hover:shadow-md transition-shadow block group"
                  >
                    {coverImage && (
                      <div className="h-40 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={coverImage}
                          alt={locale === 'ja' ? article.title_ja : article.title_en}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <span className="text-xs font-semibold text-sage-600 dark:text-sage-400 uppercase tracking-wider">
                        {article.category}
                      </span>
                      <h3 className="font-bold text-gray-900 dark:text-white mt-2 mb-3 leading-snug group-hover:text-navy-600 dark:group-hover:text-sage-400 transition-colors">
                        {locale === 'ja' ? article.title_ja : article.title_en}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-navy-300 leading-relaxed line-clamp-3">
                        {((locale === 'ja' ? article.content_ja : article.content_en) ?? '')
                          .replace(/<[^>]*>/g, ' ')
                          .replace(/\s+/g, ' ')
                          .trim()}
                      </p>
                      <p className="text-xs text-navy-500 dark:text-sage-400 mt-4 font-medium">
                        {article.profiles?.full_name ?? 'Reset Yoga'} →
                      </p>
                    </div>
                  </Link>
                )
              })
            : (
              <div className="col-span-3 py-10 text-center text-gray-400 dark:text-navy-400 text-sm">
                {locale === 'ja' ? 'このカテゴリのコラムは近日公開予定です' : 'Articles for this concern coming soon'}
              </div>
            )}
        </div>
      </section>
    </div>
  )
}
