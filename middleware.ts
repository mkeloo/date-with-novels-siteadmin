import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const PUBLIC_ROUTES = ["/login"];
const ADMIN_ONLY_ROUTES = ["/dashboard"];

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const sessionToken = getSessionCookie(request);

    // Only check if session cookie exists, do NOT try to do DB access here.
    if (!sessionToken && ADMIN_ONLY_ROUTES.some(route => pathname.startsWith(route))) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }
    // Optionally: If you want to prevent logged in users from seeing /login, do that here with just cookie.
    return NextResponse.next();
}

export const config = {
    runtime: "nodejs",
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}