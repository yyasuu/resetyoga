import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendInstructorApplicationEmail, sendInstructorTermsEmail } from '@/lib/email'
import { z } from 'zod'

const ALLOWED_YOGA_STYLES = ['Hatha','Vinyasa','Ashtanga','Yin','Restorative','Kundalini','Bikram','Power','Prenatal','Kids','Chair','Aerial','Meditation','Breathwork','Other']
const ALLOWED_LANGUAGES   = ['English','Japanese','Hindi','Spanish','French','German','Portuguese','Korean','Chinese','Indonesian','Thai','Vietnamese','Other']
const URL_PATTERN = /^https?:\/\/(www\.)?(instagram\.com|youtube\.com|youtu\.be)\//

const InstructorOnboardingSchema = z.object({
  tagline:           z.string().max(60).optional().nullable(),
  bio:               z.string().max(3000).optional().nullable(),
  yogaStyles:        z.array(z.string()).refine(arr => arr.every(s => ALLOWED_YOGA_STYLES.includes(s)), { message: 'Invalid yoga style' }),
  languages:         z.array(z.string()).refine(arr => arr.every(l => ALLOWED_LANGUAGES.includes(l)), { message: 'Invalid language' }),
  yearsExperience:   z.number().int().min(0).max(60).default(1),
  certifications:    z.array(z.string().max(100)).max(20).default([]),
  careerHistory:     z.string().max(3000).optional().nullable(),
  // URL validation: accept any http/https URL or empty string (removed strict domain check)
  instagramUrl:      z.string().max(200).optional().nullable().or(z.literal('')),
  youtubeUrl:        z.string().max(200).optional().nullable().or(z.literal('')),
  bankCountry:       z.string().max(50).optional().nullable(),
  bankName:          z.string().max(100).optional().nullable(),
  // SWIFT: 8–11 uppercase alphanumeric, or empty/null (lenient: skip validation if blank)
  swiftCode:         z.string().max(11).optional().nullable().or(z.literal('')),
  ifscCode:          z.string().max(11).optional().nullable().or(z.literal('')),
  accountNumber:     z.string().max(50).optional().nullable(),
  accountHolderName: z.string().max(100).optional().nullable(),
})

/**
 * POST /api/onboarding/instructor
 *
 * Upserts instructor_profiles and instructor_payout_info for a newly onboarded
 * instructor. Uses the admin client (service_role) to bypass RLS, avoiding
 * issues that arise when new columns (from migration 003) or session timing
 * cause the browser client to fail.
 */
export async function POST(request: NextRequest) {
  try {
    // Verify auth via browser session
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const raw = await request.json()
    const parsed = InstructorOnboardingSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
    }
    const {
      tagline, bio, yogaStyles, languages, yearsExperience,
      certifications, careerHistory, instagramUrl, youtubeUrl,
      bankCountry, bankName, swiftCode, ifscCode, accountNumber, accountHolderName,
    } = parsed.data

    const adminSupabase = await createAdminClient()

    // Upsert instructor_profiles (bypasses RLS, handles missing columns safely)
    const { error: instructorError } = await adminSupabase
      .from('instructor_profiles')
      .upsert({
        id: user.id,
        tagline: tagline || null,
        bio: bio || null,
        yoga_styles: yogaStyles ?? [],
        languages: languages ?? [],
        years_experience: yearsExperience ?? 1,
        certifications: certifications ?? [],
        career_history: careerHistory || null,
        instagram_url: instagramUrl || null,
        youtube_url: youtubeUrl || null,
        is_approved: false,
      }, { onConflict: 'id' })

    if (instructorError) {
      console.error('[onboarding/instructor] instructor_profiles upsert error:', instructorError)
      return NextResponse.json(
        { error: instructorError.message, code: instructorError.code },
        { status: 500 }
      )
    }

    // Upsert payout info only if any bank field is provided
    if (bankName || accountNumber || accountHolderName) {
      const { error: payoutError } = await adminSupabase
        .from('instructor_payout_info')
        .upsert({
          id: user.id,
          bank_country: bankCountry || 'Japan',
          bank_name: bankName || null,
          swift_code: swiftCode || null,
          ifsc_code: ifscCode || null,
          account_number: accountNumber || null,
          account_holder_name: accountHolderName || null,
        }, { onConflict: 'id' })

      if (payoutError) {
        console.error('[onboarding/instructor] payout upsert error:', payoutError)
        // Non-fatal: instructor profile was saved, just payout info failed
        return NextResponse.json(
          { ok: true, payoutWarning: payoutError.message },
          { status: 200 }
        )
      }
    }

    // Send application received email (fire-and-forget)
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single()

    if (profile) {
      sendInstructorApplicationEmail({
        to: profile.email,
        name: profile.full_name || 'there',
      }).catch((err) => console.error('[onboarding/instructor] application email error:', err))

      sendInstructorTermsEmail({
        to: profile.email,
        name: profile.full_name || 'there',
      }).catch((err) => console.error('[onboarding/instructor] terms email error:', err))
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[onboarding/instructor] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
