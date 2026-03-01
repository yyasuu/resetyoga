'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'

export function Footer() {
  const t = useTranslations('footer')
  const nav = useTranslations('nav')

  return (
    <footer className="bg-navy-900 text-navy-300 pt-10 pb-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Top row */}
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
          {/* Brand */}
          <div>
            <span className="font-bold text-white text-lg tracking-wide">Reset Yoga</span>
            <p className="text-sm mt-2 text-navy-400 max-w-xs">
              Online yoga sessions with certified instructors from India, Japan, and beyond.
            </p>
          </div>

          {/* Nav links (no heading) */}
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/instructors" className="hover:text-white transition-colors">
              {nav('instructors')}
            </Link>
            <Link href="/register" className="hover:text-white transition-colors">
              {nav('register')}
            </Link>
            <Link href="/login" className="hover:text-white transition-colors">
              {nav('login')}
            </Link>
          </div>

          {/* Legal links (no heading) */}
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/tokusho" className="hover:text-white transition-colors">
              {t('tokusho')}
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              {t('terms')}
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              {t('privacy')}
            </Link>
            <Link href="/refund" className="hover:text-white transition-colors">
              {t('refund')}
            </Link>
          </div>
        </div>

        {/* Bottom row */}
        <div className="border-t border-navy-800 pt-4">
          <p className="text-xs text-navy-500 text-center">{t('copyright')}</p>
        </div>
      </div>
    </footer>
  )
}
