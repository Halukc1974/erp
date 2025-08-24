import bcrypt from "bcrypt";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";

// Simple user store for development
const users = [
  {
    id: "admin",
    username: "admin",
    password: "$2b$10$8Zx3ZQZxZKxZ8xZxZxZxZOH5yKyKyKyKyKyKyKyKyKyKyKyKyKyK", // "dev" hashed
    email: "admin@example.com",
    firstName: "Admin",
    lastName: "User",
    role: "admin"
  }
];

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres.xtsczsqpetyumpkawiwl:A1s1d1f1a1s1d1f1@aws-0-us-east-1.pooler.supabase.com:5432/postgres";
  const sessionStore = new pgStore({
    conString: DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  return session({
    secret: process.env.SESSION_SECRET || "dev-secret-key",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to false for development
      maxAge: sessionTtl,
    },
  });
}

export async function setupLocalAuth(app: Express) {
  app.use(getSession());

  // Login route
  app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }

    // Find user
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // For development, allow plain password "dev" or check hash
    const isValidPassword = password === "dev" || await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Set session
    (req.session as any).user = {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      claims: {
        sub: user.id,
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName
      }
    };

    res.json({ 
      message: "Login successful", 
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  });

  // Logout route
  app.post("/api/logout", (req, res) => {
    req.session?.destroy(() => {
      res.json({ message: "Logout successful" });
    });
  });

  // Get current user route
  app.get("/api/auth/user", (req: any, res) => {
    if (!req.session?.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    res.json(req.session.user);
  });
}

export const isAuthenticated: RequestHandler = (req: any, res, next) => {
  if (!req.session?.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  // Set user for compatibility with existing code
  req.user = req.session.user;
  req.isAuthenticated = () => true;
  
  next();
};