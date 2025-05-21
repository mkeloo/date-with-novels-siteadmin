// app/page.tsx
import { redirect } from 'next/navigation';
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function Home() {
  // Pass headers() to getSession
  const reqHeaders = await headers();
  const session = await auth.api.getSession({
    headers: reqHeaders,
  });

  // // Not logged in? Go to login
  // if (!session) {
  //   redirect('/login');
  // }

  // // Only allow admins to access dashboard
  // if (session.user.role === 'admin') {
  //   redirect('/dashboard/analytics/ga4-analytics');
  // }

  // // Optionally, redirect regular users elsewhere
  // redirect('/unauthorized');
  // // or: redirect('/profile');



  redirect('/dashboard/analytics/ga4-analytics');

}