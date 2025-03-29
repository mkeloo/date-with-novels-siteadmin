import { buildTitle } from "@/lib/functions"
import type { Metadata } from "next"
import BookGenresPage from "@/components/siteadmin/Pages/BookGenresClient"
import BookThemesPage from "@/components/siteadmin/Pages/BookThemesClient"

export const metadata: Metadata = {
    title: buildTitle("Genres & Themes"),
}

export default function Page() {
    return <div className="w-full h-full p-4 flex flex-col lg:flex-row items-start justify-between gap-4">
        <BookThemesPage />
        <BookGenresPage />
    </div>
}