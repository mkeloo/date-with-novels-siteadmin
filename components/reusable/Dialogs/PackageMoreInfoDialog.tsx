"use client"
import { getPackageDescriptionByPackageId, PackageDescription } from '@/app/actions/siteadmin/package_descriptions'
import { getPackageTierById } from "@/app/actions/siteadmin/package_tier"
import { Packages } from '@/app/actions/siteadmin/packages'
import { format } from 'date-fns'
import React, { useEffect, useState } from 'react'

export default function DialogContentBody({ tier }: { tier: Packages }) {
    const [packageDescription, setPackageDescription] = useState<PackageDescription | null>(null)
    const [packageTierName, setPackageTierName] = useState<string>("")
    const [loading, setLoading] = useState(true)



    useEffect(() => {
        async function fetchDetails() {
            try {
                const [desc, tierDetails] = await Promise.all([
                    getPackageDescriptionByPackageId(tier.id),
                    getPackageTierById(tier.package_tier)
                ])

                setPackageDescription(desc)
                setPackageTierName(tierDetails?.name ?? "")
            } catch (err) {
                console.error("Failed to fetch data for package ID:", tier.id, err)
            } finally {
                setLoading(false)
            }
        }

        fetchDetails()
    }, [tier.id, tier.package_tier])

    return (
        <div className="text-sm space-y-1">
            <p><strong>Package Name:</strong> {tier.name}</p>
            <p><strong>Short Description:</strong> {tier.short_description || "None"}</p>
            <p><strong>Package Tier:</strong> {packageTierName}</p>
            <p><strong>Slug:</strong> {tier.slug}</p>
            <p><strong>Enabled:</strong> {tier.is_enabled ? "Yes" : "No"}</p>
            <p><strong>Sort Order:</strong> {tier.sort}</p>
            <p><strong>Icon Name:</strong> {tier.icon_name}</p>
            <p><strong>Theme ID:</strong> {tier.theme_id ?? "None"}</p>
            <p><strong>Price:</strong> ${tier.price.toFixed(2)}</p>
            <p><strong>Genres:</strong> {tier.allowed_genres.join(", ")}</p>
            {loading ? (
                <p className="text-muted-foreground">Loading description...</p>
            ) : packageDescription ? (
                <>
                    <p><strong>Package Contents:</strong></p>
                    <ul className="list-disc pl-5">
                        {packageDescription.package_contents.map((item, idx) => (
                            <li key={idx}>{item}</li>
                        ))}
                    </ul>
                </>
            ) : (
                <p className="text-muted-foreground">No description available.</p>
            )}
            <p className="text-xs text-muted-foreground">
                Last Updated: {format(new Date(tier.updated_at), "PPpp")}
            </p>
        </div>
    )
}
