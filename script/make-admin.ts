import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { eq } from "drizzle-orm";
import { profiles } from "../shared/schema.js";

const { Pool } = pg;

async function makeAdmin() {
  const userId = process.argv[2];
  
  if (!userId) {
    console.error("Usage: npx tsx script/make-admin.ts <user-id>");
    console.error("");
    console.error("To find your user ID:");
    console.error("1. Log into the app with Replit Auth");
    console.error("2. Check the 'users' table in the database");
    console.error("   or look at the network requests to /api/auth/user");
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  try {
    // Check if profile exists
    const [existingProfile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId));

    if (existingProfile) {
      // Update existing profile to admin
      await db
        .update(profiles)
        .set({ role: "admin", updatedAt: new Date() })
        .where(eq(profiles.userId, userId));
      console.log(`✅ Updated existing profile to admin for user: ${userId}`);
    } else {
      // Create new admin profile
      await db.insert(profiles).values({
        userId,
        role: "admin",
        displayName: "Admin",
      });
      console.log(`✅ Created new admin profile for user: ${userId}`);
    }

    console.log("");
    console.log("You can now access the admin panel at /admin");
  } catch (error) {
    console.error("Error updating profile:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

makeAdmin();
