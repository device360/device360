import express from 'express';
import crypto from 'crypto';
import { auth } from '../firebase.js';

const router = express.Router();

// ─── Role config ──────────────────────────────────────────────────────────────
const ROLE_PHONES = {
  admin:      process.env.ADMIN_PHONE      || '+919164405840',
  technician: process.env.TECHNICIAN_PHONE || '+919164405840',
  marketing:  process.env.MARKETING_PHONE  || '+919164405840',
};

// In-memory OTP store
const otpStore = {};

function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

// ─── POST /api/admin/send-otp ─────────────────────────────────────────────────
// Returns the phone number so the FRONTEND triggers Firebase Phone Auth
// (signInWithPhoneNumber) — same flow as customer OTP, zero extra SMS cost.
router.post('/send-otp', async (req, res) => {
  try {
    const { role } = req.body;

    if (!role || !ROLE_PHONES[role]) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const phone = ROLE_PHONES[role];
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    otpStore[role] = { otp, expiresAt };

    // Always log to server console (visible in Render dashboard)
    console.log(`\n╔══════════════════════════════════════════╗`);
    console.log(`║  [${role.toUpperCase()}] Admin OTP: ${otp}  → ${phone}  ║`);
    console.log(`╚══════════════════════════════════════════╝\n`);

    return res.json({
      success: true,
      phone,   // frontend uses this to call Firebase signInWithPhoneNumber
      message: `OTP ready for ${role}`,
    });
  } catch (err) {
    console.error('admin send-otp error:', err);
    return res.status(500).json({ error: 'Failed to generate OTP' });
  }
});

// ─── POST /api/admin/verify-otp ──────────────────────────────────────────────
// Mode 1 (idToken): Frontend completed Firebase Phone Auth → verify token
// Mode 2 (otp):     Simple backend code match (dev/fallback)
router.post('/verify-otp', async (req, res) => {
  try {
    const { role, otp, idToken } = req.body;

    if (!role) {
      return res.status(400).json({ error: 'role is required' });
    }

    // Mode 1: Firebase idToken
    if (idToken) {
      try {
        const decoded = await auth.verifyIdToken(idToken);
        const tokenPhone = decoded.phone_number;
        const expectedPhone = ROLE_PHONES[role];

        if (tokenPhone !== expectedPhone) {
          return res.status(401).json({
            error: 'Phone number does not match this role.',
          });
        }

        console.log(`[admin] Firebase verified: role=${role}, phone=${tokenPhone}`);
        return res.json({ success: true, message: 'Verified via Firebase' });
      } catch (tokenErr) {
        return res.status(401).json({ error: 'Invalid or expired Firebase token.' });
      }
    }

    // Mode 2: Simple OTP match
    if (!otp) {
      return res.status(400).json({ error: 'otp or idToken required' });
    }

    const record = otpStore[role];
    if (!record) {
      return res.status(400).json({ error: 'OTP not found. Request a new one.' });
    }
    if (Date.now() > record.expiresAt) {
      delete otpStore[role];
      return res.status(400).json({ error: 'OTP expired. Request a new one.' });
    }
    if (record.otp !== otp.trim()) {
      return res.status(400).json({ error: 'Incorrect OTP.' });
    }

    delete otpStore[role];
    console.log(`[admin] OTP verified: role=${role}`);
    return res.json({ success: true, message: 'OTP verified' });
  } catch (err) {
    console.error('admin verify-otp error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;