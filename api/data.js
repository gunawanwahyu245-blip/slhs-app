const { requireAuth } = require('../lib/auth');
const { supabase } = require('../lib/supabase');

// Hanya dua key ini yang boleh dibaca/ditulis lewat endpoint ini.
const ALLOWED_KEYS = new Set(['sppg-records', 'sppg-lab-settings']);

module.exports = async function handler(req, res) {
  const session = requireAuth(req, res);
  if (!session) return; // requireAuth sudah mengirim response 401

  const key = (req.query && req.query.key) || '';
  if (!ALLOWED_KEYS.has(key)) {
    res.status(400).json({ error: 'Key tidak dikenal' });
    return;
  }

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('kv_store')
      .select('value, updated_at, updated_by')
      .eq('key', key)
      .maybeSingle();

    if (error) {
      res.status(500).json({ error: 'Gagal membaca data', detail: error.message });
      return;
    }
    if (!data) {
      res.status(200).json({ key, value: null, updated_at: null, updated_by: null });
      return;
    }
    res.status(200).json({ key, value: data.value, updated_at: data.updated_at, updated_by: data.updated_by });
    return;
  }

  if (req.method === 'PUT') {
    const body = req.body || {};
    if (!('value' in body)) {
      res.status(400).json({ error: 'Field value wajib diisi' });
      return;
    }
    const { error } = await supabase
      .from('kv_store')
      .upsert({
        key,
        value: body.value,
        updated_at: new Date().toISOString(),
        updated_by: session.nama || null,
      }, { onConflict: 'key' });

    if (error) {
      res.status(500).json({ error: 'Gagal menyimpan data', detail: error.message });
      return;
    }
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
};
