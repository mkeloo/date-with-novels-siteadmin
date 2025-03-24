"use client"

import { toast } from "sonner"

import { Button } from "@/components/ui/button"

export function SonnerDemo() {
    return (
        <div className="flex flex-col lg:flex-row items-start gap-4">
            <Button
                variant="outline"
                onClick={() =>
                    toast.success("Event has been created", {
                        description: "Sunday, December 03, 2023 at 9:00 AM",
                        action: {
                            label: "Undo",
                            onClick: () => console.log("Undo"),
                        },
                    })
                }
            >
                Show Success Toast
            </Button>
            <Button
                variant="outline"
                onClick={() =>
                    toast.warning("Warning: Event creation failed", {
                        description: "Please try again later.",
                        action: {
                            label: "Retry",
                            onClick: () => console.log("Retry"),
                        },
                    })
                }
            >
                Show Warning Toast
            </Button>
            <Button
                variant="outline"
                onClick={() =>
                    toast.error("Error: Event creation failed", {
                        description: "Please try again later.",
                        action: {
                            label: "Retry",
                            onClick: () => console.log("Retry"),
                        },
                    })
                }

            >
                Show Error Toast
            </Button>
            <Button
                variant="outline"
                onClick={() =>
                    toast.info("Info: Event creation in progress", {
                        description: "Please wait...",
                        action: {
                            label: "Cancel",
                            onClick: () => console.log("Cancel"),
                        },
                    })
                }
            >
                Show Info Toast
            </Button>
            <Button
                variant="outline"
                onClick={() =>
                    toast("This is a default toast", {
                        description: "It doesn't have any type",
                        action: {
                            label: "Okay",
                            onClick: () => console.log("Okay"),
                        },
                    })
                }
            >
                Show Default Toast
            </Button>
        </div>
    )
}
