export type TransactionTypeEnum = "in" | "out";

export type TransactionStatus = "Tamamlandı" | "Bekliyor" | "İptal Edildi";

export interface BankAccount {
    id: string;
    name: string;
    type: string;
    detail: string;
    balance: number;
}

export interface Transaction {
    id: string;
    date: string;
    description: string;
    type: TransactionTypeEnum;
    category: string;
    amount: number;
    status: TransactionStatus;
    accountId?: string;
}
