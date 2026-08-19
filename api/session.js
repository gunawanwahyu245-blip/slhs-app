const { getSessionFromReq } = require('../lib/auth');

module.exports = async function handler(req, res) {
  const session = getSessionFromReq(req);
  if (!session) {
    res.status(200).json({ loggedIn: false });
    return;
  }
  res.status(200).json({ loggedIn: true, nama: session.nama || null });
};
