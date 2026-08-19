const { signSession, buildSessionCookie } = require('../lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { password, nama } = req.body || {};

  if (!process.env.SHARED_PASSWORD) {
    res.status(500).json({ error: 'Server belum dikonfigurasi (SHARED_PASSWORD kosong)' });
    return;
  }

  if (!password || password !== process.env.SHARED_PASSWORD) {
    res.status(401).json({ error: 'Password salah' });
    return;
  }

  const token = signSession((nama || '').toString().slice(0, 80));
  res.setHeader('Set-Cookie', buildSessionCookie(token));
  res.status(200).json({ ok: true });
};
