import type { PaginatedData, GlobalPageProps } from './global';

export interface CashflowTransaction {
    id: number;
    transaction_date: string;
    type: 'income' | 'expense';
    category: string;
    amount: number;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface ProfitLossReportItem {
    month: string;
    month_number: number;
    income: number;
    expense: number;
    profit: number;
}

export interface CashflowPageProps extends GlobalPageProps {
    transactions: PaginatedData<CashflowTransaction>;
    summary: {
        income_today: number;
        expense_today: number;
    };
    filters: {
        search?: string | null;
    };
}

export interface ProfitLossPageProps extends GlobalPageProps {
    reports: ProfitLossReportItem[];
    year: number;
}
