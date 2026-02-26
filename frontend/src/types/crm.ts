export type CustomerType = "B2B" | "B2C";

export interface Customer {
    id: string;
    name: string;
    type: CustomerType;
    contactName: string;
    email: string;
    phone: string;
    city: string;
    status: string;
    healthScore: number;
}

export interface Interaction {
    id: string;
    customerId: string;
    type: string;
    title: string;
    description: string;
    date: string;
    icon?: React.ReactNode;
    color?: string;
}

export interface CustomerFile {
    id: string;
    customerId: string;
    name: string;
    size: string;
    date: string;
    type: string;
}
