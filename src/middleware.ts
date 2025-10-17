import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from './lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request)

  // Check if the request is for admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Allow access to login page
    if (request.nextUrl.pathname === '/admin/login') {
      // If already authenticated, redirect to appropriate dashboard
      if (user) {
        const supabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            cookies: {
              getAll() {
                return request.cookies.getAll()
              },
              setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
              },
            },
          }
        )

        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()

        if (userData?.role === 'super_admin') {
          return NextResponse.redirect(new URL('/admin/super-admin', request.url))
        } else if (userData?.role === 'admin') {
          return NextResponse.redirect(new URL('/admin/dashboard', request.url))
        }
      }
      return supabaseResponse
    }

    // Protect all other admin routes
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // Verify user role from database
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          },
        },
      }
    )

    const { data: userData, error } = await supabase
      .from('users')
      .select('role, account_status')
      .eq('id', user.id)
      .single()

    if (error || !userData) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // Check account status
    if (userData.account_status !== 'active') {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // Check role-based access
    if (request.nextUrl.pathname.startsWith('/admin/super-admin')) {
      if (userData.role !== 'super_admin') {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
    } else if (request.nextUrl.pathname.startsWith('/admin/dashboard')) {
      if (userData.role !== 'admin' && userData.role !== 'super_admin') {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all admin routes except for static files and api routes
     */
    '/admin/:path*',
  ],
}
