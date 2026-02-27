import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Bu rootlar oturum açmayı gerektirmez.
const publicRoutes = ['/login', '/register', '/forgot-password']

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Cookie içinden token'i kontrol et
    const token = request.cookies.get('token')?.value

    const isPublicRoute = publicRoutes.includes(pathname)

    // A - Kullanıcı giriş yapmamışsa
    if (!token) {
        // Zaten login veya register gibi public bir sayfadaysa devam etsin
        if (isPublicRoute) {
            return NextResponse.next()
        }

        // Public olmayan bir sayfaya (örneğin /crm veya /) erişmeye çalışıyorsa her zaman logine at
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // B - Kullanıcı giriş YAPMIŞSA
    if (token) {
        // Oturum açmış biri /login veya /register gibi public sayfalara gelirse ana sayfaya atılsın
        if (isPublicRoute) {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    // Aksi durumlarda (Giriş yapmış ve /employee-portal, /crm yolunda) devam et
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
