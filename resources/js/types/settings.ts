import type { PaginatedData, GlobalPageProps } from './global';
import type { Customer } from './customer';

export interface ChatLog {
    id: number;
    sender_name: string;
    phone: string;
    message: string;
    final_intent: string | null;
    handling_status: string | null;
    svm_confidence_score: number | null;
    is_svm_successful: boolean;
    direction: 'inbound' | 'outbound';
    resolved_by: 'system' | 'nlp_model' | 'llm_model' | 'human' | string | null;
    llm_prompt_tokens?: number | null;
    llm_completion_tokens?: number | null;
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
