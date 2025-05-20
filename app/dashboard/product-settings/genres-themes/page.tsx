import { buildTitle } from "@/utils/data/functions"
import type { Metadata } from "next"
import BookGenresPage from "@/components/siteadmin/Pages/BookGenresClient"
import BookThemesPage from "@/components/siteadmin/Pages/BookThemesClient"

export const metadata: Metadata = {
    title: buildTitle("Genres & Themes"),
}

export default function Page() {
    return (
        <div className="w-full h-full flex flex-col lg:flex-row items-stretch justify-between gap-4">
            <BookThemesPage />
            <BookGenresPage />
        </div>
    )
}