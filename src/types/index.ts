export type UserRole = 'instructor' | 'student' | 'admin'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  timezone: string
  created_at: string
  updated_at: string
}

export interface InstructorProfile {
  id: string
  bio: string | null
  tagline: string | null
  yoga_styles: string[]
  languages: string[]
  years_experience: number
  certifications: string[]
  career_history: string | null
  instagram_url: string | null
  youtube_url: string | null
  is_approved: boolean
  rating: number
  total_reviews: number
  created_at: string
  updated_at: string
}

export interface InstructorPayoutInfo {
  id: string
  bank_country: string
  bank_name: string | null
  swift_code: string | null
  account_number: string | null
  account_holder_name: string | null
  // legacy fields kept for backward compat
  bank_branch?: string | null
  account_type?: string | null
  account_holder_kana?: string | null
  created_at: string
  updated_at: string
}

export interface InstructorWithProfile extends Profile {
  instructor_profiles: InstructorProfile
}

export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'canceled' | 'incomplete'

export interface StudentSubscription {
  id: string
  student_id: string
  stripe_subscription_id: string | null
  stripe_customer_id: string | null
  status: SubscriptionStatus
  trial_used: number
  trial_limit: number
  sessions_used: number
  sessions_limit: number
  current_period_start: string | null
  current_period_end: string | null
  created_at: string
  updated_at: string
}

export type SlotStatus = 'available' | 'booked' | 'cancelled'

export interface TimeSlot {
  id: string
  instructor_id: string
  start_time: string
  end_time: string
  status: SlotStatus
  created_at: string
}

export type BookingStatus = 'confirmed' | 'cancelled' | 'completed'

export interface Booking {
  id: string
  student_id: string
  instructor_id: string
  slot_id: string
  google_meet_link: string | null
  google_calendar_event_id: string | null
  status: BookingStatus
  is_trial: boolean
  created_at: string
  updated_at: string
}

export interface BookingWithDetails extends Booking {
  time_slots: TimeSlot
  profiles: Profile  // instructor
  student?: Profile
}

export interface Review {
  id: string
  booking_id: string
  student_id: string
  instructor_id: string
  rating: number
  comment: string | null
  created_at: string
}

export const YOGA_STYLES = [
  'Hatha',
  'Vinyasa',
  'Ashtanga',
  'Iyengar',
  'Kundalini',
  'Yin',
  'Restorative',
  'Power Yoga',
  'Bikram',
  'Prenatal',
  'Chair Yoga',
  'Aerial Yoga',
] as const

export const LANGUAGES = [
  'English',
  'Japanese',
  'Hindi',
  'Sanskrit',
  'Spanish',
  'French',
  'German',
  'Portuguese',
  'Chinese',
  'Korean',
] as const

export const TIMEZONES = [
  { value: 'UTC', label: 'UTC' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'America/New_York', label: 'New York (EST)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
] as const
