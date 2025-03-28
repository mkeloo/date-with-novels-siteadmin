import { buildTitle } from "@/lib/functions"
import type { Metadata } from "next"
import BookGenresPage from "@/components/siteadmin/Pages/BookGenresClient"

export const metadata: Metadata = {
    title: buildTitle("Book Genres"),
}

export default function Page() {
    return <BookGenresPage />
}