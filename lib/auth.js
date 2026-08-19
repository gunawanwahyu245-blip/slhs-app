const jwt = require('jsonwebtoken');
const cookie = require('cookie');

const COOKIE_NAME = 'sppg_session';
const SESSION_DAYS = 7;

function signSession(petugasName) {
  return jwt.sign(
    { sub: 'sppg-petugas', nama: petugasName || null },
    process.env.SESSION_SECRET,
    { expiresIn: `${SESSION_DAYS}d` }
  );
}

// Vercel selalu menyajikan lewat HTTPS (VERCEL env var otomatis di-set di
// sana). Saat dites lokal lewat `vercel dev` (biasanya http://localhost),
// cookie "secure" tidak akan pernah terkirim browser -- jadi dimatikan
// khusus untuk kondisi lokal itu.
const isProd = !!process.env.VERCEL;

function buildSessionCookie(token) {
  return cookie.serialize(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

function buildClearCookie() {
  return cookie.serialize(COOKIE_NAME, '', {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

function getSessionFromReq(req) {
  const raw = req.headers.cookie || '';
  const parsed = cookie.parse(raw);
  const token = parsed[COOKIE_NAME];
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.SESSION_SECRET);
  } catch (e) {
    return null;
  }
}

/** Dipakai di awal setiap API yang butuh login. Mengembalikan session atau
 *  langsung mengirim response 401 dan mengembalikan null. */
function requireAuth(req, res) {
  const session = getSessionFromReq(req);
  if (!session) {
    res.status(401).json({ error: 'Belum login' });
    return null;
  }
  return session;
}

module.exports = {
  COOKIE_NAME,
  signSession,
  buildSessionCookie,
  buildClearCookie,
  getSessionFromReq,
  requireAuth,
};
