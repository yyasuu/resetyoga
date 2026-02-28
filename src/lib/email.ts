import { Resend } from 'resend'
import { format } from 'date-fns'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.EMAIL_FROM || 'Reset Yoga <noreply@resetyoga.app>'

// Brand colors (inline styles for email clients)
const BRAND_NAVY   = '#1B2B4B'
const BRAND_SAGE   = '#6B8069'
const BRAND_LINEN  = '#F2ECE3'

export async function sendBookingConfirmationStudent({
  to,
  studentName,
  instructorName,
  startTime,
  meetLink,
}: {
  to: string
  studentName: string
  instructorName: string
  startTime: string
  meetLink?: string
}) {
  const formattedTime = format(new Date(startTime), 'EEEE, MMMM d, yyyy • h:mm a zzz')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tryresetyoga.com'
  const meetSection = meetLink
    ? `<a href="${meetLink}" style="display:inline-block;background:${BRAND_NAVY};color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">Join Session</a>
       <p style="margin-top:16px;color:#666;font-size:14px;">You can also access this link anytime from <a href="${appUrl}/bookings" style="color:${BRAND_NAVY};">My Bookings</a> in your account.</p>`
    : `<p style="color:#666;font-size:14px;">Your session link is available in <a href="${appUrl}/bookings" style="color:${BRAND_NAVY};">My Bookings</a> in your account.</p>`

  await resend.emails.send({
    from: FROM,
    to,
    subject: `Your Yoga Session with ${instructorName} is Confirmed`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:${BRAND_LINEN};padding:24px;border-radius:12px;">
        <h2 style="color:${BRAND_NAVY};">Session Confirmed ✓</h2>
        <p>Hi ${studentName},</p>
        <p>Your yoga session is confirmed. Here are the details:</p>
        <div style="background:#fff;padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid ${BRAND_SAGE};">
          <p><strong>Instructor:</strong> ${instructorName}</p>
          <p><strong>Date &amp; Time:</strong> ${formattedTime}</p>
          <p><strong>Duration:</strong> 45 minutes</p>
        </div>
        ${meetSection}
        <hr style="margin:32px 0;border:none;border-top:1px solid #ddd;" />
        <p style="color:#999;font-size:12px;">Reset Yoga Team – Reset your body and mind in 45 minutes.</p>
      </div>
    `,
  })
}

export async function sendBookingConfirmationInstructor({
  to,
  instructorName,
  studentName,
  startTime,
  meetLink,
}: {
  to: string
  instructorName: string
  studentName: string
  startTime: string
  meetLink?: string
}) {
  const formattedTime = format(new Date(startTime), 'EEEE, MMMM d, yyyy • h:mm a zzz')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tryresetyoga.com'
  const meetSection = meetLink
    ? `<a href="${meetLink}" style="display:inline-block;background:${BRAND_NAVY};color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">Join Session</a>
       <p style="margin-top:16px;color:#666;font-size:14px;">You can also access this link anytime from <a href="${appUrl}/instructor/bookings" style="color:${BRAND_NAVY};">My Bookings</a> in your account.</p>`
    : `<p style="color:#666;font-size:14px;">Your session link is available in <a href="${appUrl}/instructor/bookings" style="color:${BRAND_NAVY};">My Bookings</a> in your account.</p>`

  await resend.emails.send({
    from: FROM,
    to,
    subject: `New Booking: Session with ${studentName}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:${BRAND_LINEN};padding:24px;border-radius:12px;">
        <h2 style="color:${BRAND_NAVY};">New Session Booked</h2>
        <p>Hi ${instructorName},</p>
        <p>A student has booked a session with you:</p>
        <div style="background:#fff;padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid ${BRAND_SAGE};">
          <p><strong>Student:</strong> ${studentName}</p>
          <p><strong>Date &amp; Time:</strong> ${formattedTime}</p>
          <p><strong>Duration:</strong> 45 minutes</p>
        </div>
        ${meetSection}
        <hr style="margin:32px 0;border:none;border-top:1px solid #ddd;" />
        <p style="color:#999;font-size:12px;">Reset Yoga Team</p>
      </div>
    `,
  })
}

export async function sendCancellationEmail({
  to,
  name,
  otherPartyName,
  startTime,
}: {
  to: string
  name: string
  otherPartyName: string
  startTime: string
}) {
  const formattedTime = format(new Date(startTime), 'EEEE, MMMM d, yyyy • h:mm a')

  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Session Cancelled',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:${BRAND_LINEN};padding:24px;border-radius:12px;">
        <h2 style="color:#ef4444;">Session Cancelled</h2>
        <p>Hi ${name},</p>
        <p>The yoga session scheduled for <strong>${formattedTime}</strong> with <strong>${otherPartyName}</strong> has been cancelled.</p>
        <p>We're sorry for the inconvenience. Please book another session at your convenience.</p>
        <hr style="margin:32px 0;border:none;border-top:1px solid #ddd;" />
        <p style="color:#999;font-size:12px;">Reset Yoga Team</p>
      </div>
    `,
  })
}

// ── Slot created: confirmation to instructor ──────────────────────────────────
export async function sendSlotCreatedEmail({
  to,
  instructorName,
  startTime,
  endTime,
}: {
  to: string
  instructorName: string
  startTime: string
  endTime: string
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tryresetyoga.com'
  const formattedDate = format(new Date(startTime), 'EEEE, MMMM d, yyyy')
  const formattedStart = format(new Date(startTime), 'h:mm a')
  const formattedEnd = format(new Date(endTime), 'h:mm a')

  await resend.emails.send({
    from: FROM,
    to,
    subject: `Availability Added: ${formattedDate} ${formattedStart}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:${BRAND_LINEN};padding:24px;border-radius:12px;">
        <h2 style="color:${BRAND_NAVY};">Slot Added ✓</h2>
        <p>Hi ${instructorName},</p>
        <p>Your availability has been added:</p>
        <div style="background:#fff;padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid ${BRAND_SAGE};">
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Time:</strong> ${formattedStart} – ${formattedEnd}</p>
          <p><strong>Duration:</strong> 45 minutes</p>
        </div>
        <p style="color:#666;font-size:14px;">Students can now book this slot. We'll notify you as soon as someone books.</p>
        <a href="${appUrl}/instructor/availability" style="display:inline-block;background:${BRAND_NAVY};color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">
          Manage Availability
        </a>
        <hr style="margin:32px 0;border:none;border-top:1px solid #ddd;" />
        <p style="color:#999;font-size:12px;">Reset Yoga Team</p>
      </div>
    `,
  })
}

// ── Registration: welcome email sent to new students ─────────────────────────
export async function sendStudentWelcomeEmail({
  to,
  name,
}: {
  to: string
  name: string
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tryresetyoga.com'
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Welcome to Reset Yoga!',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:${BRAND_LINEN};padding:24px;border-radius:12px;">
        <h2 style="color:${BRAND_NAVY};">Welcome to Reset Yoga! 🧘</h2>
        <p>Hi ${name},</p>
        <p>Thank you for joining Reset Yoga. Your account is ready — you can now browse certified instructors and book your first 45-minute session.</p>
        <div style="background:#fff;padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid ${BRAND_SAGE};">
          <p><strong>Trial sessions:</strong> 2 free sessions included</p>
          <p><strong>After trial:</strong> $19.99 / month for 4 sessions</p>
        </div>
        <a href="${appUrl}/instructors" style="display:inline-block;background:${BRAND_NAVY};color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">
          Find an Instructor
        </a>
        <p style="margin-top:16px;color:#666;font-size:14px;">Reset your body and mind in 45 minutes.</p>
        <hr style="margin:32px 0;border:none;border-top:1px solid #ddd;" />
        <p style="color:#999;font-size:12px;">Reset Yoga Team</p>
      </div>
    `,
  })
}

// ── Registration: application received email sent to new instructors ──────────
export async function sendInstructorApplicationEmail({
  to,
  name,
}: {
  to: string
  name: string
}) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Your Reset Yoga Instructor Application is Received',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:${BRAND_LINEN};padding:24px;border-radius:12px;">
        <h2 style="color:${BRAND_NAVY};">Application Received!</h2>
        <p>Hi ${name},</p>
        <p>Thank you for applying to become a Reset Yoga instructor. We have received your application and will review it shortly.</p>
        <div style="background:#fff;padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid ${BRAND_SAGE};">
          <p>Our team typically reviews applications within <strong>1–3 business days</strong>.</p>
          <p>You will receive another email once your account is approved.</p>
        </div>
        <p>If you have any questions, please reply to this email.</p>
        <hr style="margin:32px 0;border:none;border-top:1px solid #ddd;" />
        <p style="color:#999;font-size:12px;">Reset Yoga Team</p>
      </div>
    `,
  })
}

// ── 5-minute reminder: sent to both student and instructor ───────────────────
export async function sendSessionReminderEmail({
  to,
  name,
  otherPartyName,
  startTime,
  meetLink,
  role,
}: {
  to: string
  name: string
  otherPartyName: string
  startTime: string
  meetLink: string
  role: 'student' | 'instructor'
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tryresetyoga.com'
  const formattedTime = format(new Date(startTime), 'EEEE, MMMM d, yyyy • h:mm a')
  const bookingsUrl = role === 'instructor' ? `${appUrl}/instructor/bookings` : `${appUrl}/bookings`
  const withLabel = role === 'instructor' ? `Student: ${otherPartyName}` : `Instructor: ${otherPartyName}`

  await resend.emails.send({
    from: FROM,
    to,
    subject: `Your session starts in 5 minutes`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:${BRAND_LINEN};padding:24px;border-radius:12px;">
        <h2 style="color:${BRAND_NAVY};">Your session is starting soon! ⏰</h2>
        <p>Hi ${name},</p>
        <p>Your yoga session begins in <strong>5 minutes</strong>. Get ready!</p>
        <div style="background:#fff;padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid ${BRAND_SAGE};">
          <p><strong>${withLabel}</strong></p>
          <p><strong>Time:</strong> ${formattedTime}</p>
          <p><strong>Duration:</strong> 45 minutes</p>
        </div>
        <a href="${meetLink}" style="display:inline-block;background:#16a34a;color:white;padding:14px 28px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:16px;">
          Join Session Now
        </a>
        <p style="margin-top:16px;color:#666;font-size:14px;">
          You can also find this link in <a href="${bookingsUrl}" style="color:${BRAND_NAVY};">My Bookings</a>.
        </p>
        <hr style="margin:32px 0;border:none;border-top:1px solid #ddd;" />
        <p style="color:#999;font-size:12px;">Reset Yoga Team</p>
      </div>
    `,
  })
}

export async function sendInstructorApprovalEmail({
  to,
  name,
}: {
  to: string
  name: string
}) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Your Reset Yoga Instructor Account is Approved!',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:${BRAND_LINEN};padding:24px;border-radius:12px;">
        <h2 style="color:${BRAND_NAVY};">You're Approved! 🎉</h2>
        <p>Hi ${name},</p>
        <p>Great news! Your instructor application has been approved. You can now log in and start setting your availability.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/instructor/availability" style="display:inline-block;background:${BRAND_NAVY};color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">
          Set Your Availability
        </a>
        <p style="margin-top:16px;">Welcome to the Reset Yoga family!</p>
        <hr style="margin:32px 0;border:none;border-top:1px solid #ddd;" />
        <p style="color:#999;font-size:12px;">Reset Yoga Team</p>
      </div>
    `,
  })
}
