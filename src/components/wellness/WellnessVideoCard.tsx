'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Play, X, Sparkles, Lock } from 'lucide-react'
import { MemberGateModal } from './MemberGateModal'

interface VideoCardProps {
  video: {
    id: string
    title_ja: string
    title_en: string
    description_ja: string | null
    description_en: string | null
    video_url: string
    thumbnail_url: string | null
    duration_label: string | null
    category: string
    access_level?: string   // 'public' | 'member' | 'premium'
    is_premium?: boolean    // legacy fallback
  }
  gradient: string
  locale: string
  isLoggedIn: boolean
}

function getEmbedUrl(url: string): string | null {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`
  return null
}

function isDirectVideo(url: string): boolean {
  return /\.(mp4|webm|ogg|mov|avi)(\?|$)/i.test(url) ||
    url.includes('supabase.co/storage')
}

export function WellnessVideoCard({ video, gradient, locale, isLoggedIn }: VideoCardProps) {
  const [playing, setPlaying] = useState(false)
  const [showGateModal, setShowGateModal] = useState(false)
  const router = useRouter()

  // Derive access level (new field takes precedence over legacy is_premium)
  const accessLevel = video.access_level ?? (video.is_premium ? 'premium' : 'public')

  const handlePlay = () => {
    if (!isLoggedIn && (accessLevel === 'member' || accessLevel === 'premium')) {
      setShowGateModal(true)
      return
    }
    if (accessLevel === 'premium') {
      // Detail page handles the subscription paywall
      router.push(`/wellness/videos/${video.id}`)
      return
    }
    // public or logged-in member → play inline
    setPlaying(true)
  }

  const embedUrl = getEmbedUrl(video.video_url)
  const isDirect = isDirectVideo(video.video_url)
  const title = locale === 'ja' ? video.title_ja : video.title_en
  const description = locale === 'ja' ? video.description_ja : video.description_en

  return (
    <>
      <div className="bg-white dark:bg-navy-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-navy-700 shadow-sm hover:shadow-md transition-shadow">
        {/* Thumbnail */}
        <div
          className={`h-40 relative cursor-pointer ${video.thumbnail_url ? '' : `bg-gradient-to-br ${gradient}`} flex items-center justify-center`}
          onClick={handlePlay}
        >
          {video.thumbnail_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={video.thumbnail_url}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : null}
          <div className="w-14 h-14 bg-white/80 dark:bg-navy-900/80 rounded-full flex items-center justify-center shadow-md relative z-10 hover:scale-105 transition-transform">
            {!isLoggedIn && accessLevel !== 'public'
              ? <Lock className="h-6 w-6 text-sage-600 dark:text-sage-400" />
              : <Play className="h-6 w-6 text-sage-600 dark:text-sage-400 ml-0.5" />
            }
          </div>
          {video.duration_label && (
            <span className="absolute bottom-3 right-3 text-xs bg-navy-900/60 text-white px-2 py-0.5 rounded-full z-10">
              {video.duration_label}
            </span>
          )}
          {/* Access level badge */}
          {accessLevel === 'premium' && (
            <span className="absolute top-2 left-2 inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full z-10">
              <Sparkles className="h-3 w-3" />
              {locale === 'ja' ? 'プレミアム' : 'Premium'}
            </span>
          )}
          {accessLevel === 'member' && (
            <span className="absolute top-2 left-2 inline-flex items-center gap-1 text-[10px] font-bold bg-sage-100 dark:bg-sage-900/60 text-sage-700 dark:text-sage-400 px-2 py-0.5 rounded-full z-10">
              <Lock className="h-3 w-3" />
              {locale === 'ja' ? '無料会員' : 'Members'}
            </span>
          )}
        </div>

        <div className="p-5">
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
          {description && (
            <p className="text-sm text-gray-500 dark:text-navy-300 leading-relaxed">{description}</p>
          )}
        </div>
      </div>

      {/* Member gate modal */}
      {showGateModal && (
        <MemberGateModal
          contentPath={`/wellness/videos/${video.id}`}
          locale={locale}
          onClose={() => setShowGateModal(false)}
        />
      )}

      {/* Video modal (public or logged-in member) */}
      {playing && (
        <div
          className="fixed inset-0 z-[300] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPlaying(false)}
        >
          <div
            className="relative w-full max-w-3xl aspect-video bg-black rounded-xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setPlaying(false)}
              className="absolute top-3 right-3 z-10 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80"
            >
              <X className="h-4 w-4" />
            </button>
            {embedUrl ? (
              <iframe
                src={embedUrl}
                className="w-full h-full"
                allow="autoplay; fullscreen"
                allowFullScreen
              />
            ) : isDirect ? (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video
                src={video.video_url}
                className="w-full h-full"
                controls
                autoPlay
              />
            ) : (
              <div className="flex items-center justify-center h-full text-white text-sm">
                <a href={video.video_url} target="_blank" rel="noopener noreferrer" className="underline">
                  {locale === 'ja' ? '動画を開く' : 'Open Video'}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
