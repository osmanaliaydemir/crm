import { create } from 'zustand'

export type NotificationType = "order" | "finance" | "calendar" | "mention" | "system";

export interface AppNotification {
    id: string;
    type: NotificationType;
    title: string;
    description: string;
    time: string;
    read: boolean;
    priority?: "high" | "medium" | "low";
}

interface NotificationState {
    notifications: AppNotification[];
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    deleteNotification: (id: string) => void;
    addNotification: (notification: Omit<AppNotification, "id" | "time" | "read">) => void;
}

const initialNotifications: AppNotification[] = [
    {
        id: "notif-1",
        type: "order",
        title: "Yeni Sipariş Alındı 🎉",
        description: "Global Lojistik firmasından #ORD-2026-08 numaralı 150.000 ₺ değerinde yeni bir sipariş sisteme düştü.",
        time: "5 dakika önce",
        read: false,
        priority: "high"
    },
    {
        id: "notif-2",
        type: "finance",
        title: "Ödeme Gecikti ⚠️",
        description: "TechCorp A.Ş. firmasına ait INV-2026-0045 numaralı faturanın ödemesi 3 gün gecikmede.",
        time: "1 saat önce",
        read: false,
        priority: "high"
    },
    {
        id: "notif-3",
        type: "calendar",
        title: "Toplantı Hatırlatması 📅",
        description: "Proje Kick-off toplantısı 15 dakika sonra 'Ana Toplantı Odası'nda başlayacak. Hazırlıklarınızı tamamlayın.",
        time: "2 saat önce",
        read: false,
        priority: "medium"
    },
    {
        id: "notif-4",
        type: "mention",
        title: "Sizden Bahsedildi",
        description: "Zeynep Aslan, 'ERP Modernizasyon' fırsatında sizden bahsetti: @OsmanAli bu projenin teknik analiz raporunu tamamladık mı?",
        time: "Dün, 14:30",
        read: true,
        priority: "medium"
    },
    {
        id: "notif-5",
        type: "system",
        title: "Sistem Bakımı Tamamlandı",
        description: "Planlı veritabanı bakım çalışması başarıyla tamamlandı. Sistem performansı artırıldı.",
        time: "Dün, 09:00",
        read: true,
        priority: "low"
    },
    {
        id: "notif-6",
        type: "finance",
        title: "Ödeme Alındı 💸",
        description: "Acme Corp firmasından 35.000 ₺ tutarında havale ödemesi hesaba geçti.",
        time: "2 gün önce",
        read: true,
        priority: "low"
    }
]

export const useNotificationStore = create<NotificationState>((set) => ({
    notifications: initialNotifications,

    markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
        )
    })),

    markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map((n) =>
            ({ ...n, read: true })
        )
    })),

    deleteNotification: (id) => set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id)
    })),

    addNotification: (notif) => set((state) => ({
        notifications: [
            {
                ...notif,
                id: `notif-${Date.now()}`,
                time: "Şimdi",
                read: false,
            },
            ...state.notifications
        ]
    }))
}))
