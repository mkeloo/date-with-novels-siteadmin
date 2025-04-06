import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // ⏳ Custom session expiration (manual control)
    // const SESSION_EXPIRY_SECONDS = 20 // For testing (custom expiration threshold)
    // const SESSION_COOKIE = 'session_created_at'
    // const sessionCreated = request.cookies.get(SESSION_COOKIE)?.value
    // const now = Date.now()

    // if (sessionCreated) {
    //     const ageInSeconds = (now - parseInt(sessionCreated)) / 1000

    //     if (ageInSeconds > SESSION_EXPIRY_SECONDS) {
    //         const url = request.nextUrl.clone()
    //         url.pathname = '/login'
    //         const response = NextResponse.redirect(url)
    //         response.cookies.delete(SESSION_COOKIE)
    //         response.headers.set('Cache-Control', 'no-store')
    //         return response
    //     }
    // } else {
    //     // Set the cookie with a longer maxAge so it persists for our manual check.
    //     supabaseResponse.cookies.set(SESSION_COOKIE, now.toString(), {
    //         httpOnly: true,
    //         path: '/',
    //         maxAge: 86400, // 1 day, for example
    //     })
    // }


    // Set no-cache header on all responses to avoid stale pages
    supabaseResponse.headers.set('Cache-Control', 'no-store')


    // Do not run code between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    // IMPORTANT: DO NOT REMOVE auth.getUser()

    // const {
    //     data: { user },
    // } = await supabase.auth.getUser()

    // if (
    //     !user &&
    //     !request.nextUrl.pathname.startsWith('/login') &&
    //     !request.nextUrl.pathname.startsWith('/auth')
    // ) {
    //     // no user, potentially respond by redirecting the user to the login page
    //     const url = request.nextUrl.clone()
    //     url.pathname = '/login'
    //     return NextResponse.redirect(url)
    // }

    const {
        data: { user },
        error,
    } = await supabase.auth.getUser()

    // Detect refresh_token_not_found error and force logout
    if (!user && error?.message?.toLowerCase().includes("refresh token not found")) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'

        const response = NextResponse.redirect(url)
        response.cookies.delete('sb-refresh-token')
        response.cookies.delete('sb-access-token')
        response.headers.set('Cache-Control', 'no-store')

        return response
    }

    // If user is logged in and is trying to access the login page, redirect them to /dashboard.
    if (request.nextUrl.pathname.startsWith("/login") && user) {
        const url = request.nextUrl.clone()
        url.pathname = "/dashboard"
        const response = NextResponse.redirect(url)
        response.headers.set('Cache-Control', 'no-store')
        return response
    }

    // If there's no user and the user is trying to access a protected route like /dashboard, redirect them to /login.
    if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
        const url = request.nextUrl.clone()
        url.pathname = "/login"
        const response = NextResponse.redirect(url)
        response.headers.set('Cache-Control', 'no-store')
        return response
    }

    // IMPORTANT: You *must* return the supabaseResponse object as it is.
    // If you're creating a new response object with NextResponse.next() make sure to:
    // 1. Pass the request in it, like so:
    //    const myNewResponse = NextResponse.next({ request })
    // 2. Copy over the cookies, like so:
    //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
    // 3. Change the myNewResponse object to fit your needs, but avoid changing
    //    the cookies!
    // 4. Finally:
    //    return myNewResponse
    // If this is not done, you may be causing the browser and server to go out
    // of sync and terminate the user's session prematurely!

    return supabaseResponse
}