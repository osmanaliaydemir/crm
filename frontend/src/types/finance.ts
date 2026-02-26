export type TransactionTypeEnum = "in" | "out";

export type TransactionStatus = "Tamamlandı" | "Bekliyor" | "İptal Edildi";

export interface Transaction {
    id: string;
    date: string;
    description: string;
    type: TransactionTypeEnum;
    category: string;
    amount: number;
    status: TransactionStatus;
}
