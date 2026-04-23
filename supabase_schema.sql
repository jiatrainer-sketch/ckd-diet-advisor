-- ════════════════════════════════════════════
-- CKD Diet Advisor — Supabase Schema (secure)
-- วิ่งใน Supabase SQL Editor
-- ════════════════════════════════════════════

create extension if not exists pgcrypto;

-- 1. patients
create table if not exists patients (
  id uuid primary key default gen_random_uuid(),
  claim_token uuid not null default gen_random_uuid(),
  name text not null,
  surname text not null,
  phone text,
  ckd_stage text,              -- '2','3a','3b','4','5','5d', null=ยังไม่รู้
  has_dm boolean default false,
  has_htn boolean default false,
  risk_level text,             -- 'low','medium','high'
  alb_level integer,
  pdpa_consent boolean default false,
  pdpa_consent_at timestamptz,
  pdpa_version text default 'v1',
  is_pilot boolean default false,
  registered_at timestamptz default now(),
  last_active timestamptz default now()
);

create index if not exists patients_claim_token_idx on patients(claim_token);

-- 2. food_logs
create table if not exists food_logs (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  meal_type text,
  food_name text,
  portion_grams integer,
  per_serving boolean default false,
  potassium numeric default 0,
  phosphorus numeric default 0,
  sodium numeric default 0,
  protein numeric default 0,
  calories numeric default 0,
  safety text,
  ai_analysis text,
  photo_used boolean default false,
  logged_at timestamptz default now()
);

create index if not exists food_logs_patient_date_idx on food_logs(patient_id, logged_at desc);

-- 3. photo_quota
create table if not exists photo_quota (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  quota_date date default current_date,
  count integer default 0,
  unique(patient_id, quota_date)
);

-- 4. doctor_notes
create table if not exists doctor_notes (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  note text,
  created_at timestamptz default now()
);

-- ════════════════════════════════════════════
-- Row Level Security
-- ────────────────────────────────────────────
-- Client uses anon key + header "x-patient-token" (= patients.claim_token)
--   → can read/write ONLY its own patient row & children.
-- Doctor dashboard talks to /api/doctor-* (server-side) with
-- SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS.
-- ════════════════════════════════════════════

alter table patients     enable row level security;
alter table food_logs    enable row level security;
alter table photo_quota  enable row level security;
alter table doctor_notes enable row level security;

-- helper: extract x-patient-token header from the current PostgREST request
create or replace function current_patient_token() returns uuid
language sql stable as $$
  select nullif(
    current_setting('request.headers', true)::jsonb ->> 'x-patient-token',
    ''
  )::uuid
$$;

-- ── patients ──
drop policy if exists "public_all"             on patients;
drop policy if exists "patients_insert"        on patients;
drop policy if exists "patients_select_own"    on patients;
drop policy if exists "patients_update_own"    on patients;

-- INSERT is done via register_patient() RPC (SECURITY DEFINER) — deny direct.
create policy "patients_select_own" on patients
  for select using (claim_token = current_patient_token());
create policy "patients_update_own" on patients
  for update using (claim_token = current_patient_token())
  with check     (claim_token = current_patient_token());

-- ── food_logs ──
drop policy if exists "public_all"           on food_logs;
drop policy if exists "food_logs_all_own"    on food_logs;
create policy "food_logs_all_own" on food_logs
  for all
  using (exists (select 1 from patients p
                 where p.id = food_logs.patient_id
                   and p.claim_token = current_patient_token()))
  with check (exists (select 1 from patients p
                 where p.id = food_logs.patient_id
                   and p.claim_token = current_patient_token()));

-- ── photo_quota ──
drop policy if exists "public_all"              on photo_quota;
drop policy if exists "photo_quota_all_own"     on photo_quota;
create policy "photo_quota_all_own" on photo_quota
  for all
  using (exists (select 1 from patients p
                 where p.id = photo_quota.patient_id
                   and p.claim_token = current_patient_token()))
  with check (exists (select 1 from patients p
                 where p.id = photo_quota.patient_id
                   and p.claim_token = current_patient_token()));

-- ── doctor_notes: patients can READ their own notes; INSERT/UPDATE only via server ──
drop policy if exists "public_all"                on doctor_notes;
drop policy if exists "doctor_notes_select_own"   on doctor_notes;
create policy "doctor_notes_select_own" on doctor_notes
  for select
  using (exists (select 1 from patients p
                 where p.id = doctor_notes.patient_id
                   and p.claim_token = current_patient_token()));

-- ════════════════════════════════════════════
-- RPCs
-- ════════════════════════════════════════════

-- register_patient: atomically create a patient and return its claim_token.
-- Runs as table owner so it can bypass the no-insert policy on patients.
create or replace function register_patient(
  p_name text,
  p_surname text,
  p_phone text,
  p_ckd_stage text,
  p_has_dm boolean,
  p_has_htn boolean,
  p_risk_level text,
  p_alb_level integer,
  p_is_pilot boolean
) returns table (id uuid, claim_token uuid)
language plpgsql security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_token uuid;
begin
  if p_name is null or length(trim(p_name)) = 0
     or p_surname is null or length(trim(p_surname)) = 0 then
    raise exception 'name/surname required';
  end if;

  insert into patients (
    name, surname, phone, ckd_stage, has_dm, has_htn,
    risk_level, alb_level, is_pilot,
    pdpa_consent, pdpa_consent_at, pdpa_version
  ) values (
    left(trim(p_name), 80),
    left(trim(p_surname), 80),
    nullif(left(trim(coalesce(p_phone,'')), 20), ''),
    p_ckd_stage, coalesce(p_has_dm, false), coalesce(p_has_htn, false),
    p_risk_level, p_alb_level, coalesce(p_is_pilot, false),
    true, now(), 'v1'
  )
  returning patients.id, patients.claim_token into v_id, v_token;

  return query select v_id, v_token;
end;
$$;

revoke all on function register_patient(text,text,text,text,boolean,boolean,text,integer,boolean) from public;
grant execute on function register_patient(text,text,text,text,boolean,boolean,text,integer,boolean) to anon, authenticated;

-- increment_photo_quota: verifies claim_token, then upserts the daily count.
create or replace function increment_photo_quota(p_patient_id uuid, p_date date)
returns integer language plpgsql security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  if not exists (
    select 1 from patients
    where id = p_patient_id
      and claim_token = current_patient_token()
  ) then
    raise exception 'forbidden';
  end if;

  insert into photo_quota (patient_id, quota_date, count)
  values (p_patient_id, p_date, 1)
  on conflict (patient_id, quota_date)
  do update set count = photo_quota.count + 1
  returning count into v_count;
  return v_count;
end;
$$;

revoke all on function increment_photo_quota(uuid, date) from public;
grant execute on function increment_photo_quota(uuid, date) to anon, authenticated;
