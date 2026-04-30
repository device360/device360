import express from "express";
import { db } from "../firebase.js";

const router = express.Router();

const SETTINGS_DOC = "global"; // single doc in "settings" collection

// ─── GET /api/settings ────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const doc = await db.collection("settings").doc(SETTINGS_DOC).get();
    if (!doc.exists) {
      // Return defaults if nothing saved yet
      return res.json({ success: true, settings: {} });
    }
    return res.json({ success: true, settings: doc.data() });
  } catch (err) {
    console.error("[settings] get error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /api/settings ───────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const updates = {
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    // Merge so we never wipe fields we don't know about
    await db.collection("settings").doc(SETTINGS_DOC).set(updates, { merge: true });
    return res.json({ success: true });
  } catch (err) {
    console.error("[settings] post error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
