'use client'

import { useTranslations } from 'next-intl'

export function Footer() {
  const t = useTranslations('footer')

  return (
    <footer className="bg-navy-900 text-navy-300 pt-6 pb-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Brand */}
        <div className="flex flex-col items-center gap-2 mb-4">
          <span className="font-bold text-white text-lg tracking-wide">Reset Yoga</span>
          <p className="text-sm text-navy-400 text-center max-w-xs">
            Online yoga sessions with certified instructors from India, Japan, and beyond.
          </p>
        </div>

        {/* Bottom row */}
        <div className="border-t border-navy-800 pt-4">
          <p className="text-xs text-navy-500 text-center">{t('copyright')}</p>
        </div>
      </div>
    </footer>
  )
}
