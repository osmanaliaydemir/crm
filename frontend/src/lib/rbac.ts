import { UserRole } from "@/store/authStore";

type RoutePermissions = {
    [key in UserRole]: string[];
}

// '*' tüm rotalar anlamına gelir. Diğerlerinde ise '/' kesin eşleşme, alt sayfalar ise (örn: /crm) başlayan her şeyi kapsar.
export const ROLE_ROUTES: RoutePermissions = {
    admin: ["*"],
    sales: [
        "/",
        "/crm",
        "/pipeline",
        "/inventory",
        "/orders",
        "/calendar",
        "/reports",
        "/settings/profile"
    ],
    finance: [
        "/",
        "/finance",
        "/reports",
        "/orders",
        "/calendar",
        "/settings/profile"
    ],
    hr: [
        "/",
        "/hr",
        "/calendar",
        "/settings/company",
        "/settings/profile"
    ],
    support: [
        "/",
        "/crm",
        "/orders",
        "/notifications",
        "/settings/profile"
    ],
    employee: [
        "/employee-portal",
        "/settings/profile"
    ]
}

export function isRouteAllowed(pathname: string, role: UserRole): boolean {
    const allowedMap = ROLE_ROUTES[role];
    if (!allowedMap) return false;

    // Eğer admin veya yetkili ise her yere girebilir
    if (allowedMap.includes("*")) return true;

    // '/notifications' vs. gibi global yollar varsa veya tam eşleşme
    return allowedMap.some(route => {
        if (route === "/") {
            return pathname === "/";
        }
        return pathname.startsWith(route);
    });
}

// Menü öğelerini role göre kısıtlayan yardımcı fonksiyon
export function filterMenuItems<T extends { url: string }>(items: T[], role: UserRole): T[] {
    return items.filter(item => isRouteAllowed(item.url, role));
}
