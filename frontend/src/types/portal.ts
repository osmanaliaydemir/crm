export interface PortalSummary {
    totalOrderAmount: number;
    totalInvoiceAmount: number;
    pendingPaymentAmount: number;
    outstandingBalance: number;
}

export interface PortalOrder {
    id: string;
    orderNumber: string;
    orderDate: string;
    totalAmount: number;
    status: string;
}

export interface PortalInvoice {
    id: string;
    invoiceNumber: string;
    invoiceDate: string;
    totalAmount: number;
    dueDate: string;
    status: string;
}
