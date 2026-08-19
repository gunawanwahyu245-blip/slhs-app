-- Jalankan ini sekali di Supabase: Dashboard > SQL Editor > New query > paste > Run

create table if not exists kv_store (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by text
);

-- Row Level Security dimatikan sengaja: semua akses ke tabel ini HANYA lewat
-- backend (api/data.js) memakai service role key, browser tidak pernah
-- menyentuh Supabase secara langsung, jadi RLS tidak diperlukan di sini.
alter table kv_store disable row level security;
