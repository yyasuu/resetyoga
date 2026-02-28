import { google } from 'googleapis'

function getGoogleAuth() {
  const credentials = {
    type: 'service_account',
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/calendar'],
  })

  return auth
}

export async function createMeetEvent({
  title,
  startTime,
  endTime,
  instructorEmail,
  studentEmail,
  instructorName,
  studentName,
}: {
  title: string
  startTime: string // ISO string
  endTime: string
  instructorEmail: string
  studentEmail: string
  instructorName: string
  studentName: string
}): Promise<{ meetLink: string; eventId: string }> {
  const auth = getGoogleAuth()
  const calendar = google.calendar({ version: 'v3', auth })

  const event = await calendar.events.insert({
    calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
    conferenceDataVersion: 1,
    requestBody: {
      summary: title,
      description: `Yoga session between ${instructorName} (instructor) and ${studentName} (student).\n\nPowered by Reset Yoga.`,
      start: {
        dateTime: startTime,
        timeZone: 'UTC',
      },
      end: {
        dateTime: endTime,
        timeZone: 'UTC',
      },
      conferenceData: {
        createRequest: {
          requestId: `yoga-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 60 },
          { method: 'popup', minutes: 10 },
        ],
      },
    },
  })

  const meetLink =
    event.data.conferenceData?.entryPoints?.find((ep) => ep.entryPointType === 'video')?.uri ||
    event.data.hangoutLink ||
    ''

  return {
    meetLink,
    eventId: event.data.id || '',
  }
}
