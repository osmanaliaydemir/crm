import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Bu rootlar oturum açmayı gerektirmez.
const publicRoutes = ['/login', '/register', '/forgot-password']

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Cookie içinden token'i kontrol et
    const token = request.cookies.get('token')?.value

    const isPublicRoute = publicRoutes.includes(pathname)

    // Kullanıcı login olmuşsa ve login sayfasına girmeye çalışıyorsa CRM dashboard'a yönlendir.
    if (token && isPublicRoute) {
        return NextResponse.redirect(new URL('/crm', request.url))
    }

    // Kullanıcı login OLMAMIŞSA ve korunmalı rotalara girmek istiyorsa (örn: /crm, /finance) logine yönlendir.
    if (!token && !isPublicRoute) {
        // Ana sayfaya `/` gitmeye çalışıyorsa da logine yönlendir (Eğer public sayfa istenmiyorsa)
        return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next()
}

// Hangi rotalarda middleware çalışsın?
export const config = {
    matcher: [
        /*
         * Aşağıdaki patternler hariç tüm routelarla eşleş:
         * - api (API route'lar)
         * - _next/static (Statik dosyalar)
         * - _next/image (Görsel optimizasyon dosyaları)
         * - favicon.ico (Sekme ikonu)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
