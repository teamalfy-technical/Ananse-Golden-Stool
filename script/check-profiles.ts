import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { profiles } from "../shared/schema.js";
import * as dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

async function checkProfiles() {
    if (!process.env.DATABASE_URL) {
        console.error("DATABASE_URL environment variable is not set");
        process.exit(1);
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool);

    try {
        const allProfiles = await db.select().from(profiles);
        console.log("Found profiles:");
        console.table(allProfiles.map(p => ({
            userId: p.userId,
            role: p.role,
            displayName: p.displayName,
            createdAt: p.createdAt
        })));
    } catch (error) {
        console.error("Error checking profiles:", error);
    } finally {
        await pool.end();
    }
}

checkProfiles();
