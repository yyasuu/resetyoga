import { Resend } from 'resend'
import { format } from 'date-fns'

const resend = new Resend(process.env.RESEND_API_KEY ?? 're_placeholder_build')
const FROM = process.env.EMAIL_FROM || 'Reset Yoga <noreply@resetyoga.app>'

const BRAND_NAVY  = '#1B2B4B'
const BRAND_SAGE  = '#6B8069'
const BRAND_LINEN = '#F2ECE3'
const APP_URL     = process.env.NEXT_PUBLIC_APP_URL || 'https://tryresetyoga.com'

// ── Shared HTML primitives ─────────────────────────────────────────────────────

function emailLayout(content: string, footer = 'Reset Yoga Team') {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:${BRAND_LINEN};padding:24px;border-radius:12px;">
      ${content}
      <hr style="margin:32px 0;border:none;border-top:1px solid #ddd;" />
      <p style="color:#999;font-size:12px;">${footer}</p>
    </div>`
}

function infoCard(rows: string[], accent = BRAND_SAGE) {
  return `<div style="background:#fff;padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid ${accent};">
    ${rows.map((r) => `<p>${r}</p>`).join('')}
  </div>`
}

function ctaButton(label: string, href: string, color = BRAND_NAVY) {
  return `<a href="${href}" style="display:inline-block;background:${color};color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">${label}</a>`
}

function meetSection(meetLink: string | undefined, bookingsPath: string) {
  return meetLink
    ? `${ctaButton('Join Session', meetLink)}
       <p style="margin-top:16px;color:#666;font-size:14px;">You can also access this link anytime from <a href="${APP_URL}${bookingsPath}" style="color:${BRAND_NAVY};">My Bookings</a>.</p>`
    : `<p style="color:#666;font-size:14px;">Your session link is available in <a href="${APP_URL}${bookingsPath}" style="color:${BRAND_NAVY};">My Bookings</a>.</p>`
}

// ── Email functions ────────────────────────────────────────────────────────────

export async function sendBookingConfirmationStudent({
  to, studentName, instructorName, startTime, meetLink,
}: {
  to: string; studentName: string; instructorName: string; startTime: string; meetLink?: string
}) {
  const formattedTime = format(new Date(startTime), 'EEEE, MMMM d, yyyy • h:mm a zzz')
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Your Yoga Session with ${instructorName} is Confirmed`,
    html: emailLayout(`
      <h2 style="color:${BRAND_NAVY};">Session Confirmed ✓</h2>
      <p>Hi ${studentName},</p>
      <p>Your yoga session is confirmed. Here are the details:</p>
      ${infoCard([
        `<strong>Instructor:</strong> ${instructorName}`,
        `<strong>Date &amp; Time:</strong> ${formattedTime}`,
        `<strong>Duration:</strong> 45 minutes`,
      ])}
      ${meetSection(meetLink, '/bookings')}
    `),
  })
}

export async function sendBookingConfirmationInstructor({
  to, instructorName, studentName, startTime, meetLink,
}: {
  to: string; instructorName: string; studentName: string; startTime: string; meetLink?: string
}) {
  const formattedTime = format(new Date(startTime), 'EEEE, MMMM d, yyyy • h:mm a zzz')
  await resend.emails.send({
    from: FROM,
    to,
    subject: `New Booking: Session with ${studentName}`,
    html: emailLayout(`
      <h2 style="color:${BRAND_NAVY};">New Session Booked</h2>
      <p>Hi ${instructorName},</p>
      <p>A student has booked a session with you:</p>
      ${infoCard([
        `<strong>Student:</strong> ${studentName}`,
        `<strong>Date &amp; Time:</strong> ${formattedTime}`,
        `<strong>Duration:</strong> 45 minutes`,
      ])}
      ${meetSection(meetLink, '/instructor/bookings')}
    `),
  })
}

export async function sendCancellationEmail({
  to, name, otherPartyName, startTime,
}: {
  to: string; name: string; otherPartyName: string; startTime: string
}) {
  const formattedTime = format(new Date(startTime), 'EEEE, MMMM d, yyyy • h:mm a')
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Session Cancelled',
    html: emailLayout(`
      <h2 style="color:#ef4444;">Session Cancelled</h2>
      <p>Hi ${name},</p>
      <p>The yoga session scheduled for <strong>${formattedTime}</strong> with <strong>${otherPartyName}</strong> has been cancelled.</p>
      <p>We're sorry for the inconvenience. Please book another session at your convenience.</p>
    `),
  })
}

export async function sendSlotCreatedEmail({
  to, instructorName, startTime, endTime,
}: {
  to: string; instructorName: string; startTime: string; endTime: string
}) {
  const formattedDate  = format(new Date(startTime), 'EEEE, MMMM d, yyyy')
  const formattedStart = format(new Date(startTime), 'h:mm a')
  const formattedEnd   = format(new Date(endTime), 'h:mm a')
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Availability Added: ${formattedDate} ${formattedStart}`,
    html: emailLayout(`
      <h2 style="color:${BRAND_NAVY};">Slot Added ✓</h2>
      <p>Hi ${instructorName},</p>
      <p>Your availability has been added:</p>
      ${infoCard([
        `<strong>Date:</strong> ${formattedDate}`,
        `<strong>Time:</strong> ${formattedStart} – ${formattedEnd}`,
        `<strong>Duration:</strong> 45 minutes`,
      ])}
      <p style="color:#666;font-size:14px;">Students can now book this slot. We'll notify you as soon as someone books.</p>
      ${ctaButton('Manage Availability', `${APP_URL}/instructor/availability`)}
    `),
  })
}

export async function sendStudentWelcomeEmail({ to, name }: { to: string; name: string }) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Welcome to Reset Yoga!',
    html: emailLayout(`
      <h2 style="color:${BRAND_NAVY};">Welcome to Reset Yoga! 🧘</h2>
      <p>Hi ${name},</p>
      <p>Thank you for joining Reset Yoga. Your account is ready — you can now browse certified instructors and book your first 45-minute session.</p>
      ${infoCard([
        `<strong>Trial sessions:</strong> 2 free sessions included`,
        `<strong>After trial:</strong> $19.99 / month for 4 sessions`,
      ])}
      ${ctaButton('Find an Instructor', `${APP_URL}/instructors`)}
      <p style="margin-top:16px;color:#666;font-size:14px;">Reset your body and mind in 45 minutes.</p>
    `),
  })
}

export async function sendInstructorApplicationEmail({ to, name }: { to: string; name: string }) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Your Reset Yoga Instructor Application is Received',
    html: emailLayout(`
      <h2 style="color:${BRAND_NAVY};">Application Received!</h2>
      <p>Hi ${name},</p>
      <p>Thank you for applying to become a Reset Yoga instructor. We have received your application and will review it shortly.</p>
      ${infoCard([
        `Our team typically reviews applications within <strong>1–3 business days</strong>.`,
        `You will receive another email once your account is approved.`,
      ])}
      <p>If you have any questions, please reply to this email.</p>
    `),
  })
}

export async function sendInstructorTermsEmail({ to, name }: { to: string; name: string }) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Reset Yoga – Instructor Terms & Conditions',
    html: emailLayout(`
      <h2 style="color:${BRAND_NAVY};">Instructor Terms &amp; Conditions</h2>
      <p>Hi ${name},</p>
      <p>Thank you for registering as an instructor on Reset Yoga. Please review and keep a copy of our Instructor Terms &amp; Conditions.</p>
      ${infoCard([
        `<p style="font-weight:bold;color:#b91c1c;">⚠️ Non-Circumvention (Key Clause)</p>`,
        `<p style="font-size:14px;color:#374151;">You must not solicit, arrange, or conduct sessions with students found through Reset Yoga <strong>outside the Platform</strong>. This includes exchanging personal contact details (email, LINE, WhatsApp, etc.) for private lessons. This prohibition applies during your membership and for <strong>12 months</strong> after your last session. Violation results in immediate account termination.</p>`,
      ], '#ef4444')}
      ${infoCard([
        `<p style="font-size:14px;color:#374151;"><strong>Other key points:</strong></p>
         <ul style="font-size:14px;color:#374151;padding-left:20px;">
           <li>Conduct all sessions professionally and on time</li>
           <li>You operate as an independent contractor, not an employee</li>
           <li>Platform fees apply to all sessions booked through Reset Yoga</li>
           <li>Student data must be kept confidential</li>
         </ul>`,
      ])}
      ${ctaButton('Read Full Instructor Terms', `${APP_URL}/instructor-terms`)}
    `, 'Reset Yoga Team – support@tryresetyoga.com'),
  })
}

export async function sendStudentTermsEmail({ to, name }: { to: string; name: string }) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Reset Yoga – Student Terms & Conditions',
    html: emailLayout(`
      <h2 style="color:${BRAND_NAVY};">Student Terms &amp; Conditions</h2>
      <p>Hi ${name},</p>
      <p>Welcome to Reset Yoga! Please review and keep a copy of our Student Terms &amp; Conditions.</p>
      ${infoCard([
        `<p style="font-weight:bold;color:#b91c1c;">⚠️ Non-Circumvention (Key Clause)</p>`,
        `<p style="font-size:14px;color:#374151;">You must not contact or arrange lessons with instructors found through Reset Yoga <strong>outside the Platform</strong>. Exchanging personal contact info for private lessons is prohibited. This applies during your membership and for <strong>12 months</strong> after your last session. Violation results in immediate account termination.</p>`,
      ], '#ef4444')}
      ${infoCard([
        `<p style="font-size:14px;color:#374151;"><strong>Key points:</strong></p>
         <ul style="font-size:14px;color:#374151;padding-left:20px;">
           <li>Free trial: 2 sessions (card required, no charge)</li>
           <li>Monthly plan: $19.99/month for 4 sessions</li>
           <li>Cancel anytime from your account dashboard</li>
           <li>Cancellations within 12 hours of a session forfeit that session credit</li>
         </ul>`,
      ])}
      ${ctaButton('Read Full Student Terms', `${APP_URL}/student-terms`)}
    `, 'Reset Yoga Team – support@tryresetyoga.com'),
  })
}

export async function sendSessionReminderEmail({
  to, name, otherPartyName, startTime, meetLink, role,
}: {
  to: string; name: string; otherPartyName: string; startTime: string; meetLink: string; role: 'student' | 'instructor'
}) {
  const formattedTime = format(new Date(startTime), 'EEEE, MMMM d, yyyy • h:mm a')
  const bookingsPath  = role === 'instructor' ? '/instructor/bookings' : '/bookings'
  const withLabel     = role === 'instructor' ? `Student: ${otherPartyName}` : `Instructor: ${otherPartyName}`
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Your session starts in 5 minutes`,
    html: emailLayout(`
      <h2 style="color:${BRAND_NAVY};">Your session is starting soon! ⏰</h2>
      <p>Hi ${name},</p>
      <p>Your yoga session begins in <strong>5 minutes</strong>. Get ready!</p>
      ${infoCard([
        `<strong>${withLabel}</strong>`,
        `<strong>Time:</strong> ${formattedTime}`,
        `<strong>Duration:</strong> 45 minutes`,
      ])}
      ${ctaButton('Join Session Now', meetLink, '#16a34a')}
      <p style="margin-top:16px;color:#666;font-size:14px;">
        You can also find this link in <a href="${APP_URL}${bookingsPath}" style="color:${BRAND_NAVY};">My Bookings</a>.
      </p>
    `),
  })
}

export async function sendInstructorApprovalEmail({ to, name }: { to: string; name: string }) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Your Reset Yoga Instructor Account is Approved!',
    html: emailLayout(`
      <h2 style="color:${BRAND_NAVY};">You're Approved! 🎉</h2>
      <p>Hi ${name},</p>
      <p>Great news! Your instructor application has been approved. You can now log in and start setting your availability.</p>
      ${ctaButton('Set Your Availability', `${APP_URL}/instructor/availability`)}
      <p style="margin-top:16px;">Welcome to the Reset Yoga family!</p>
    `),
  })
}

export async function sendPasswordResetEmail({
  to, resetLink, locale = 'en',
}: {
  to: string; resetLink: string; locale?: string
}) {
  const isJa = locale === 'ja'
  await resend.emails.send({
    from: FROM,
    to,
    subject: isJa ? 'Reset Yoga — パスワードの再設定' : 'Reset Yoga — Reset your password',
    html: emailLayout(`
      <h2 style="color:${BRAND_NAVY};margin-top:0;">${isJa ? 'パスワードの再設定' : 'Reset your password'}</h2>
      <p style="color:#333;">${isJa
        ? 'パスワードの再設定リクエストを受け付けました。下のボタンをクリックして新しいパスワードを設定してください。'
        : 'We received a request to reset your password. Click the button below to set a new one.'}</p>
      <div style="text-align:center;margin:32px 0;">
        <a href="${resetLink}" style="display:inline-block;background:${BRAND_NAVY};color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;">
          ${isJa ? 'パスワードを再設定する' : 'Reset Password'}
        </a>
      </div>
      <p style="color:#666;font-size:13px;">${isJa
        ? 'このリンクは <strong>1時間</strong> 有効です。リクエストに心当たりがない場合は無視してください。'
        : 'This link expires in <strong>1 hour</strong>. If you did not request this, you can safely ignore this email.'}</p>
    `, isJa ? 'Reset Yoga チーム' : 'The Reset Yoga Team'),
  })
}

export async function sendCorporateInquiryAdmin({
  name, email, company, teamSize, plan, message,
}: {
  name: string; email: string; company: string; teamSize: string; plan?: string; message?: string
}) {
  const adminEmail = process.env.ADMIN_EMAIL || 'support@tryresetyoga.com'
  await resend.emails.send({
    from: FROM,
    to: adminEmail,
    subject: `[New B2B Lead] ${company} — ${plan ?? 'plan TBD'}`,
    html: emailLayout(`
      <h2 style="color:${BRAND_NAVY};margin-top:0;">New Corporate Inquiry</h2>
      ${infoCard([
        `<strong>Name:</strong> ${name}`,
        `<strong>Email:</strong> ${email}`,
        `<strong>Company:</strong> ${company}`,
        `<strong>Team Size:</strong> ${teamSize}`,
        `<strong>Plan Interest:</strong> ${plan ?? '—'}`,
        `<strong>Message:</strong> ${message ?? '—'}`,
      ])}
    `, 'Reset Yoga — for-teams inquiry'),
  })
}

export async function sendCorporateInquiryConfirmation({ to, name }: { to: string; name: string }) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'We received your Reset for Teams inquiry',
    html: emailLayout(`
      <h2 style="color:${BRAND_NAVY};margin-top:0;">Thanks, ${name}.</h2>
      <p style="color:#444;">We've received your inquiry about Reset for Teams and will get back to you within one business day.</p>
      <p style="color:#444;">In the meantime, feel free to explore our <a href="${APP_URL}/wellness" style="color:${BRAND_SAGE};">Wellness Library</a> — it's free and open to everyone.</p>
    `, 'Reset Yoga Team — reset your body and mind in 45 minutes.'),
  })
}
