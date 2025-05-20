// lib/send-verification-email.tsx
'use server';

import { sendEmail } from './email';
import { VerifyEmail } from '@/emails/VerifyEmail';

export async function sendVerificationEmail(to: string, url: string) {
    await sendEmail({
        to,
        subject: 'Verify your SnapCast email',
        html: <VerifyEmail verificationUrl={url} />,
    });
}