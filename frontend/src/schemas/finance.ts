import { z } from "zod";

export const transactionSchema = z.object({
    id: z.string().optional(),
    date: z.string().optional(),
    description: z.string().min(2, "Açıklama en az 2 karakter olmalıdır."),
    type: z.enum(["in", "out"], { message: "İşlem tipi seçimi zorunludur." }),
    category: z.string().min(2, "Kategori seçimi zorunludur."),
    amount: z.coerce.number().min(0, "Tutar 0'dan küçük olamaz."),
    status: z.enum(["Tamamlandı", "Bekliyor", "İptal Edildi"], { message: "Durum seçimi zorunludur." })
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;
