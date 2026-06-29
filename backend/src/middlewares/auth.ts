import { Request, Response, NextFunction } from "express"
import { jwtVerify } from "jose"

// Extend Express Request type to include logged-in User detail
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    role: "STUDENT" | "MODERATOR" | "ADMIN"
    tier: "FREE" | "PREMIUM"
  }
}

const ROLE_HIERARCHY = {
  STUDENT: 1,
  MODERATOR: 2,
  ADMIN: 3,
}

// Global Auth verification Middleware
export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: "Access denied. Action requires auth token session." })
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || "lumis_jwt_secret_key_change_me_in_production"
    const secret = new TextEncoder().encode(jwtSecret)
    
    // Verify JWT payload details
    const { payload } = await jwtVerify(token, secret)
    
    req.user = {
      id: payload.sub as string,
      role: (payload.role as "STUDENT" | "MODERATOR" | "ADMIN") || "STUDENT",
      tier: (payload.tier as "FREE" | "PREMIUM") || "FREE",
    }
    
    next()
  } catch (err) {
    return res.status(401).json({ error: "Session validation parameters are invalid or expired." })
  }
}

// Role-Based Auth Guard decorator
export function requireRole(minRole: "STUDENT" | "MODERATOR" | "ADMIN") {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Access denied. Sessions validation missing context." })
    }

    const userRoleValue = ROLE_HIERARCHY[req.user.role]
    const requiredRoleValue = ROLE_HIERARCHY[minRole]

    if (userRoleValue < requiredRoleValue) {
      return res.status(403).json({ error: "Access denied. Privilege parameters out of scope." })
    }

    next()
  }
}
