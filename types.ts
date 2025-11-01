
export enum Category {
    RECEITA = 'Receita',
    DESPESA = 'Despesa',
    TRANSFERENCIA = 'Transferência de Gado',
    OUTROS = 'Outros',
    PENDENTE = 'Pendente'
}

export interface Transaction {
    id: string;
    date: string;
    description: string;
    amount: number;
    category: Category;
    fileName: string;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
}

export interface MonthlyReport {
    month: string;
    revenue: number;
    expense: number;
    balance: number;
    transactions: Transaction[];
}
