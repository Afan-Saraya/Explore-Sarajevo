const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const SECRET = process.env.SESSION_JWT_SECRET || crypto.randomBytes(32).toString('hex');
const TOKEN_COOKIE = 'auth_token';
const TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days

function signToken(user) {
  const payload = { id: user.id, username: user.username, email: user.email, role: user.role };
  return jwt.sign(payload, SECRET, { expiresIn: TOKEN_TTL_SECONDS });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch (_) {
    return null;
  }
}

function setAuthCookie(res, token) {
  res.cookie(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: TOKEN_TTL_SECONDS * 1000
  });
}

function clearAuthCookie(res) {
  res.clearCookie(TOKEN_COOKIE);
}

module.exports = {
  signToken,
  verifyToken,
  setAuthCookie,
  clearAuthCookie,
  TOKEN_COOKIE
};
