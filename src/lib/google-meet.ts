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
  startTime: string
  endTime: string
  instructorEmail: string
  studentEmail: string
  instructorName: string
  studentName: string
}): Promise<{ meetLink: string; eventId: string }> {
  const roomId = `reset-yoga-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  const meetLink = `https://meet.jit.si/${roomId}`
  return { meetLink, eventId: roomId }
}
