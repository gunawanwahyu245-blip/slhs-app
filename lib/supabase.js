const { createClient } = require('@supabase/supabase-js');

// PENTING: SUPABASE_SERVICE_ROLE_KEY hanya boleh dipakai di server (di sini),
// JANGAN PERNAH dikirim ke browser / dipakai di kode frontend.
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

module.exports = { supabase };
