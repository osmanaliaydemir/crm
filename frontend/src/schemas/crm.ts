import { z } from "zod";

export const customerSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(2, "Firma/Kişi adı en az 2 karakter olmalıdır."),
    type: z.enum(["B2B", "B2C"]),
    contactName: z.string().min(2, "Yetkili kişi adı gereklidir."),
    email: z.string().email("Geçerli bir e-posta adresi giriniz."),
    phone: z.string().min(10, "Geçerli bir telefon numarası giriniz."),
    city: z.string().min(2, "Şehir bilgisi gereklidir."),
    status: z.string(),
    healthScore: z.number().min(0).max(100).default(100)
});

export type CustomerFormValues = z.infer<typeof customerSchema>;
