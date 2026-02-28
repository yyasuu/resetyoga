-- Add reminder_sent flag to bookings so the cron job doesn't send duplicate reminder emails
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS reminder_sent boolean NOT NULL DEFAULT false;
