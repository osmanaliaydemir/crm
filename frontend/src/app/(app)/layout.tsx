import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { CommandMenu } from "@/components/command-menu";
import { RouteGuard } from "@/components/route-guard";

export default function AppLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <div className="flex w-full flex-col min-h-screen">
                <AppHeader />
                <main className="flex-1 p-4 bg-muted/20">
                    <RouteGuard>
                        {children}
                    </RouteGuard>
                </main>
            </div>
            <CommandMenu />
        </SidebarProvider>
    );
}
