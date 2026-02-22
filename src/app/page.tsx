import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Profile } from '@/types'
import { Button } from '@/components/ui/button'
import { CheckCircle, Star, Video, Clock } from 'lucide-react'

export default async function LandingPage() {
  const t = await getTranslations('landing')

  let profile: Profile | null = null
  let instructors: any[] = []
  let user: { id: string } | null = null

  try {
    const supabase = await createClient()
    const { data: authData } = await supabase.auth.getUser()
    user = authData.user

    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      profile = data
    }

    const { data: instructorData } = await supabase
      .from('profiles')
      .select('*, instructor_profiles(*)')
      .eq('role', 'instructor')
      .limit(6)
    instructors = instructorData || []
  } catch {
    // Supabase not configured yet
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar user={profile} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pt-20 pb-28 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Star className="h-4 w-4 fill-indigo-500" />
            45+ certified instructors from India &amp; Japan
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            {t('hero_title')}
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">{t('hero_subtitle')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={user ? '/instructors' : '/register'}>
              <Button
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 text-lg h-auto"
              >
                {t('cta_start')}
              </Button>
            </Link>
            <Link href="/instructors">
              <Button
                size="lg"
                variant="outline"
                className="border-indigo-300 text-indigo-700 px-8 py-4 text-lg h-auto"
              >
                {t('cta_browse')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Star className="h-7 w-7 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('feature_1_title')}</h3>
            <p className="text-gray-600">{t('feature_1_desc')}</p>
          </div>
          <div className="text-center p-6">
            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Clock className="h-7 w-7 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('feature_2_title')}</h3>
            <p className="text-gray-600">{t('feature_2_desc')}</p>
          </div>
          <div className="text-center p-6">
            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Video className="h-7 w-7 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('feature_3_title')}</h3>
            <p className="text-gray-600">{t('feature_3_desc')}</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">{t('how_title')}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[t('how_1'), t('how_2'), t('how_3'), t('how_4')].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
                  {i + 1}
                </div>
                <p className="text-gray-700 font-medium">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Instructors */}
      {instructors && instructors.length > 0 && (
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Meet Our Instructors
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {instructors.map((instructor: any) => (
                <Link key={instructor.id} href={`/instructors/${instructor.id}`}>
                  <div className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-indigo-200 transition-all cursor-pointer group">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-lg font-bold">
                        {instructor.full_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                          {instructor.full_name}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-yellow-500">
                          <Star className="h-3 w-3 fill-yellow-400" />
                          <span className="text-gray-600">
                            {instructor.instructor_profiles?.rating?.toFixed(1) || '5.0'}
                          </span>
                        </div>
                      </div>
                    </div>
                    {instructor.instructor_profiles?.yoga_styles?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {instructor.instructor_profiles.yoga_styles.slice(0, 3).map((s: string) => (
                          <span
                            key={s}
                            className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/instructors">
                <Button variant="outline" size="lg" className="border-indigo-300 text-indigo-700">
                  View All Instructors
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Pricing */}
      <section className="py-20 px-4 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {t('pricing_title')}
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Free Trial */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('pricing_trial')}</h3>
              <p className="text-4xl font-extrabold text-gray-900 mb-4">
                $0
                <span className="text-base font-normal text-gray-500"> / 2 sessions</span>
              </p>
              <p className="text-gray-600 mb-6">{t('pricing_trial_desc')}</p>
              <ul className="space-y-3">
                {['2 free sessions', 'All instructors', 'Google Meet included'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="block mt-6">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">{t('cta_start')}</Button>
              </Link>
            </div>

            {/* Monthly */}
            <div className="bg-indigo-600 rounded-2xl p-8 border border-indigo-600 shadow-lg relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                POPULAR
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t('pricing_monthly')}</h3>
              <p className="text-4xl font-extrabold text-white mb-4">
                $19.99
                <span className="text-base font-normal text-indigo-200"> / month</span>
              </p>
              <p className="text-indigo-200 mb-6">{t('pricing_monthly_desc')}</p>
              <ul className="space-y-3">
                {[
                  '4 sessions per month',
                  'All instructors',
                  'Google Meet included',
                  'Cancel anytime',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-white">
                    <CheckCircle className="h-5 w-5 text-indigo-200 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="block mt-6">
                <Button className="w-full bg-white text-indigo-600 hover:bg-indigo-50">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Instructor CTA */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('instructor_cta_title')}</h2>
          <p className="text-xl text-gray-600 mb-8">{t('instructor_cta_desc')}</p>
          <Link href="/register?role=instructor">
            <Button
              size="lg"
              variant="outline"
              className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 px-8"
            >
              {t('instructor_cta_btn')}
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧘</span>
            <span className="font-bold text-white text-lg">YogaConnect</span>
          </div>
          <div className="flex gap-8 text-sm">
            <Link href="/instructors" className="hover:text-white transition-colors">
              Find Instructors
            </Link>
            <Link href="/register" className="hover:text-white transition-colors">
              Sign Up
            </Link>
            <Link href="/login" className="hover:text-white transition-colors">
              Log In
            </Link>
          </div>
          <p className="text-sm">© 2025 YogaConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
