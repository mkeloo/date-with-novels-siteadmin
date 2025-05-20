// emails/VerifyEmail.tsx
import React from "react";

type VerifyEmailProps = {
    verificationUrl: string;
};

export function VerifyEmail({ verificationUrl }: VerifyEmailProps) {
    return (
        <div style={{ fontFamily: "sans-serif", padding: "24px" }}>
            <h1 style={{ fontSize: "20px", marginBottom: "16px" }}>Verify your email address</h1>
            <p>Thank you for signing up for DateWithNovels!</p>
            <p>Please click the button below to verify your email address:</p>
            <a
                href={verificationUrl}
                style={{
                    display: "inline-block",
                    padding: "10px 20px",
                    marginTop: "16px",
                    backgroundColor: "#ec4899",
                    color: "white",
                    borderRadius: "6px",
                    textDecoration: "none",
                }}
            >
                Verify Email
            </a>
            <p style={{ marginTop: "24px", fontSize: "12px", color: "#888" }}>
                If you didn’t request this, you can safely ignore this email.
            </p>
        </div>
    );
}