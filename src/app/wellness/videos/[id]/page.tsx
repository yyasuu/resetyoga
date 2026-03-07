import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

function getEmbedUrl(url: string): string | null {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  return null
}

function isDirectVideo(url: string): boolean {
  return /\.(mp4|webm|ogg|mov|avi)(\?|$)/i.test(url) || url.includes('supabase.co/storage')
}

export default async function VideoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value === 'ja' ? 'ja' : 'en'

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?from=/wellness/videos/${id}`)

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/login')

  const { data: video } = await supabase
    .from('wellness_videos')
    .select('*')
    .eq('id', id)
    .eq('is_published', true)
    .single()

  if (!video) notFound()

  const title = locale === 'ja' ? video.title_ja : video.title_en
  const description = locale === 'ja' ? video.description_ja : video.description_en
  const embedUrl = getEmbedUrl(video.video_url)
  const isDirect = isDirectVideo(video.video_url)

  return (
    <div className="min-h-screen bg-linen-50 dark:bg-navy-900 flex flex-col">
      <Navbar user={profile} />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-12">
        <Link
          href="/wellness"
          className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-navy-300 hover:text-navy-600 dark:hover:text-sage-400 mb-8"
        >
          <ChevronLeft className="h-4 w-4" />
          {locale === 'ja' ? 'ウェルネスライブラリへ戻る' : 'Back to Wellness Library'}
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-snug mb-3">
          {title}
        </h1>
        {video.duration_label && (
          <p className="text-sm text-sage-600 dark:text-sage-400 mb-6">{video.duration_label}</p>
        )}

        {/* Video Player */}
        <div className="rounded-2xl overflow-hidden bg-black aspect-video mb-8 shadow-lg">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          ) : isDirect ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video src={video.video_url} className="w-full h-full" controls />
          ) : (
            <div className="flex items-center justify-center h-full text-white text-sm">
              <a href={video.video_url} target="_blank" rel="noopener noreferrer" className="underline">
                {locale === 'ja' ? '動画を開く' : 'Open Video'}
              </a>
            </div>
          )}
        </div>

        {description && (
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
            {description}
          </p>
        )}
      </main>

      <Footer />
    </div>
  )
}
