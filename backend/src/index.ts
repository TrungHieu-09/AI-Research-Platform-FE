import express from "express"
import cors from "cors"
import dotenv from "dotenv"

// Routing imports
// Note: Handlers will be mapped down below
import { authRouter } from "./routes/auth.js"
import { docRouter } from "./routes/documents.js"
import { aiRouter } from "./routes/ai.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Shared Global Middlewares
app.use(cors())
app.use(express.json())

// Mount API Route Endpoints
app.use("/api/auth", authRouter)
app.use("/api/documents", docRouter)
app.use("/api/ai", aiRouter)

// Base Health Check Route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date() })
})

// Listen to port
app.listen(PORT, () => {
  console.log(`Lumis API Platform server is running on http://localhost:${PORT}`)
})
