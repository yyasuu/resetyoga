'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Lock, X } from 'lucide-react'

interface MemberGateModalProps {
  contentPath: string
  locale: string
  onClose: () => void
}

export function MemberGateModal({ contentPath, locale, onClose }: MemberGateModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const loginHref = `/login?from=${encodeURIComponent(contentPath)}`
  const registerHref = `/register?from=${encodeURIComponent(contentPath)}`

  return (
    <div
      className="fixed inset-0 z-[400] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-navy-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 relative"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-gray-100 dark:bg-navy-700 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="w-14 h-14 bg-sage-100 dark:bg-sage-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="h-7 w-7 text-sage-600 dark:text-sage-400" />
        </div>

        <h3 className="text-center font-bold text-gray-900 dark:text-white text-lg mb-2">
          {locale === 'ja' ? 'この機能はロックされています' : 'This content is locked'}
        </h3>

        <p className="text-center text-sm text-gray-500 dark:text-navy-300 leading-relaxed mb-6">
          {locale === 'ja'
            ? 'このコンテンツを見るにはログインをする必要があります。他にもログインならではのサービスがありますので、是非ログインしてみてください。'
            : 'You need to log in to access this content. Logging in unlocks many more features and services!'}
        </p>

        <div className="flex flex-col gap-2">
          <Link
            href={loginHref}
            className="w-full py-2.5 bg-sage-500 hover:bg-sage-600 text-white text-sm font-semibold rounded-full text-center transition-colors"
          >
            {locale === 'ja' ? 'ログイン' : 'Log in'}
          </Link>
          <Link
            href={registerHref}
            className="w-full py-2.5 bg-white dark:bg-navy-700 border border-gray-200 dark:border-navy-600 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-full text-center hover:bg-gray-50 dark:hover:bg-navy-600 transition-colors"
          >
            {locale === 'ja' ? '新規登録（無料）' : 'Sign up free'}
          </Link>
          <button
            onClick={onClose}
            className="w-full py-2 text-sm text-gray-400 dark:text-navy-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  )
}
