import { getRequestConfig } from 'next-intl/server'
import { cookies, headers } from 'next/headers'

export default getRequestConfig(async () => {
  // Try to get locale from cookie, then Accept-Language header
  const cookieStore = await cookies()
  const headersList = await headers()

  let locale = cookieStore.get('NEXT_LOCALE')?.value

  if (!locale) {
    const acceptLanguage = headersList.get('accept-language') || ''
    locale = acceptLanguage.startsWith('ja') ? 'ja' : 'en'
  }

  if (!['en', 'ja'].includes(locale)) {
    locale = 'en'
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  }
})
