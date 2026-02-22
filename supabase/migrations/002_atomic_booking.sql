-- ============================================================
-- MIGRATION 002: Atomic booking RPCs + RLS hardening
-- ============================================================

-- ============================================================
-- 1. ATOMIC book_slot() RPC
--
-- Uses SELECT ... FOR UPDATE to lock the row, preventing the
-- race condition where two concurrent requests both see the
-- slot as 'available' and the winner's rollback corrupts state.
--
-- Returns:
--   booking_id  uuid   — created booking id (NULL on failure)
--   error_code  text   — NULL on success, or:
--                        'slot_not_available'  — already booked/cancelled
--                        'subscription_error'  — sub not found
-- ============================================================
create or replace function public.book_slot(
  p_slot_id              uuid,
  p_student_id           uuid,
  p_instructor_id        uuid,
  p_is_trial             boolean,
  p_meet_link            text    default null,
  p_calendar_event_id    text    default null
)
returns table(booking_id uuid, error_code text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_slot   record;
  v_sub    record;
  v_bid    uuid;
begin
  -- Lock the slot row (prevents concurrent booking of same slot)
  select * into v_slot
  from   public.time_slots
  where  id            = p_slot_id
    and  instructor_id = p_instructor_id
    and  status        = 'available'
  for update;           -- row-level lock held for this transaction

  if not found then
    return query select null::uuid, 'slot_not_available'::text;
    return;
  end if;

  -- Mark slot as booked
  update public.time_slots
  set    status = 'booked'
  where  id = p_slot_id;

  -- Insert booking record
  insert into public.bookings
    (student_id, instructor_id, slot_id,
     google_meet_link, google_calendar_event_id,
     status, is_trial)
  values
    (p_student_id, p_instructor_id, p_slot_id,
     p_meet_link, p_calendar_event_id,
     'confirmed', p_is_trial)
  returning id into v_bid;

  -- Increment session counter (all in same transaction)
  if p_is_trial then
    update public.student_subscriptions
    set    trial_used = trial_used + 1
    where  student_id = p_student_id;
  else
    update public.student_subscriptions
    set    sessions_used = sessions_used + 1
    where  student_id = p_student_id;
  end if;

  return query select v_bid, null::text;
end;
$$;

-- ============================================================
-- 2. ATOMIC cancel_booking() RPC
--
-- Cancellation rules:
--   · Cancellable: > 12 hours before start → full session refund
--   · Late cancel: ≤ 12 hours before start → no refund (1 session consumed)
--   · No-show:     session was already counted at booking → no change
--   · Past sessions: cannot cancel (booking already happened)
--   · Instructor cancels: always refunds the student regardless of deadline
--
-- Returns:
--   success       boolean
--   error_code    text     — NULL on success, or:
--                            'not_found'        — booking not found / not participant
--                            'already_cancelled'
--                            'past_session'     — session already happened
--   session_refunded boolean — true when the session count was returned
-- ============================================================
create or replace function public.cancel_booking(
  p_booking_id  uuid,
  p_user_id     uuid
)
returns table(success boolean, error_code text, session_refunded boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking      record;
  v_sub          record;
  v_slot_start   timestamptz;
  v_hours_until  numeric;
  v_refund       boolean := false;
  v_is_student   boolean;
begin
  -- Fetch the booking (lock both booking and its slot for atomicity)
  select b.*, ts.start_time as slot_start_time
  into   v_booking
  from   public.bookings     b
  join   public.time_slots   ts on ts.id = b.slot_id
  where  b.id = p_booking_id
    and  (b.student_id = p_user_id or b.instructor_id = p_user_id)
  for update;

  if not found then
    return query select false, 'not_found'::text, false;
    return;
  end if;

  if v_booking.status = 'cancelled' then
    return query select false, 'already_cancelled'::text, false;
    return;
  end if;

  v_slot_start  := v_booking.slot_start_time;
  v_hours_until := extract(epoch from (v_slot_start - now())) / 3600.0;

  -- Cannot cancel past sessions
  if v_hours_until < 0 then
    return query select false, 'past_session'::text, false;
    return;
  end if;

  -- Determine if refund applies
  v_is_student := (v_booking.student_id = p_user_id);

  if v_is_student then
    -- Student cancels: refund only if > 12 hours before start
    v_refund := (v_hours_until > 12);
  else
    -- Instructor cancels: always refund the student
    v_refund := true;
  end if;

  -- Cancel the booking
  update public.bookings
  set    status = 'cancelled'
  where  id = p_booking_id;

  -- Free up the slot
  update public.time_slots
  set    status = 'available'
  where  id = v_booking.slot_id;

  -- Refund session if applicable
  if v_refund then
    select * into v_sub
    from   public.student_subscriptions
    where  student_id = v_booking.student_id;

    if found then
      if v_booking.is_trial and v_sub.trial_used > 0 then
        update public.student_subscriptions
        set    trial_used = trial_used - 1
        where  student_id = v_booking.student_id;
      elsif not v_booking.is_trial and v_sub.sessions_used > 0 then
        update public.student_subscriptions
        set    sessions_used = sessions_used - 1
        where  student_id = v_booking.student_id;
      end if;
    end if;
  end if;

  return query select true, null::text, v_refund;
end;
$$;

-- ============================================================
-- 3. RLS HARDENING
-- ============================================================

-- Bookings: tighten UPDATE so students can ONLY set status='cancelled'
-- (prevents students from marking sessions as 'completed')
drop policy if exists "bookings_update_participant" on public.bookings;

create policy "bookings_update_student_cancel" on public.bookings
  for update
  using  (auth.uid() = student_id)
  with check (status = 'cancelled');   -- students may only cancel

create policy "bookings_update_instructor" on public.bookings
  for update
  using  (auth.uid() = instructor_id); -- instructors can update any field (complete, cancel)

-- Slots: prevent instructors from setting status='booked' directly
-- (only the book_slot() RPC — which is security definer — may do that)
drop policy if exists "slots_update_own" on public.time_slots;

create policy "slots_update_own" on public.time_slots
  for update
  using  (auth.uid() = instructor_id)
  with check (status in ('available', 'cancelled')); -- instructors cannot set 'booked' manually

-- Grant RPC execute to authenticated users
-- (security definer functions bypass RLS internally, but caller must be authed)
grant execute on function public.book_slot   to authenticated;
grant execute on function public.cancel_booking to authenticated;
