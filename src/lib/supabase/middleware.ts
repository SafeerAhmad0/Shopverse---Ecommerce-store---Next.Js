import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
          cookiesToSet.forEach(({ name, value, options }) => {
            // Enhanced secure cookie settings
            const secureOptions = {
              ...options,
              httpOnly: true, // Prevent XSS attacks
              secure: process.env.NODE_ENV === 'production', // HTTPS only in production
              sameSite: 'lax' as const, // CSRF protection
              path: '/',
            }
            supabaseResponse.cookies.set(name, value, secureOptions)
          })
        },
      },
    }
  )

  // Refreshing session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { supabaseResponse, user }
}
