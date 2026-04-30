import express from "express";
import { db } from "../firebase.js";

const router = express.Router();

// ─── GET /api/services ────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const snap = await db.collection("services").orderBy("brand").get();
    const services = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.json({ success: true, services });
  } catch (err) {
    console.error("[services] get error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /api/services ───────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { brand, model, issue, price, oldPrice, isLiveRepair, duration, warranty, active } = req.body;
    if (!brand || !issue || !price) {
      return res.status(400).json({ error: "brand, issue, and price are required" });
    }
    const data = {
      brand, model: model || "", issue, price: Number(price),
      oldPrice: oldPrice ? Number(oldPrice) : null,
      isLiveRepair: Boolean(isLiveRepair),
      duration: duration || "60 min",
      warranty: warranty || "6 months",
      active: active !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const ref = await db.collection("services").add(data);
    return res.status(201).json({ success: true, id: ref.id });
  } catch (err) {
    console.error("[services] post error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── PATCH /api/services/:id ──────────────────────────────────────────────────
router.patch("/:id", async (req, res) => {
  try {
    const updates = { ...req.body, updatedAt: new Date().toISOString() };
    // Coerce number fields
    if (updates.price    !== undefined) updates.price    = Number(updates.price);
    if (updates.oldPrice !== undefined) updates.oldPrice = updates.oldPrice ? Number(updates.oldPrice) : null;
    await db.collection("services").doc(req.params.id).update(updates);
    return res.json({ success: true });
  } catch (err) {
    console.error("[services] patch error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── DELETE /api/services/:id ─────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    await db.collection("services").doc(req.params.id).delete();
    return res.json({ success: true });
  } catch (err) {
    console.error("[services] delete error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
