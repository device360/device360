import express from 'express';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const router = express.Router();

// ─── Role config ──────────────────────────────────────────────────────────────
// Phone numbers per role — OTP SMS will be sent here.
// For SMS we use Fast2SMS (free tier, India). You can also use Twilio.
// Fallback: if SMS is not configured, OTP is logged to console (dev mode).
const ROLE_PHONES = {
  admin:      process.env.ADMIN_PHONE      || '+919164405840',
  technician: process.env.TECHNICIAN_PHONE || '+919164405840',
  marketing:  process.env.MARKETING_PHONE  || '+919164405840',
};

// In-memory OTP store: { [role]: { otp, expiresAt } }
const otpStore = {};

// ─── Generate OTP ─────────────────────────────────────────────────────────────
function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

// ─── Send SMS via Fast2SMS (free, India) ─────────────────────────────────────
// Sign up at https://www.fast2sms.com — get API key — add FAST2SMS_API_KEY to .env
async function sendSMS(phone, otp) {
  const apiKey = process.env.FAST2SMS_API_KEY;

  if (!apiKey) {
    // No SMS provider configured — log to console for dev/testing
    console.log(`\n╔══════════════════════════════════╗`);
    console.log(`║  Admin OTP: ${otp}  (to ${phone})  ║`);
    console.log(`╚══════════════════════════════════╝\n`);
    return;
  }

  // Strip country code for Fast2SMS (expects 10-digit Indian number)
  const number = phone.replace(/^\+91/, '').replace(/\D/g, '');

  const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
    method: 'POST',
    headers: {
      authorization: apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      route: 'otp',
      variables_values: otp,
      numbers: number,
    }),
  });

  const data = await res.json();
  if (!data.return) {
    throw new Error(`SMS failed: ${JSON.stringify(data)}`);
  }
}

// ─── POST /api/admin/send-otp ─────────────────────────────────────────────────
// Body: { role: 'admin' | 'technician' | 'marketing' }
router.post('/send-otp', async (req, res) => {
  try {
    const { role } = req.body;

    if (!role || !ROLE_PHONES[role]) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const phone = ROLE_PHONES[role];
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP
    otpStore[role] = { otp, expiresAt };

    // Send via SMS
    await sendSMS(phone, otp);

    return res.json({
      success: true,
      message: `OTP sent to ${phone.slice(0, 6)}****${phone.slice(-2)}`,
    });
  } catch (err) {
    console.error('admin send-otp error:', err);
    return res.status(500).json({ error: err.message || 'Failed to send OTP' });
  }
});

// ─── POST /api/admin/verify-otp ──────────────────────────────────────────────
// Body: { role, otp }
router.post('/verify-otp', async (req, res) => {
  try {
    const { role, otp } = req.body;

    if (!role || !otp) {
      return res.status(400).json({ error: 'role and otp are required' });
    }

    const record = otpStore[role];

    if (!record) {
      return res.status(400).json({ error: 'OTP not found. Please request a new one.' });
    }

    if (Date.now() > record.expiresAt) {
      delete otpStore[role];
      return res.status(400).json({ error: 'OTP expired. Please request a new one.' });
    }

    if (record.otp !== otp.trim()) {
      return res.status(400).json({ error: 'Incorrect OTP. Please try again.' });
    }

    // Success — clear OTP
    delete otpStore[role];

    return res.json({ success: true, message: 'OTP verified successfully' });
  } catch (err) {
    console.error('admin verify-otp error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
