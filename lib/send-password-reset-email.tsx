// lib/send-password-reset-email.tsx
'use server';

import { sendEmail } from "./email";
import { ResetPasswordEmail } from "@/emails/ResetPasswordEmail";


export async function sendPasswordResetEmail(to: string, url: string) {
    await sendEmail({
        to,
        subject: "Reset your SnapCast password",
        html: <ResetPasswordEmail resetUrl={url} />,
    });
}