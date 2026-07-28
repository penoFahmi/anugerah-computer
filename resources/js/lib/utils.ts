import type { InertiaLinkProps } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

export function formatIndonesianPhone(val: string): string {
    if (!val) return '';
    
    let digits = val.replace(/\D/g, '');
    if (!digits) return val.includes('+') ? '+' : ''; 

    if (digits.startsWith('0')) digits = '62' + digits.substring(1);
    else if (digits.startsWith('8') && digits.length >= 1) digits = '62' + digits;

    let formatted = '+';
    if (digits.length > 0) formatted += digits.substring(0, 2); 
    if (digits.length > 2) formatted += ' ' + digits.substring(2, 5); 
    if (digits.length > 5) formatted += '-' + digits.substring(5, 9); 
    if (digits.length > 9) formatted += '-' + digits.substring(9, 14); 

    return formatted;
}
