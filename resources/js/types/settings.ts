import type { PaginatedData, GlobalPageProps } from './global';
import type { Customer } from './customer';

export interface ChatLog {
    id: number;
    sender_name: string;
    phone: string;
    message: string;
    final_intent: string | null;
    svm_confidence_score: number | null;
    is_svm_successful: boolean;
    resolved_by: 'ai' | 'human' | null;
    created_at: string;
    updated_at: string;
    customer?: Customer;
}

export interface LogsPageProps extends GlobalPageProps {
    logs: PaginatedData<ChatLog>;
    filters: {
        search: string | null;
        intent: string | null;
    };
    intentStats?: { name: string; value: number }[];
    sourceStats?: { name: string; value: number }[];
}
