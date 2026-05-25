<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreServiceOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Pastikan ini true agar request diizinkan
    }

    public function rules(): array
    {
        return [
            // Validasi Data Pelanggan
            'customer_name'  => ['required', 'string', 'max:255'],
            'customer_phone' => ['required', 'string', 'max:20'], // Penting untuk WA
            
            // Validasi Data Unit
            'device_type'    => ['nullable', 'string', 'max:50'],
            'brand'          => ['required', 'string', 'max:100'],
            'model'          => ['required', 'string', 'max:100'],
            
            // Validasi Data Servis
            'complaint'             => ['required', 'string'],
            'equipments'            => ['nullable', 'string'], // Bawaan: tas, charger
            'is_technician_on_site' => ['boolean'],
        ];
    }
}