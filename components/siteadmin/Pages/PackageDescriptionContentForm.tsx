// components/siteadmin/Pages/PackageDescriptionContentForm.tsx
"use client"

export default function PackageDescriptionContentForm({
    mode,
    packageId,
}: {
    mode: "create" | "edit"
    packageId: string | null
}) {
    return (
        <div className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">📄 Package Description Content Form</h2>
            <p>
                <strong>Mode:</strong> {mode}
            </p>
            <p>
                <strong>Package ID:</strong> {packageId ?? "None"}
            </p>
            <div className="mt-4 p-4 border border-dashed rounded bg-muted text-muted-foreground">
                This is a dummy version. You'll see the real form here soon!
            </div>
        </div>
    )
}