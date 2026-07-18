import type { PaginatedData, GlobalPageProps } from './global';
import type { Customer } from './customer';
import type { Product } from './product';

export interface TradeIn {
    id: number;
    purchase_number: string;
    customer_id: number | null;
    item_name: string;
    specification_summary: string | null;
    purchase_price: number;
    created_at: string;
    updated_at: string;
    customer?: Customer;
}

export interface OnlineBooking {
    id: number;
    booking_number: string;
    customer_name: string;
    customer_phone: string;
    product_id: number | null;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'expired';
    expires_at: string | null;
    created_at: string;
    updated_at: string;
    product?: Product;
}

export interface TradeInPageProps extends GlobalPageProps {
    tradeIns: PaginatedData<TradeIn>;
    filters: {
        search: string | null;
    };
}

export interface OnlineBookingPageProps extends GlobalPageProps {
    bookings: PaginatedData<OnlineBooking>;
    filters: {
        search: string | null;
    };
}
