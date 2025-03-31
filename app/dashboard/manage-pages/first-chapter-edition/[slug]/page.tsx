// app/dashboard/manage-pages/first-chapter-edition/[slug]/page.tsx
import { notFound } from "next/navigation"
import { getPackageTierBySlug } from "../../../../actions/siteadmin/packageTiers"

type Params = { params: { slug: string } }

export default async function FirstChapterPage({ params }: Params) {
    const { slug } = await params;  // <-- destructure this first

    if (!slug) return notFound();

    const data = await getPackageTierBySlug(slug);  // <-- now use slug directly

    if (!data || data.tier_type !== "first_chapter") return notFound();

    return (
        <main className="p-6">
            <h1 className="text-2xl font-bold">{data.name}</h1>
            <p className="text-muted-foreground">{data.short_description}</p>
        </main>
    );
}