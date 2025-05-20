// lib/email.ts
import { Resend } from 'resend';
import { ReactElement } from 'react';

const resend = new Resend(process.env.RESEND_API_KEY);

type EmailParams =
    | {
        to: string;
        subject: string;
        html: ReactElement; // HTML template as a React component
    }
    | {
        to: string;
        subject: string;
        text: string; // fallback if you only want plain text
    };

export async function sendEmail(params: EmailParams) {
    const from = process.env.FROM_EMAIL!;

    const { error } = await resend.emails.send({
        from,
        to: params.to,
        subject: params.subject,
        ...(inHtmlMode(params) ? { react: params.html } : { text: params.text }),
    });

    if (error) {
        console.error('Failed to send email:', error);
        throw new Error('Failed to send email');
    }
}

function inHtmlMode(params: EmailParams): params is Extract<EmailParams, { html: ReactElement }> {
    return 'html' in params;
}