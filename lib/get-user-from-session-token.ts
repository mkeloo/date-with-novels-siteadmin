import { db } from "@/drizzle/db";
import { session as sessionTable, user as users } from "@/drizzle/schema/schema";
import { eq } from "drizzle-orm";

// Takes the raw session token string, returns the user row (or null)
export async function getUserFromSessionToken(sessionToken: string) {
    // 1. Lookup session by token
    const sessionArr = await db.select().from(sessionTable)
        .where(eq(sessionTable.token, sessionToken)).limit(1);
    const session = sessionArr[0];
    if (!session) return null;

    // 2. Lookup user by session.userId
    const userArr = await db.select().from(users)
        .where(eq(users.id, session.userId)).limit(1);
    return userArr[0] || null;
}