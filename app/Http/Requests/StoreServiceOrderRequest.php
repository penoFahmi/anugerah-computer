<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreServiceOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Pastikan hanya user yang login yang bisa menambah servisan
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            // Identitas Pelanggan
            'phone' => ['required', 'string', 'max:25'],
            'name' => ['required_without:customer_id', 'nullable', 'string', 'max:150'],
            'customer_id' => ['nullable', 'exists:customers,id'],

            // Identitas Perangkat
            'device_id' => ['nullable', 'exists:devices,id'],
            'device_type' => ['required_without:device_id', 'nullable', 'string', 'max:50'],
            'brand' => ['nullable', 'string', 'max:50'],
            'model' => ['nullable', 'string', 'max:100'],

            // Detail Servis
            'complaint' => ['required', 'string'],
            'equipments' => ['nullable', 'array'],
            
            // Pengondisian Teknisi & Biaya
            'is_technician_on_site' => ['boolean'],
            'estimated_cost' => ['nullable', 'numeric', 'min:0'],
            'down_payment' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}