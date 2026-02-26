import { Command } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen w-full font-sans bg-background">
            {/* Sol Taraf: Marka & Bilgi (Sadece Masaüstü) */}
            <div className="relative hidden lg:flex w-1/2 flex-col justify-between p-12 overflow-hidden bg-zinc-950 text-white">
                {/* Yarı Saydam Parlama (Glow) Efektleri */}
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/30 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-[40%] left-[60%] w-72 h-72 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex items-center gap-3 font-bold text-2xl tracking-tight">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                        <Command className="size-6" />
                    </div>
                    Universal CRM
                </div>

                <div className="relative z-10 space-y-6 max-w-lg">
                    <h1 className="text-5xl font-extrabold tracking-tight leading-[1.1] text-transparent bg-clip-text bg-linear-to-br from-white to-white/60">
                        İşletmeniz İçin Yeni Nesil Yönetim
                    </h1>
                    <p className="text-zinc-400 text-lg leading-relaxed">
                        Müşterilerinizi, finansal süreçlerinizi ve ekibinizi tek bir noktadan, güvenle yönetin. Akıllı içgörüler ile büyümeye odaklanın.
                    </p>

                    <div className="flex items-center gap-4 pt-4">
                        <div className="flex -space-x-3">
                            <img className="w-10 h-10 rounded-full border-2 border-zinc-950" src="https://i.pravatar.cc/100?img=11" alt="Avatar" />
                            <img className="w-10 h-10 rounded-full border-2 border-zinc-950" src="https://i.pravatar.cc/100?img=12" alt="Avatar" />
                            <img className="w-10 h-10 rounded-full border-2 border-zinc-950" src="https://i.pravatar.cc/100?img=13" alt="Avatar" />
                        </div>
                        <div className="text-sm">
                            <p className="font-semibold text-white">10.000+ İşletme</p>
                            <p className="text-zinc-500">Bize güveniyor</p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-sm font-medium text-zinc-500">
                    © {new Date().getFullYear()} Universal Yazılım A.Ş. Tüm Hakları Saklıdır.
                </div>
            </div>

            {/* Sağ Taraf: Kimlik Doğrulama Formları */}
            <div className="flex flex-1 items-center justify-center p-8 sm:p-12 relative bg-background/50 backdrop-blur-xl">
                {/* Mobil/Küçük Ekranlar İçin Logo */}
                <div className="absolute top-8 left-8 lg:hidden flex items-center gap-2 font-bold text-xl">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md">
                        <Command className="size-4" />
                    </div>
                    Universal
                </div>

                <div className="w-full max-w-[400px] animate-in fade-in zoom-in-95 duration-500">
                    {children}
                </div>
            </div>
        </div>
    );
}
