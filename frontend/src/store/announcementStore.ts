import { create } from 'zustand'

export type AnnouncementType = "Genel" | "Finans" | "İdari İşler" | "Acil" | "Sistem";

export interface Announcement {
    id: string;
    title: string;
    content: string;
    type: AnnouncementType;
    date: string;
    isActive: boolean;
}

interface AnnouncementState {
    announcements: Announcement[];
    addAnnouncement: (announcement: Omit<Announcement, 'id' | 'date' | 'isActive'>) => void;
    deleteAnnouncement: (id: string) => void;
    toggleAnnouncementStatus: (id: string) => void;
}

// Varsayılan mock veriler
const initialAnnouncements: Announcement[] = [
    {
        id: "ann-1",
        title: "Yeni Şirket Araçları Hakkında",
        content: "Saha ekiplerimiz için temin edilen yeni araçlar önümüzdeki hafta başından itibaren otoparkta yerini alacaktır. Teslimat süreci idari işler koordinasyonunda sağlanacaktır.",
        date: "15 Şubat 2026",
        type: "Genel",
        isActive: true
    },
    {
        id: "ann-2",
        title: "Mart Ayı Yemek Kartı Yüklemeleri",
        content: "Tüm personellerimizin Multinet/Sodexo/Ticket kartlarına Mart ayı bakiye yüklemeleri 10 Şubat itibarıyla gerçekleştirilmiştir. Sistemde aksaklık yaşayanların finans departmanına başvurması rica olunur.",
        date: "10 Şubat 2026",
        type: "Finans",
        isActive: true
    },
    {
        id: "ann-3",
        title: "Ofis İçi Klima ve Isıtma Yenilemesi",
        content: "Merkez binamızın 3. ve 4. katlarında yapılacak olan havalandırma yenileme çalışmaları sebebiyle Cuma günü yarım gün uzaktan çalışma düzenine geçilecektir.",
        date: "05 Şubat 2026",
        type: "İdari İşler",
        isActive: true
    },
    {
        id: "ann-4",
        title: "Sunucu ve Sistem Bakım Çalışması (Kritik)",
        content: "Pazar günü saat 01:00-04:00 arasında gerçekleşecek bakım çalışması sebebiyle CRM sistemlerimiz kısa süreli kesintiler yaşayabilecektir.",
        date: "01 Şubat 2026",
        type: "Sistem",
        isActive: false
    }
];

export const useAnnouncementStore = create<AnnouncementState>((set) => ({
    announcements: initialAnnouncements,

    addAnnouncement: (newAnn) => set((state) => {
        // Mock ID ve Tarih oluşturma (Gerçek projede backend'den gelir)
        const dateObj = new Date();
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const dd = String(dateObj.getDate()).padStart(2, '0');
        const yyyy = dateObj.getFullYear();
        const formattedDate = `${dd}.${mm}.${yyyy}`; // Basit tarih mockup

        const newEntry: Announcement = {
            id: `ann-${Math.floor(Math.random() * 10000)}`,
            title: newAnn.title,
            content: newAnn.content,
            type: newAnn.type,
            date: formattedDate,
            isActive: true
        };

        return {
            announcements: [newEntry, ...state.announcements]
        }
    }),

    deleteAnnouncement: (id) => set((state) => ({
        announcements: state.announcements.filter(a => a.id !== id)
    })),

    toggleAnnouncementStatus: (id) => set((state) => ({
        announcements: state.announcements.map(a =>
            a.id === id ? { ...a, isActive: !a.isActive } : a
        )
    }))
}))
