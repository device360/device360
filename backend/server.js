import express    from "express";
import cors       from "cors";
import dotenv     from "dotenv";
import authRoutes     from "./routes/auth.js";
import leadsRoutes    from "./routes/leads.js";
import servicesRoutes from "./routes/services.js";
import catalogRoutes  from "./routes/catalog.js";
import settingsRoutes from "./routes/settings.js";

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:4173",
  "https://device360.in",
  "https://www.device360.in",
  "https://device360-hsni.vercel.app",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (/\.vercel\.app$/.test(origin) || /\.netlify\.app$/.test(origin)) return callback(null, true);
    console.warn(`[CORS] Blocked: ${origin}`);
    return callback(new Error(`CORS: ${origin} not allowed`));
  },
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Device360 backend running 🚀", timestamp: new Date().toISOString() });
});

app.use("/api/auth",     authRoutes);
app.use("/api/leads",    leadsRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/catalog",  catalogRoutes);
app.use("/api/settings", settingsRoutes);

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

app.use((err, req, res, _next) => {
  console.error("[Error]", err.message);
  if (err.message?.includes("CORS")) return res.status(403).json({ error: "CORS error" });
  res.status(500).json({ error: "Internal server error", message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Device360 backend on port ${PORT}`));
