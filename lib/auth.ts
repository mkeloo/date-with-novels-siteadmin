import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/drizzle/db";
import { schema, user as users } from "@/drizzle/schema/schema";
import { nextCookies } from "better-auth/next-js";
import { admin as adminPlugin } from "better-auth/plugins";
import { eq } from "drizzle-orm";

import { sendVerificationEmail } from "@/lib/send-verification-email";
import { sendPasswordResetEmail } from "@/lib/send-password-reset-email";

// Define minimal types for user and url
interface AuthUser {
    email: string;
}
export interface VerificationUrl {
    // Define as string if it's just a URL, or expand as needed
    toString(): string;
}

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: 'pg',
        schema,
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        async sendResetPassword(
            { user, url, token }: { user: AuthUser; url: any; token: any },
            request: any
        ) {
            await sendPasswordResetEmail(user.email, url);
        },
    },
    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        async sendVerificationEmail({ user, url }, req) {
            await sendVerificationEmail(user.email, url);
        },
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }
    },
    plugins: [
        nextCookies(),
        adminPlugin({
            adminRoles: ["admin"], // match your use-case!
        })
    ],
    // baseURL: process.env.NEXT_PUBLIC_BASE_URL,

    // events: {
    //     // Add type to ctx (or use 'any' for now)
    //     async afterSignIn(ctx: any) {
    //         const dbUserArr = await db
    //             .select()
    //             .from(users)
    //             .where(eq(users.id, ctx.user.id))
    //             .limit(1);

    //         const dbUser = dbUserArr[0];
    //         if (dbUser) {
    //             ctx.session.userTypeId = dbUser.userTypeId;
    //         }
    //     },
    // },
})
