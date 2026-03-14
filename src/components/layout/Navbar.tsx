'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Menu, X, ChevronDown } from 'lucide-react'
import { Profile } from '@/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ThemeToggle } from '@/components/ui/theme-toggle'

interface NavbarProps {
  user: Profile | null
}

export function Navbar({ user }: NavbarProps) {
  const t = useTranslations('nav')
  const [menuOpen, setMenuOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const langRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)

  // Close dropdowns on outside click
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false)
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  const handleLogout = async () => {
    setUserOpen(false)
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const handleLocaleChange = (locale: string) => {
    setLangOpen(false)
    const isTokusho = pathname === '/tokusho' || pathname === '/tokusho/en'
    if (isTokusho) {
      router.push(locale === 'en' ? '/tokusho/en' : '/tokusho')
      return
    }
    document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000`
    window.location.reload()
  }

  const getDashboardLink = () => {
    if (!user) return '/login'
    if (user.role === 'instructor') return '/instructor/dashboard'
    if (user.role === 'admin') return '/admin/dashboard'
    return '/dashboard'
  }

  const getWellnessLink = () => {
    if (user?.role === 'admin') return '/admin/wellness'
    return '/wellness'
  }

  const dropdownItem = 'block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-navy-700 transition-colors cursor-pointer'

  return (
    <nav className="bg-white dark:bg-navy-900 border-b border-gray-100 dark:border-navy-700 sticky top-0 z-50 transition-colors overflow-visible">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-[72px]">

          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/reset-yoga-logo.png"
              alt="Reset Yoga"
              width={1536}
              height={1024}
              className="h-[121px] w-auto object-contain dark:brightness-[2.5] dark:saturate-[0.8]"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-5">
            <Link
              href="/instructors"
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-navy-700 dark:hover:text-sage-400 transition-colors"
            >
              {t('instructors')}
            </Link>

            <Link
              href="/wellness"
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-navy-700 dark:hover:text-sage-400 transition-colors"
            >
              Wellness
            </Link>

            <Link
              href="/wellness/poses"
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-navy-700 dark:hover:text-sage-400 transition-colors"
            >
              Poses
            </Link>

            <Link
              href="/wellness/poses/anatomy"
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-navy-700 dark:hover:text-sage-400 transition-colors"
            >
              Science
            </Link>

            <Link
              href="/premium"
              className="text-sm font-medium text-sage-600 dark:text-sage-400 hover:text-sage-500 dark:hover:text-sage-300 transition-colors flex items-center gap-1"
            >
              <span className="text-[11px]">✦</span> Premium
            </Link>

            <Link
              href="/vision"
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-navy-700 dark:hover:text-sage-400 transition-colors"
            >
              Vision
            </Link>

            <Link
              href="/corporate"
              className="text-sm font-medium text-navy-600 dark:text-navy-300 hover:text-navy-800 dark:hover:text-sage-400 transition-colors"
            >
              For Teams
            </Link>

            {/* Language switcher — custom dropdown, no Radix portal */}
            <div ref={langRef} className="relative">
              <button
                onClick={() => setLangOpen((o) => !o)}
                className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 hover:text-navy-600 dark:hover:text-sage-400 px-2 py-1 rounded-md hover:bg-gray-50 dark:hover:bg-navy-800 transition-colors"
              >
                EN / JA
                <ChevronDown className={`h-3 w-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-navy-800 border border-gray-100 dark:border-navy-700 rounded-lg shadow-lg py-1 min-w-[120px] z-[200]">
                  <button onClick={() => handleLocaleChange('en')} className={dropdownItem}>
                    English
                  </button>
                  <button onClick={() => handleLocaleChange('ja')} className={dropdownItem}>
                    日本語
                  </button>
                </div>
              )}
            </div>

            {/* Dark mode toggle */}
            <ThemeToggle />

            {/* User dropdown — custom, no Radix portal */}
            {user ? (
              <div ref={userRef} className="relative">
                <button
                  onClick={() => setUserOpen((o) => !o)}
                  className="flex items-center gap-2 h-auto px-1 py-1 rounded-md hover:bg-gray-50 dark:hover:bg-navy-800 transition-colors"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url || ''} />
                    <AvatarFallback className="bg-navy-100 dark:bg-navy-700 text-navy-600 dark:text-navy-200 text-sm">
                      {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {user.full_name || user.email}
                  </span>
                  <ChevronDown className={`h-3 w-3 text-gray-500 dark:text-gray-400 transition-transform ${userOpen ? 'rotate-180' : ''}`} />
                </button>
                {userOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-white dark:bg-navy-800 border border-gray-100 dark:border-navy-700 rounded-lg shadow-lg py-1 w-52 z-[200]">
                    <button
                      onClick={() => { setUserOpen(false); router.push(getDashboardLink()) }}
                      className={dropdownItem}
                    >
                      {t('dashboard')}
                    </button>
                    <button
                      onClick={() => { setUserOpen(false); router.push(getWellnessLink()) }}
                      className={dropdownItem}
                    >
                      Wellness Library
                    </button>
                    {user?.role === 'admin' && (
                      <>
                        <div className="my-1 border-t border-gray-100 dark:border-navy-700" />
                        <button
                          onClick={() => { setUserOpen(false); router.push('/admin/wellness') }}
                          className={dropdownItem}
                        >
                          Poses 管理
                        </button>
                        <button
                          onClick={() => { setUserOpen(false); router.push('/wellness/poses/anatomy') }}
                          className={dropdownItem}
                        >
                          Yoga & Science
                        </button>
                      </>
                    )}
                    <div className="my-1 border-t border-gray-100 dark:border-navy-700" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-navy-700 transition-colors cursor-pointer"
                    >
                      {t('logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login">
                  <Button variant="ghost" className="text-gray-700 dark:text-gray-200">
                    {t('login')}
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-navy-600 hover:bg-navy-700 text-white">
                    {t('register')}
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-md text-gray-600 dark:text-gray-300"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-navy-700 bg-white dark:bg-navy-900 px-4 py-4 space-y-3">
          <Link
            href="/instructors"
            className="block text-gray-600 dark:text-gray-300 font-medium"
            onClick={() => setMenuOpen(false)}
          >
            {t('instructors')}
          </Link>
          <Link
            href="/wellness"
            className="block text-gray-600 dark:text-gray-300 font-medium"
            onClick={() => setMenuOpen(false)}
          >
            Wellness
          </Link>
          <Link
            href="/wellness/poses"
            className="block text-gray-600 dark:text-gray-300 font-medium"
            onClick={() => setMenuOpen(false)}
          >
            Poses
          </Link>
          <Link
            href="/wellness/poses/anatomy"
            className="block text-gray-600 dark:text-gray-300 font-medium"
            onClick={() => setMenuOpen(false)}
          >
            Science
          </Link>
          <Link
            href="/premium"
            className="block text-sage-600 dark:text-sage-400 font-semibold"
            onClick={() => setMenuOpen(false)}
          >
            ✦ Premium
          </Link>
          <Link
            href="/vision"
            className="block text-gray-600 dark:text-gray-300 font-medium"
            onClick={() => setMenuOpen(false)}
          >
            Vision
          </Link>
          <Link
            href="/corporate"
            className="block text-navy-700 dark:text-navy-200 font-medium"
            onClick={() => setMenuOpen(false)}
          >
            For Teams
          </Link>
          {user ? (
            <>
              <Link
                href={getDashboardLink()}
                className="block text-gray-600 dark:text-gray-300 font-medium"
                onClick={() => setMenuOpen(false)}
              >
                {t('dashboard')}
              </Link>
              <Link
                href={getWellnessLink()}
                className="block text-gray-600 dark:text-gray-300 font-medium"
                onClick={() => setMenuOpen(false)}
              >
                Wellness Library
              </Link>
              <button onClick={handleLogout} className="block text-red-600 dark:text-red-400 font-medium">
                {t('logout')}
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="block" onClick={() => setMenuOpen(false)}>
                <Button variant="outline" className="w-full dark:border-navy-600 dark:text-gray-200">
                  {t('login')}
                </Button>
              </Link>
              <Link href="/register" className="block" onClick={() => setMenuOpen(false)}>
                <Button className="w-full bg-navy-600 hover:bg-navy-700 text-white">
                  {t('register')}
                </Button>
              </Link>
            </>
          )}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => handleLocaleChange('en')}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-navy-600 dark:hover:text-sage-400"
            >
              English
            </button>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <button
              onClick={() => handleLocaleChange('ja')}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-navy-600 dark:hover:text-sage-400"
            >
              日本語
            </button>
            <div className="ml-auto">
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
