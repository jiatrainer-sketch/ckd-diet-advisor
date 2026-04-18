-- ════════════════════════════════════════════
-- CKD Diet Advisor — Supabase Schema
-- วิ่งใน Supabase SQL Editor
-- ════════════════════════════════════════════

-- 1. ตารางคนไข้
create table if not exists patients (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  surname text not null,
  phone text,
  ckd_stage text,          -- '2','3a','3b','4','5','5d', null=ยังไม่รู้
  has_dm boolean default false,
  has_htn boolean default false,
  risk_level text,         -- 'low','medium','high'
  alb_level integer,       -- จาก QR คัดกรอง
  pdpa_consent boolean default false,
  is_pilot boolean default false,
  registered_at timestamptz default now(),
  last_active timestamptz default now()
);

-- 2. ตาราง food logs
create table if not exists food_logs (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references patients(id) on delete cascade,
  meal_type text,          -- 'breakfast','lunch','dinner','snack'
  food_name text,
  portion_grams integer default 100,
  potassium numeric default 0,
  phosphorus numeric default 0,
  sodium numeric default 0,
  protein numeric default 0,
  calories numeric default 0,
  safety text,             -- 'safe','caution','avoid'
  ai_analysis text,        -- JSON string จาก Claude
  photo_used boolean default false,
  logged_at timestamptz default now()
);

-- 3. ตาราง photo quota (จำกัดรูป/วัน)
create table if not exists photo_quota (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references patients(id) on delete cascade,
  quota_date date default current_date,
  count integer default 0,
  unique(patient_id, quota_date)
);

-- 4. ตาราง doctor notes
create table if not exists doctor_notes (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references patients(id) on delete cascade,
  note text,
  created_at timestamptz default now()
);

-- ════════════════════════════════════════════
-- Row Level Security (เปิด public read/write สำหรับ pilot)
-- ในอนาคตเปลี่ยนเป็น auth-based
-- ════════════════════════════════════════════
alter table patients enable row level security;
alter table food_logs enable row level security;
alter table photo_quota enable row level security;
alter table doctor_notes enable row level security;

create policy "public_all" on patients for all using (true) with check (true);
create policy "public_all" on food_logs for all using (true) with check (true);
create policy "public_all" on photo_quota for all using (true) with check (true);
create policy "public_all" on doctor_notes for all using (true) with check (true);

-- ════════════════════════════════════════════
-- RPC: increment photo quota (upsert)
-- ════════════════════════════════════════════
create or replace function increment_photo_quota(p_patient_id uuid, p_date date)
returns void language plpgsql as $$
begin
  insert into photo_quota (patient_id, quota_date, count)
  values (p_patient_id, p_date, 1)
  on conflict (patient_id, quota_date)
  do update set count = photo_quota.count + 1;
end;
$$;
