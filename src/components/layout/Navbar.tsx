'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { Profile } from '@/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ThemeToggle } from '@/components/ui/theme-toggle'

interface NavbarProps {
  user: Profile | null
}

export function Navbar({ user }: NavbarProps) {
  const t = useTranslations('nav')
  const [menuOpen, setMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Defer Radix DropdownMenus to client only to avoid React 19 useId() SSR mismatch
  useEffect(() => { setMounted(true) }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const handleLocaleChange = (locale: string) => {
    document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000`
    window.location.reload()
  }

  const getDashboardLink = () => {
    if (!user) return '/login'
    if (user.role === 'instructor') return '/instructor/dashboard'
    if (user.role === 'admin') return '/admin/dashboard'
    return '/dashboard'
  }

  return (
    <nav className="bg-white dark:bg-navy-900 border-b border-gray-100 dark:border-navy-700 sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo — place the PNG at /public/reset-yoga-logo.png */}
          <Link href="/" className="flex items-center">
            <Image
              src="/reset-yoga-logo.png"
              alt="Reset Yoga"
              width={160}
              height={52}
              className="h-11 w-auto object-contain dark:brightness-90"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/instructors"
              className="text-gray-600 dark:text-gray-300 hover:text-navy-600 dark:hover:text-sage-400 font-medium transition-colors"
            >
              {t('instructors')}
            </Link>

            {/* Language switcher — mounted guard prevents Radix useId() SSR mismatch */}
            {mounted && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 text-gray-600 dark:text-gray-300 hover:text-navy-600 dark:hover:text-sage-400"
                  >
                    <span className="text-sm">EN / JA</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="dark:bg-navy-800 dark:border-navy-700">
                  <DropdownMenuItem
                    onClick={() => handleLocaleChange('en')}
                    className="dark:text-gray-200 dark:hover:bg-navy-700"
                  >
                    English
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleLocaleChange('ja')}
                    className="dark:text-gray-200 dark:hover:bg-navy-700"
                  >
                    日本語
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Dark mode toggle */}
            <ThemeToggle />

            {mounted && (
              user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 h-auto p-1">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar_url || ''} />
                        <AvatarFallback className="bg-navy-100 dark:bg-navy-700 text-navy-600 dark:text-navy-200 text-sm">
                          {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        {user.full_name || user.email}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 dark:bg-navy-800 dark:border-navy-700">
                    <DropdownMenuItem asChild className="dark:text-gray-200 dark:hover:bg-navy-700">
                      <Link href={getDashboardLink()}>{t('dashboard')}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-600 dark:text-red-400"
                    >
                      {t('logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
              )
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
          {user ? (
            <>
              <Link
                href={getDashboardLink()}
                className="block text-gray-600 dark:text-gray-300 font-medium"
                onClick={() => setMenuOpen(false)}
              >
                {t('dashboard')}
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
