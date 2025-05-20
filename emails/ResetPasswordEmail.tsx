import * as React from "react";

type ResetPasswordEmailProps = {
    resetUrl: string;
};

export function ResetPasswordEmail({ resetUrl }: ResetPasswordEmailProps) {
    return (
        <div style={{ fontFamily: "sans-serif", padding: "24px" }}>
            <h1 style={{ fontSize: "20px", marginBottom: "16px" }}>Reset your password</h1>
            <p>We received a request to reset your DateWithNovels account password.</p>
            <p>Please click the button below to choose a new password:</p>
            <a
                href={resetUrl}
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
                Reset Password
            </a>
            <p style={{ marginTop: "24px", fontSize: "12px", color: "#888" }}>
                If you didn’t request this password reset, you can safely ignore this email.
            </p>
        </div>
    );
}