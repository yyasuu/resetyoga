import { Resend } from 'resend'
import { format } from 'date-fns'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.EMAIL_FROM || 'YogaConnect <noreply@yogaconnect.app>'

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
  meetLink: string
}) {
  const formattedTime = format(new Date(startTime), 'EEEE, MMMM d, yyyy • h:mm a zzz')

  await resend.emails.send({
    from: FROM,
    to,
    subject: `Your Yoga Session with ${instructorName} is Confirmed`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#4f46e5;">Session Confirmed!</h2>
        <p>Hi ${studentName},</p>
        <p>Your yoga session is confirmed. Here are the details:</p>
        <div style="background:#f5f5f5;padding:16px;border-radius:8px;margin:16px 0;">
          <p><strong>Instructor:</strong> ${instructorName}</p>
          <p><strong>Date &amp; Time:</strong> ${formattedTime}</p>
          <p><strong>Duration:</strong> 45 minutes</p>
        </div>
        <a href="${meetLink}" style="display:inline-block;background:#4f46e5;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">
          Join Google Meet
        </a>
        <p style="margin-top:16px;color:#666;font-size:14px;">
          The meeting link will be active 10 minutes before your session starts.
        </p>
        <hr style="margin:32px 0;border:none;border-top:1px solid #eee;" />
        <p style="color:#999;font-size:12px;">YogaConnect – Learn yoga from world-class instructors</p>
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
  meetLink: string
}) {
  const formattedTime = format(new Date(startTime), 'EEEE, MMMM d, yyyy • h:mm a zzz')

  await resend.emails.send({
    from: FROM,
    to,
    subject: `New Booking: Session with ${studentName}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#4f46e5;">New Session Booked</h2>
        <p>Hi ${instructorName},</p>
        <p>A student has booked a session with you:</p>
        <div style="background:#f5f5f5;padding:16px;border-radius:8px;margin:16px 0;">
          <p><strong>Student:</strong> ${studentName}</p>
          <p><strong>Date &amp; Time:</strong> ${formattedTime}</p>
          <p><strong>Duration:</strong> 45 minutes</p>
        </div>
        <a href="${meetLink}" style="display:inline-block;background:#4f46e5;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">
          Join Google Meet
        </a>
        <hr style="margin:32px 0;border:none;border-top:1px solid #eee;" />
        <p style="color:#999;font-size:12px;">YogaConnect – Connect with students worldwide</p>
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
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#ef4444;">Session Cancelled</h2>
        <p>Hi ${name},</p>
        <p>The yoga session scheduled for <strong>${formattedTime}</strong> with <strong>${otherPartyName}</strong> has been cancelled.</p>
        <p>We're sorry for the inconvenience. Please book another session at your convenience.</p>
        <hr style="margin:32px 0;border:none;border-top:1px solid #eee;" />
        <p style="color:#999;font-size:12px;">YogaConnect</p>
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
    subject: 'Your YogaConnect Instructor Account is Approved!',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#4f46e5;">You're Approved!</h2>
        <p>Hi ${name},</p>
        <p>Great news! Your instructor application has been approved. You can now log in and start setting your availability.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/instructor/availability" style="display:inline-block;background:#4f46e5;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">
          Set Your Availability
        </a>
        <p style="margin-top:16px;">Welcome to the YogaConnect family!</p>
        <hr style="margin:32px 0;border:none;border-top:1px solid #eee;" />
        <p style="color:#999;font-size:12px;">YogaConnect – Connect with students worldwide</p>
      </div>
    `,
  })
}
