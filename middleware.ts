// import { NextRequest, NextResponse } from "next/server";

// export function middleware(request: NextRequest) {
//     const unauthorized = request.cookies.get("unauthorized")?.value;
//     const pathname = request.nextUrl.pathname;

//     // 1️⃣ Block ALL routes (except /unauthorized) if unauthorized cookie is set
//     if (unauthorized === "1" && pathname !== "/unauthorized") {
//         const url = new URL("/unauthorized", request.url);
//         const response = NextResponse.redirect(url);
//         // Always refresh cookie
//         response.cookies.set("unauthorized", "1", { path: "/", maxAge: 60 * 10 });
//         return response;
//     }

//     // 2️⃣ Allow /unauthorized page always (even if cookie not set)
//     return NextResponse.next();
// }

// export const config = {
//     matcher: [
//         "/((?!_next/static|_next/image|favicon.ico|assets|api).*)"
//     ],
// };

// middleware.ts — only guard “am I logged in?” (edge-safe)
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function middleware(req: NextRequest) {
    const sessionToken = getSessionCookie(req);
    const p = req.nextUrl.pathname;

    // // if you’re _not_ logged in, block everything but /login
    // if (!sessionToken && p !== "/login") {
    //     return NextResponse.redirect(new URL("/login", req.url));
    // }

    // // if you _are_ logged in, block /login
    // if (sessionToken && p === "/login") {
    //     return NextResponse.redirect(new URL("/dashboard", req.url));
    // }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};