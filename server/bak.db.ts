import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

// Ensure Supabase connection
const DATABASE_URL = process.env.DATABASE_URL?.includes('supabase') 
  ? process.env.DATABASE_URL 
  : "postgresql://postgres.xtsczsqpetyumpkawiwl:A1s1d1f1a1s1d1f1@aws-0-us-east-1.pooler.supabase.com:5432/postgres";

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Configure postgres client for Supabase database
const client = postgres(DATABASE_URL, {
  connect_timeout: 30,
  idle_timeout: 30,
  max_lifetime: 60 * 60,
  prepare: false,
  transform: {
    undefined: null,
  },
  types: {},
  onnotice: () => {},
});

export const db = drizzle(client, { schema });
