import express from "express";
import { db } from "../firebase.js";

const router = express.Router();

// ══════════════════════════════════════════════════════════════
// BRANDS
// ══════════════════════════════════════════════════════════════

// GET /api/catalog/brands
router.get("/brands", async (req, res) => {
  try {
    const snap = await db.collection("brands").orderBy("sortOrder").get();
    const brands = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.json({ success: true, brands });
  } catch (err) {
    // If no index yet, fallback without orderBy
    try {
      const snap = await db.collection("brands").get();
      const brands = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return res.json({ success: true, brands });
    } catch (err2) {
      console.error("[catalog] get brands error:", err2);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
});

// POST /api/catalog/brands
router.post("/brands", async (req, res) => {
  try {
    const { name, models, active, sortOrder } = req.body;
    if (!name) return res.status(400).json({ error: "name is required" });
    const data = {
      name,
      models: models || [],
      active: active !== false,
      sortOrder: sortOrder || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const ref = await db.collection("brands").add(data);
    return res.status(201).json({ success: true, id: ref.id });
  } catch (err) {
    console.error("[catalog] post brand error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/catalog/brands/:id
router.patch("/brands/:id", async (req, res) => {
  try {
    const updates = { ...req.body, updatedAt: new Date().toISOString() };
    await db.collection("brands").doc(req.params.id).update(updates);
    return res.json({ success: true });
  } catch (err) {
    console.error("[catalog] patch brand error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/catalog/brands/:id
router.delete("/brands/:id", async (req, res) => {
  try {
    await db.collection("brands").doc(req.params.id).delete();
    return res.json({ success: true });
  } catch (err) {
    console.error("[catalog] delete brand error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ══════════════════════════════════════════════════════════════
// ISSUES
// ══════════════════════════════════════════════════════════════

// GET /api/catalog/issues
router.get("/issues", async (req, res) => {
  try {
    const snap = await db.collection("issues").get();
    const issues = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Sort: live first, then other
    issues.sort((a, b) => {
      if (a.category === b.category) return (a.name || "").localeCompare(b.name || "");
      return a.category === "live" ? -1 : 1;
    });
    return res.json({ success: true, issues });
  } catch (err) {
    console.error("[catalog] get issues error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/catalog/issues
router.post("/issues", async (req, res) => {
  try {
    const { name, icon, time, category, active } = req.body;
    if (!name) return res.status(400).json({ error: "name is required" });
    const data = {
      name,
      icon: icon || "Wrench",
      time: time || "60 min",
      category: category || "other",
      active: active !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const ref = await db.collection("issues").add(data);
    return res.status(201).json({ success: true, id: ref.id });
  } catch (err) {
    console.error("[catalog] post issue error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/catalog/issues/:id
router.patch("/issues/:id", async (req, res) => {
  try {
    const updates = { ...req.body, updatedAt: new Date().toISOString() };
    await db.collection("issues").doc(req.params.id).update(updates);
    return res.json({ success: true });
  } catch (err) {
    console.error("[catalog] patch issue error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/catalog/issues/:id
router.delete("/issues/:id", async (req, res) => {
  try {
    await db.collection("issues").doc(req.params.id).delete();
    return res.json({ success: true });
  } catch (err) {
    console.error("[catalog] delete issue error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
